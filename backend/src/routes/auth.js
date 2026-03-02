const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  generateToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authRateLimit,
  checkAccountLockout,
  authenticateToken,
} = require("../middleware/auth");
const { db } = require("../config/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const crypto = require("crypto");
const securityEventLogCache = new Set();

const logSecurityOnceInTest = (event, details = {}) => {
  if (process.env.NODE_ENV !== "test") {
    logger.logSecurity(event, details);
    return;
  }

  const key = `${event}:${details?.email || details?.userId || "generic"}`;
  if (securityEventLogCache.has(key)) {
    return;
  }

  securityEventLogCache.add(key);
  logger.logSecurity(event, details);
};

// Import new utilities
const {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorToken,
  generateBackupCodes,
  enableTwoFactor,
  disableTwoFactor,
  verifyBackupCode,
  isTwoFactorEnabled,
} = require("../utils/twoFactor");

const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendTwoFactorSetupEmail,
} = require("../utils/emailService");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already exists
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/register",
  [
    authRateLimit,
    // Validation middleware
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6, max: 128 })
      .withMessage("Password must be between 6 and 128 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
    body("role")
      .optional()
      .isIn(["user", "manager"])
      .withMessage("Role must be either user or manager"),
  ],
  asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    const { name, email, password, role = "user" } = req.body;

    // Check if user already exists
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      throw new AppError(
        "Email already registered",
        409,
        "EMAIL_ALREADY_EXISTS",
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [userId] = await db("users")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role,
        status: "active",
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("id");

    // Get created user
    const user = await db("users")
      .where({ id: userId.id || userId })
      .select("id", "name", "email", "role", "status", "created_at")
      .first();

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Log successful registration
    logger.info(`New user registered: ${email} (ID: ${user.id})`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      refreshToken,
      user,
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }),
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *       423:
 *         description: Account locked
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/login",
  [
    authRateLimit,
    checkAccountLockout,
    // Validation middleware
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array(),
      );
    }

    const { email, password } = req.body;

    // Get user with password
    const user = await db("users")
      .where({ email })
      .select(
        "id",
        "name",
        "email",
        "password_hash",
        "role",
        "status",
        "login_attempts",
        "locked_until",
      )
      .first();

    if (!user) {
      logSecurityOnceInTest("Login attempt with non-existent email", {
        email,
        ip: req.ip,
      });

      throw new AppError(
        "Invalid email or password",
        401,
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    // Check if user is active
    if (user.status !== "active") {
      logSecurityOnceInTest("Login attempt with inactive user", {
        userId: user.id,
        email,
        status: user.status,
        ip: req.ip,
      });

      throw new AppError("Account is not active", 401, "AUTH_ACCOUNT_INACTIVE");
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      const maxAttempts = 5;

      let updateData = { login_attempts: newAttempts };

      // Lock account after max attempts
      if (newAttempts >= maxAttempts) {
        const lockDuration = 30 * 60 * 1000; // 30 minutes
        updateData.locked_until = new Date(Date.now() + lockDuration);

        logSecurityOnceInTest("Account locked due to failed login attempts", {
          userId: user.id,
          email,
          attempts: newAttempts,
          ip: req.ip,
        });
      }

      await db("users").where({ id: user.id }).update(updateData);

      logSecurityOnceInTest("Failed login attempt", {
        userId: user.id,
        email,
        attempts: newAttempts,
        ip: req.ip,
      });

      throw new AppError(
        "Invalid email or password",
        401,
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Reset login attempts but don't complete login yet
      await db("users").where({ id: user.id }).update({
        login_attempts: 0,
        locked_until: null,
      });

      logger.info(`2FA required for user: ${email}`);

      return res.json({
        success: true,
        requiresTwoFactor: true,
        message: "Please provide your 2FA token to complete login",
        tempUser: {
          email: user.email,
        },
      });
    }

    // Reset login attempts on successful login
    await db("users").where({ id: user.id }).update({
      login_attempts: 0,
      locked_until: null,
      last_login: new Date(),
      last_login_ip: req.ip,
    });

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Remove sensitive data
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    // Log successful login
    logger.info(`User logged in: ${email} (ID: ${user.id})`);

    res.json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: userResponse,
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }),
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       400:
 *         description: Invalid refresh token
 *       401:
 *         description: Refresh token expired
 */
router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
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

    const { refreshToken } = req.body;

    try {
      // Verify refresh token
      const decoded = verifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );

      // Get user
      const user = await db("users")
        .where({ id: decoded.userId, status: "active" })
        .select("id", "email", "role")
        .first();

      if (!user) {
        throw new AppError("User not found", 401, "AUTH_USER_NOT_FOUND");
      }

      // Generate new access token
      const newToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info(`Token refreshed for user: ${user.email} (ID: ${user.id})`);

      res.json({
        success: true,
        token: newToken,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      });
    } catch (error) {
      logSecurityOnceInTest("Invalid refresh token attempt", {
        token: refreshToken.substring(0, 20) + "...",
        ip: req.ip,
        error: error.message,
      });

      throw new AppError(
        "Invalid or expired refresh token",
        401,
        "AUTH_REFRESH_TOKEN_INVALID",
      );
    }
  }),
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout user (client should discard tokens)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    // In a stateless JWT system, logout is handled client-side
    // For additional security, you could maintain a blacklist of tokens

    logger.info("User logged out");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }),
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     description: Get current authenticated user information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/me",
  require("../middleware/auth").authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await db("users")
      .where({ id: req.user.id })
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
        "preferences",
        "created_at",
        "last_login",
      )
      .first();

    res.json({
      success: true,
      user,
    });
  }),
);

