const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const { authorize } = require("../middleware/auth");
const { db } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { auditData } = require("../utils/auditLogger");
const { notifyBookingUpdate } = require("../utils/websocket");
const moment = require("moment");

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all bookings
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("status")
      .optional()
      .isIn([
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "refunded",
      ]),
    query("type")
      .optional()
      .isIn(["hotel", "flight", "car", "tour", "package", "activity"]),
  ],
  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    let query = db("bookings")
      .leftJoin("users", "bookings.user_id", "users.id")
      .select(
        "bookings.*",
        "users.name as user_name",
        "users.email as user_email",
      );

    // Filter by user if not admin/manager
    if (req.user.role === "user") {
      query = query.where("bookings.user_id", req.user.id);
    }

    // Apply filters
    if (req.query.status) {
      query = query.where("bookings.status", req.query.status);
    }
    if (req.query.type) {
      query = query.where("bookings.type", req.query.type);
    }

    const total = await query.clone().count("* as count").first();
    const bookings = await query
      .orderBy("bookings.created_at", "desc")
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit),
      },
    });
  }),
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking by ID
 */
router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).toInt()],
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

    let query = db("bookings")
      .leftJoin("users", "bookings.user_id", "users.id")
      .select(
        "bookings.*",
        "users.name as user_name",
        "users.email as user_email",
      )
      .where("bookings.id", id);

    // Filter by user if not admin/manager
    if (req.user.role === "user") {
      query = query.where("bookings.user_id", req.user.id);
    }

    const booking = await query.first();

    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    // Audit log
    await auditData.access(req.user.id, "booking", booking.id, req);

    res.json({
      success: true,
      data: booking,
    });
  }),
);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create new booking
 */
router.post(
  "/",
  [
    body("title").trim().isLength({ min: 1, max: 200 }),
    body("description").optional().trim().isLength({ max: 1000 }),
    body("type").isIn([
      "hotel",
      "flight",
      "car",
      "tour",
      "package",
      "activity",
    ]),
    body("start_date").isISO8601().toDate(),
    body("end_date").isISO8601().toDate(),
    body("start_time")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("end_time")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("total_amount").optional().isDecimal({ decimal_digits: "0,2" }),
    body("currency").optional().isLength({ min: 3, max: 3 }),
    body("guests_count").optional().isInt({ min: 1, max: 50 }),
    body("adults_count").optional().isInt({ min: 1, max: 50 }),
    body("children_count").optional().isInt({ min: 0, max: 50 }),
    body("guest_details").optional().isArray(),
    body("special_requests").optional().isArray(),
    body("provider_name").optional().trim(),
    body("user_id").optional().isInt({ min: 1 }),
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

    // Validate dates
    const startDate = new Date(req.body.start_date);
    const endDate = new Date(req.body.end_date);

    if (startDate >= endDate) {
      throw new AppError(
        "End date must be after start date",
        400,
        "INVALID_DATE_RANGE",
      );
    }

    if (startDate < new Date()) {
      throw new AppError(
        "Start date cannot be in the past",
        400,
        "INVALID_START_DATE",
      );
    }

    // Check permission to create booking for other users
    const targetUserId = req.body.user_id || req.user.id;
    if (
      targetUserId !== req.user.id &&
      !["admin", "manager"].includes(req.user.role)
    ) {
      throw new AppError(
        "Cannot create booking for other users",
        403,
        "INSUFFICIENT_PERMISSIONS",
      );
    }

    // Generate unique booking number
    const bookingNumber = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const bookingData = {
      user_id: targetUserId,
      booking_number: bookingNumber,
      title: req.body.title,
      description: req.body.description || null,
      type: req.body.type,
      status: "pending",
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      start_time: req.body.start_time || null,
      end_time: req.body.end_time || null,
      total_amount: req.body.total_amount || 0,
      currency: req.body.currency || "BRL",
      paid_amount: 0,
      pending_amount: req.body.total_amount || 0,
      payment_status: "pending",
      guests_count: req.body.guests_count || 1,
      adults_count: req.body.adults_count || 1,
      children_count: req.body.children_count || 0,
      guest_details: req.body.guest_details
        ? JSON.stringify(req.body.guest_details)
        : null,
      special_requests: req.body.special_requests
        ? JSON.stringify(req.body.special_requests)
        : null,
      provider_name: req.body.provider_name || null,
      created_by: req.user.email,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [booking] = await db("bookings").insert(bookingData).returning("*");

    // Get full booking data with user info
    const fullBooking = await db("bookings")
      .leftJoin("users", "bookings.user_id", "users.id")
      .select(
        "bookings.*",
        "users.name as user_name",
        "users.email as user_email",
      )
      .where("bookings.id", booking.id)
      .first();

    logger.info(
      `Booking created: ${bookingNumber} by ${req.user.email} for user ${fullBooking.user_email}`,
    );

    // Send real-time notification
    await notifyBookingUpdate(booking.id, "created");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: fullBooking,
    });
  }),
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     tags: [Bookings]
 *     summary: Update booking
 */
