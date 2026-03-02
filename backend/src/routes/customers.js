const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { db } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { auditLogger } = require("../utils/auditLogger");

/**
 * @swagger
 * /api/customers:
 *   get:
 *     tags: [Customers]
 *     summary: Get all customers
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  [
    authorize(["admin", "manager", "user"]),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("search").optional().trim(),
    query("status").optional().isIn(["active", "inactive", "blocked"]),
    query("type").optional().isIn(["individual", "corporate"]),
    query("vip_level")
      .optional()
      .isIn(["none", "bronze", "silver", "gold", "platinum"]),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    const { page = 1, limit = 10, search, status, type, vip_level } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = db("customers").select(
      "id",
      "name",
      "email",
      "phone",
      "document",
      "city",
      "state",
      "status",
      "type",
      "vip_level",
      "total_bookings",
      "total_spent",
      "last_booking_date",
      "created_at",
    );

    // Apply filters
    if (search) {
      query = query.where(function () {
        this.where("name", "like", `%${search}%`)
          .orWhere("email", "like", `%${search}%`)
          .orWhere("phone", "like", `%${search}%`)
          .orWhere("document", "like", `%${search}%`);
      });
    }

    if (status) {
      query = query.where("status", status);
    }

    if (type) {
      query = query.where("type", type);
    }

    if (vip_level) {
      query = query.where("vip_level", vip_level);
    }

    // Get total count
    const totalQuery = query.clone();
    const total = await totalQuery.count("* as count").first();

    // Get paginated results
    const customers = await query
      .limit(limit)
      .offset(offset)
      .orderBy("created_at", "desc");

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          total: total.count,
          count: customers.length,
          per_page: limit,
          current_page: page,
          total_pages: Math.ceil(total.count / limit),
        },
      },
    });
  }),
);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer by ID
 */
router.get(
  "/:id",
  [
    authorize(["admin", "manager", "user"]),
    param("id").isInt({ min: 1 }).toInt(),
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const customer = await db("customers").where({ id }).first();

    if (!customer) {
      throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND");
    }

    // Get customer's booking history
    const bookings = await db("bookings")
      .where({ user_id: customer.id })
      .select(
        "id",
        "booking_number",
        "title",
        "status",
        "total_amount",
        "start_date",
        "end_date",
        "created_at",
      )
      .orderBy("created_at", "desc")
      .limit(10);

    // Get customer's payment history
    const payments = await db("payments")
      .where({ user_id: customer.id })
      .select(
        "id",
        "transaction_id",
        "amount",
        "status",
        "method",
        "created_at",
      )
      .orderBy("created_at", "desc")
      .limit(10);

    res.json({
      success: true,
      data: {
        customer,
        bookings,
        payments,
        summary: {
          total_bookings: bookings.length,
          total_spent: customer.total_spent,
          average_booking_value: customer.average_booking_value,
          last_booking: customer.last_booking_date,
          vip_level: customer.vip_level,
        },
      },
    });
  }),
);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     tags: [Customers]
 *     summary: Create new customer
 */