/**
 * @swagger
 * /api/auth/verify-token:
 *   get:
 *     tags: [Authentication]
 *     summary: Verify token validity
 *     description: Check if the provided token is valid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/verify-token",
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        status: req.user.status,
      },
    });
  }),
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset
 *     description: Send password reset email to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 */
router.post(
  "/forgot-password",
  [
    authRateLimit,
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
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

    const { email } = req.body;

    // Find user
    const user = await db("users").where({ email, status: "active" }).first();

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      logSecurityOnceInTest("Password reset attempt for non-existent email", {
        email,
        ip: req.ip,
      });
      return res.json({
        success: true,
        message: "If this email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await db("users").where({ id: user.id }).update({
      password_reset_token: resetToken,
      password_reset_expires: resetExpires,
      updated_at: new Date(),
    });

    // Send reset email
    const emailResult = await sendPasswordResetEmail(
      email,
      resetToken,
      user.name,
    );

    if (!emailResult.success) {
      logger.error("Failed to send password reset email:", emailResult.error);
    }

    logger.info(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: "If this email exists, a password reset link has been sent",
    });
  }),
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 */
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6, max: 128 })
      .withMessage("Password must be between 6 and 128 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
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

    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await db("users")
      .where({
        password_reset_token: token,
        status: "active",
      })
      .where("password_reset_expires", ">", new Date())
      .first();

    if (!user) {
      throw new AppError(
        "Invalid or expired reset token",
        400,
        "INVALID_RESET_TOKEN",
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password and clear reset token
    await db("users").where({ id: user.id }).update({
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null,
      login_attempts: 0, // Reset failed login attempts
      locked_until: null, // Unlock account if locked
      updated_at: new Date(),
    });

    logger.info(`Password reset completed for user: ${user.email}`);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  }),
);

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     tags: [Authentication]
 *     summary: Setup 2FA for user
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/2fa/setup",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Check if 2FA is already enabled
    const twoFactorEnabled = await isTwoFactorEnabled(userId);
    if (twoFactorEnabled) {
      throw new AppError(
        "2FA is already enabled",
        400,
        "TWO_FA_ALREADY_ENABLED",
      );
    }

    // Generate secret and QR code
    const { secret, manualEntryKey, qrCodeUrl } = generateTwoFactorSecret(
      req.user.email,
    );
    const qrCodeImage = await generateQRCode(qrCodeUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Store secret temporarily (not enabled yet)
    await db("users")
      .where({ id: userId })
      .update({
        two_factor_secret: secret,
        recovery_codes: JSON.stringify(backupCodes),
        updated_at: new Date(),
      });

    logger.info(`2FA setup initiated for user: ${req.user.email}`);

    res.json({
      success: true,
      data: {
        qrCode: qrCodeImage,
        manualEntryKey,
        backupCodes,
      },
      message:
        "Scan the QR code with your authenticator app and verify with a token to complete setup",
    });
  }),
);

/**
 * @swagger
 * /api/auth/2fa/verify-setup:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify and enable 2FA
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/2fa/verify-setup",
  [
    authenticateToken,
    body("token")
      .isLength({ min: 6, max: 6 })
      .withMessage("Token must be 6 digits"),
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

    const { token } = req.body;
    const userId = req.user.id;

    // Get user's temporary secret
    const user = await db("users")
      .where({ id: userId })
      .select("two_factor_secret", "recovery_codes")
      .first();

    if (!user || !user.two_factor_secret) {
      throw new AppError("No 2FA setup in progress", 400, "NO_TWO_FA_SETUP");
    }

    // Verify token
    const isValid = verifyTwoFactorToken(user.two_factor_secret, token);
    if (!isValid) {
      throw new AppError("Invalid token", 400, "INVALID_TWO_FA_TOKEN");
    }

    // Enable 2FA
    const backupCodes = JSON.parse(user.recovery_codes);
    await enableTwoFactor(userId, user.two_factor_secret, backupCodes);

    // Send confirmation email
    await sendTwoFactorSetupEmail(req.user.email, req.user.name);

    logger.info(`2FA enabled for user: ${req.user.email}`);

    res.json({
      success: true,
      message: "2FA has been successfully enabled for your account",
    });
  }),
);

/**
 * @swagger
 * /api/auth/2fa/verify:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify 2FA token during login
 */