router.put(
  "/:id",
  [
    param("id").isInt({ min: 1 }).toInt(),
    body("title").optional().trim().isLength({ min: 1, max: 200 }),
    body("description").optional().trim().isLength({ max: 1000 }),
    body("status")
      .optional()
      .isIn([
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "refunded",
      ]),
    body("start_date").optional().isISO8601().toDate(),
    body("end_date").optional().isISO8601().toDate(),
    body("total_amount").optional().isDecimal({ decimal_digits: "0,2" }),
    body("guests_count").optional().isInt({ min: 1, max: 50 }),
    body("special_requests").optional().isArray(),
    body("notes").optional().trim(),
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
    const updateData = req.body;

    // Get existing booking
    const existingBooking = await db("bookings").where({ id }).first();
    if (!existingBooking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    // Check permissions
    if (req.user.role === "user" && existingBooking.user_id !== req.user.id) {
      throw new AppError(
        "Cannot update other users bookings",
        403,
        "INSUFFICIENT_PERMISSIONS",
      );
    }

    // Validate date changes
    if (updateData.start_date && updateData.end_date) {
      const startDate = new Date(updateData.start_date);
      const endDate = new Date(updateData.end_date);

      if (startDate >= endDate) {
        throw new AppError(
          "End date must be after start date",
          400,
          "INVALID_DATE_RANGE",
        );
      }
    }

    // Don't allow status changes to completed if not paid
    if (
      updateData.status === "completed" &&
      existingBooking.payment_status !== "paid"
    ) {
      throw new AppError(
        "Cannot complete booking with pending payment",
        400,
        "PAYMENT_REQUIRED",
      );
    }

    // Update pending amount if total amount changes
    if (updateData.total_amount) {
      updateData.pending_amount =
        parseFloat(updateData.total_amount) -
        parseFloat(existingBooking.paid_amount);
    }

    updateData.updated_at = new Date();
    updateData.updated_by = req.user.email;

    const [updatedBooking] = await db("bookings")
      .where({ id })
      .update(updateData)
      .returning("*");

    logger.info(
      `Booking updated: ${existingBooking.booking_number} by ${req.user.email}`,
    );

    res.json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  }),
);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   post:
 *     tags: [Bookings]
 *     summary: Cancel booking
 */
router.post(
  "/:id/cancel",
  [
    param("id").isInt({ min: 1 }).toInt(),
    body("cancellation_reason").optional().trim().isLength({ max: 500 }),
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
    const { cancellation_reason } = req.body;

    // Get existing booking
    const booking = await db("bookings").where({ id }).first();
    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    // Check permissions
    if (req.user.role === "user" && booking.user_id !== req.user.id) {
      throw new AppError(
        "Cannot cancel other users bookings",
        403,
        "INSUFFICIENT_PERMISSIONS",
      );
    }

    // Check if booking can be cancelled
    if (["cancelled", "refunded", "completed"].includes(booking.status)) {
      throw new AppError(
        "Booking cannot be cancelled in current status",
        400,
        "INVALID_STATUS_CHANGE",
      );
    }

    // Calculate cancellation fee (example: 10% if cancelled within 24h of start)
    const startDate = new Date(booking.start_date);
    const now = new Date();
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);

    let cancellationFee = 0;
    if (hoursUntilStart < 24) {
      cancellationFee = parseFloat(booking.total_amount) * 0.1; // 10% fee
    }

    // Update booking
    await db("bookings")
      .where({ id })
      .update({
        status: "cancelled",
        cancellation_fee: cancellationFee,
        notes: cancellation_reason || "Cancelled by user",
        updated_at: new Date(),
        updated_by: req.user.email,
      });

    logger.info(
      `Booking cancelled: ${booking.booking_number} by ${req.user.email}`,
    );

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        cancellation_fee: cancellationFee,
        refund_amount: parseFloat(booking.paid_amount) - cancellationFee,
      },
    });
  }),
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Delete booking
 */
router.delete(
  "/:id",
  [authorize(["admin"]), param("id").isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const booking = await db("bookings").where({ id }).first();
    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    await db("bookings").where({ id }).del();

    logger.info(
      `Booking deleted: ${booking.booking_number} by ${req.user.email}`,
    );

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  }),
);

/**
 * @swagger
 * /api/bookings/stats:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking statistics
 */
router.get(
  "/stats",
  authorize(["admin", "manager"]),
  asyncHandler(async (req, res) => {
    const stats = await db("bookings")
      .select(
        db.raw("COUNT(*) as total_bookings"),
        db.raw("COUNT(CASE WHEN status = ? THEN 1 END) as pending_bookings", [
          "pending",
        ]),
        db.raw("COUNT(CASE WHEN status = ? THEN 1 END) as confirmed_bookings", [
          "confirmed",
        ]),
        db.raw("COUNT(CASE WHEN status = ? THEN 1 END) as completed_bookings", [
          "completed",
        ]),
        db.raw("COUNT(CASE WHEN status = ? THEN 1 END) as cancelled_bookings", [
          "cancelled",
        ]),
        db.raw("SUM(total_amount) as total_revenue"),
        db.raw("SUM(paid_amount) as paid_revenue"),
        db.raw("AVG(total_amount) as average_booking_value"),
      )
      .first();

    // Monthly bookings trend
    const monthlyTrend = await db("bookings")
      .select(
        db.raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
        db.raw("COUNT(*) as count"),
        db.raw("SUM(total_amount) as revenue"),
      )
      .where("created_at", ">=", db.raw("NOW() - INTERVAL '12 months'"))
      .groupBy(db.raw("TO_CHAR(created_at, 'YYYY-MM')"))
      .orderBy("month");

    // Popular booking types
    const popularTypes = await db("bookings")
      .select("type")
      .count("* as count")
      .groupBy("type")
      .orderBy("count", "desc");

    res.json({
      success: true,
      data: {
        overview: stats,
        monthlyTrend,
        popularTypes,
      },
    });
  }),
);

module.exports = router;