router.post(
  "/",
  [
    authorize(["admin", "manager", "user"]),
    body("name").trim().isLength({ min: 2, max: 100 }),
    body("email").isEmail().normalizeEmail(),
    body("phone").optional().trim(),
    body("document").optional().trim(),
    body("document_type").optional().isIn(["cpf", "cnpj", "passport"]),
    body("birth_date").optional().isISO8601().toDate(),
    body("gender").optional().isIn(["M", "F", "Other"]),
    body("address").optional().trim(),
    body("city").optional().trim(),
    body("state").optional().trim(),
    body("zip_code").optional().trim(),
    body("type").optional().isIn(["individual", "corporate"]),
    body("company_name").optional().trim(),
    body("notes").optional().trim(),
    body("preferred_contact").optional().isIn(["email", "phone", "whatsapp"]),
    body("marketing_consent").optional().isBoolean(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    const customerData = {
      ...req.body,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Check if email already exists
    const existingCustomer = await db("customers")
      .where({ email: customerData.email })
      .first();
    if (existingCustomer) {
      throw new AppError(
        "Customer with this email already exists",
        400,
        "EMAIL_EXISTS",
      );
    }

    const [customer] = await db("customers")
      .insert(customerData)
      .returning("*");

    await auditLogger.log(
      req.user.id,
      "customer_created",
      `Customer created: ${customer.name}`,
      { customer_id: customer.id, customer_email: customer.email },
    );

    logger.info(`Customer created: ${customer.email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  }),
);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     tags: [Customers]
 *     summary: Update customer
 */
router.put(
  "/:id",
  [
    authorize(["admin", "manager", "user"]),
    param("id").isInt({ min: 1 }).toInt(),
    body("name").optional().trim().isLength({ min: 2, max: 100 }),
    body("email").optional().isEmail().normalizeEmail(),
    body("phone").optional().trim(),
    body("address").optional().trim(),
    body("city").optional().trim(),
    body("state").optional().trim(),
    body("status").optional().isIn(["active", "inactive", "blocked"]),
    body("vip_level")
      .optional()
      .isIn(["none", "bronze", "silver", "gold", "platinum"]),
    body("notes").optional().trim(),
    body("preferred_contact").optional().isIn(["email", "phone", "whatsapp"]),
    body("marketing_consent").optional().isBoolean(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };

    // Check if customer exists
    const existingCustomer = await db("customers").where({ id }).first();
    if (!existingCustomer) {
      throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND");
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingCustomer.email) {
      const emailExists = await db("customers")
        .where({ email: updateData.email })
        .first();
      if (emailExists) {
        throw new AppError("Email already exists", 400, "EMAIL_EXISTS");
      }
    }

    const [updatedCustomer] = await db("customers")
      .where({ id })
      .update(updateData)
      .returning("*");

    await auditLogger.log(
      req.user.id,
      "customer_updated",
      `Customer updated: ${existingCustomer.name}`,
      { customer_id: id, changes: Object.keys(updateData) },
    );

    logger.info(
      `Customer updated: ${existingCustomer.email} by ${req.user.email}`,
    );

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  }),
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     tags: [Customers]
 *     summary: Delete customer
 */
router.delete(
  "/:id",
  [authorize(["admin", "manager"]), param("id").isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const customer = await db("customers").where({ id }).first();
    if (!customer) {
      throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND");
    }

    // Check if customer has bookings
    const bookingCount = await db("bookings")
      .where({ user_id: id })
      .count("* as count")
      .first();
    if (bookingCount.count > 0) {
      // Soft delete - change status to inactive
      await db("customers").where({ id }).update({
        status: "inactive",
        updated_at: new Date(),
      });

      await auditLogger.log(
        req.user.id,
        "customer_deactivated",
        `Customer deactivated: ${customer.name}`,
        { customer_id: id, reason: "has_bookings" },
      );

      logger.info(
        `Customer deactivated: ${customer.email} by ${req.user.email}`,
      );

      res.json({
        success: true,
        message: "Customer deactivated successfully (has bookings)",
      });
    } else {
      // Hard delete if no bookings
      await db("customers").where({ id }).del();

      await auditLogger.log(
        req.user.id,
        "customer_deleted",
        `Customer deleted: ${customer.name}`,
        { customer_id: id },
      );

      logger.info(`Customer deleted: ${customer.email} by ${req.user.email}`);

      res.json({
        success: true,
        message: "Customer deleted successfully",
      });
    }
  }),
);

/**
 * @swagger
 * /api/customers/stats:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer statistics
 */
router.get(
  "/stats",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    const stats = await db("customers")
      .select(
        db.raw("COUNT(*) as total_customers"),
        db.raw("COUNT(CASE WHEN status = ? THEN 1 END) as active_customers", [
          "active",
        ]),
        db.raw("COUNT(CASE WHEN type = ? THEN 1 END) as individual_customers", [
          "individual",
        ]),
        db.raw("COUNT(CASE WHEN type = ? THEN 1 END) as corporate_customers", [
          "corporate",
        ]),
        db.raw("COUNT(CASE WHEN vip_level != ? THEN 1 END) as vip_customers", [
          "none",
        ]),
        db.raw("AVG(total_spent) as average_customer_value"),
        db.raw("SUM(total_spent) as total_customer_value"),
        db.raw("AVG(total_bookings) as average_bookings_per_customer"),
      )
      .first();

    // VIP level distribution
    const vipDistribution = await db("customers")
      .select("vip_level")
      .count("* as count")
      .where("vip_level", "!=", "none")
      .groupBy("vip_level")
      .orderBy("count", "desc");

    // Top customers by value
    const topCustomers = await db("customers")
      .select(
        "id",
        "name",
        "email",
        "total_spent",
        "total_bookings",
        "vip_level",
      )
      .where("status", "active")
      .orderBy("total_spent", "desc")
      .limit(10);

    // Monthly new customers
    const monthlyStats = await db("customers")
      .select(
        db.raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
        db.raw("COUNT(*) as new_customers"),
      )
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '12 months'"))
      .groupBy(db.raw("TO_CHAR(created_at, 'YYYY-MM')"))
      .orderBy("month");

    res.json({
      success: true,
      data: {
        overview: stats,
        vipDistribution,
        topCustomers,
        monthlyStats,
      },
    });
  }),
);

module.exports = router;