router.post(
  "/2fa/verify",
  [
    body("email").isEmail().normalizeEmail(),
    body("token").optional().isLength({ min: 6, max: 6 }),
    body("backupCode").optional().isLength({ min: 8, max: 8 }),
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

    const { email, token, backupCode } = req.body;

    if (!token && !backupCode) {
      throw new AppError(
        "Token or backup code required",
        400,
        "TOKEN_OR_BACKUP_CODE_REQUIRED",
      );
    }

    // Get user
    const user = await db("users")
      .where({ email, status: "active", two_factor_enabled: true })
      .first();

    if (!user) {
      throw new AppError(
        "User not found or 2FA not enabled",
        404,
        "USER_NOT_FOUND",
      );
    }

    let isValid = false;

    if (backupCode) {
      // Verify backup code
      isValid = await verifyBackupCode(user.id, backupCode);
    } else if (token) {
      // Verify 2FA token
      isValid = verifyTwoFactorToken(user.two_factor_secret, token);
    }

    if (!isValid) {
      logSecurityOnceInTest("Invalid 2FA token/backup code attempt", {
        userId: user.id,
        email,
        hasToken: !!token,
        hasBackupCode: !!backupCode,
        ip: req.ip,
      });

      throw new AppError(
        "Invalid token or backup code",
        401,
        "INVALID_TWO_FA_TOKEN",
      );
    }

    // Generate tokens
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Update last login
    await db("users").where({ id: user.id }).update({
      last_login: new Date(),
      last_login_ip: req.ip,
    });

    logger.info(`2FA verification successful for user: ${email}`);

    res.json({
      success: true,
      message: "2FA verification successful",
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }),
);

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     tags: [Authentication]
 *     summary: Disable 2FA
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/2fa/disable",
  [
    authenticateToken,
    body("password").notEmpty().withMessage("Current password is required"),
    body("token").optional().isLength({ min: 6, max: 6 }),
    body("backupCode").optional().isLength({ min: 8, max: 8 }),
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

    const { password, token, backupCode } = req.body;
    const userId = req.user.id;

    // Get user with password and 2FA details
    const user = await db("users")
      .where({ id: userId })
      .select("password_hash", "two_factor_enabled", "two_factor_secret")
      .first();

    if (!user.two_factor_enabled) {
      throw new AppError("2FA is not enabled", 400, "TWO_FA_NOT_ENABLED");
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError("Invalid password", 401, "INVALID_PASSWORD");
    }

    // Verify 2FA token or backup code
    let isValid2FA = false;
    if (backupCode) {
      isValid2FA = await verifyBackupCode(userId, backupCode);
    } else if (token) {
      isValid2FA = verifyTwoFactorToken(user.two_factor_secret, token);
    } else {
      throw new AppError(
        "2FA token or backup code required",
        400,
        "TWO_FA_VERIFICATION_REQUIRED",
      );
    }

    if (!isValid2FA) {
      throw new AppError(
        "Invalid 2FA token or backup code",
        401,
        "INVALID_TWO_FA_TOKEN",
      );
    }

    // Disable 2FA
    await disableTwoFactor(userId);

    logger.info(`2FA disabled for user: ${req.user.email}`);

    res.json({
      success: true,
      message: "2FA has been disabled for your account",
    });
  }),
);

/**
 * @swagger
 * /api/auth/2fa/backup-codes:
 *   post:
 *     tags: [Authentication]
 *     summary: Generate new backup codes
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/2fa/backup-codes",
  [
    authenticateToken,
    body("password").notEmpty().withMessage("Current password is required"),
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

    const { password } = req.body;
    const userId = req.user.id;

    // Verify user has 2FA enabled
    const user = await db("users")
      .where({ id: userId })
      .select("password_hash", "two_factor_enabled")
      .first();

    if (!user.two_factor_enabled) {
      throw new AppError("2FA is not enabled", 400, "TWO_FA_NOT_ENABLED");
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError("Invalid password", 401, "INVALID_PASSWORD");
    }

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes();

    // Update backup codes
    await db("users")
      .where({ id: userId })
      .update({
        recovery_codes: JSON.stringify(newBackupCodes),
        updated_at: new Date(),
      });

    logger.info(`New backup codes generated for user: ${req.user.email}`);

    res.json({
      success: true,
      data: {
        backupCodes: newBackupCodes,
      },
      message: "New backup codes generated. Store them in a safe place.",
    });
  }),
);

module.exports = router;
