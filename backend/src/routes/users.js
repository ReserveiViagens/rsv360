const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const { authorize, requirePermission } = require("../middleware/auth");
const { db } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Retrieve a paginated list of users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, user, guest]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending, suspended]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get(
  "/",
  [
    authorize(["admin", "manager"]),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("search").optional().trim().escape(),
    query("role").optional().isIn(["admin", "manager", "user", "guest"]),
    query("status")
      .optional()
      .isIn(["active", "inactive", "pending", "suspended"]),
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

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const { search, role, status } = req.query;

    // Build query
    let query = db("users").select(
      "id",
      "name",
      "email",
      "role",
      "status",
      "department",
      "position",
      "phone",
      "avatar_url",
      "created_at",
      "last_login",
    );

    // Apply filters
    if (search) {
      query = query.where(function () {
        this.where("name", "ilike", `%${search}%`).orWhere(
          "email",
          "ilike",
          `%${search}%`,
        );
      });
    }

    if (role) {
      query = query.where("role", role);
    }

    if (status) {
      query = query.where("status", status);
    }

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count("* as count");
    const total = parseInt(count);

    // Get paginated results
    const users = await query
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    // Calculate pagination info
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext,
        hasPrev,
      },
    });
  }),
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
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

    // Check permission - users can see their own profile, managers can see their team
    if (req.user.role !== "admin" && req.user.id !== id) {
      if (req.user.role !== "manager") {
        throw new AppError("Forbidden", 403, "INSUFFICIENT_PERMISSIONS");
      }
    }

    const user = await db("users")
      .where({ id })
      .select(
        "id",
        "name",
        "email",
        "role",
        "status",
        "department",
        "position",
        "phone",
        "avatar_url",
        "bio",
        "preferences",
        "created_at",
        "last_login",
      )
      .first();

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    res.json({
      success: true,
      data: user,
    });
  }),
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  [
    authorize(["admin", "manager"]),
    body("name").trim().isLength({ min: 2, max: 100 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6, max: 128 }),
    body("role").optional().isIn(["admin", "manager", "user", "guest"]),
    body("department").optional().trim(),
    body("position").optional().trim(),
    body("phone").optional().trim(),
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

    const {
      name,
      email,
      password,
      role = "user",
      department,
      position,
      phone,
    } = req.body;

    // Check if email exists
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db("users")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role,
        department,
        position,
        phone,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning([
        "id",
        "name",
        "email",
        "role",
        "status",
        "department",
        "position",
        "phone",
        "created_at",
      ]);

    logger.info(`User created: ${email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  }),
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  [
    param("id").isInt({ min: 1 }).toInt(),
    body("name").optional().trim().isLength({ min: 2, max: 100 }),
    body("email").optional().isEmail().normalizeEmail(),
    body("role").optional().isIn(["admin", "manager", "user", "guest"]),
    body("status")
      .optional()
      .isIn(["active", "inactive", "pending", "suspended"]),
    body("department").optional().trim(),
    body("position").optional().trim(),
    body("phone").optional().trim(),
    body("bio").optional().trim(),
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

    // Check permissions
    if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
      if (req.user.role !== "manager") {
        throw new AppError("Forbidden", 403, "INSUFFICIENT_PERMISSIONS");
      }
    }

    // Don't allow users to change their own role/status
    if (req.user.id === parseInt(id) && req.user.role !== "admin") {
      delete updateData.role;
      delete updateData.status;
    }

    // Check if user exists
    const existingUser = await db("users").where({ id }).first();
    if (!existingUser) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await db("users")
        .where({ email: updateData.email })
        .first();
      if (emailExists) {
        throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
      }
    }

    // Update user
    updateData.updated_at = new Date();

    const [updatedUser] = await db("users")
      .where({ id })
      .update(updateData)
      .returning([
        "id",
        "name",
        "email",
        "role",
        "status",
        "department",
        "position",
        "phone",
        "updated_at",
      ]);

    logger.info(`User updated: ${existingUser.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  }),
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  [authorize(["admin"]), param("id").isInt({ min: 1 }).toInt()],
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

    // Don't allow deleting self
    if (req.user.id === parseInt(id)) {
      throw new AppError(
        "Cannot delete your own account",
        400,
        "CANNOT_DELETE_SELF",
      );
    }

    // Check if user exists
    const user = await db("users").where({ id }).first();
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Soft delete - change status to inactive
    await db("users").where({ id }).update({
      status: "inactive",
      updated_at: new Date(),
    });

    logger.info(`User deleted: ${user.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  }),
);

module.exports = router;
