const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { db } = require("../config/database");
const logger = require("../utils/logger");
const devAuthLogCache = new Set();

const logDevAuthOnceInTest = (message) => {
  if (process.env.NODE_ENV !== "test") {
    logger.info(message);
    return;
  }

  if (devAuthLogCache.has(message)) {
    return;
  }

  devAuthLogCache.add(message);
  logger.info(message);
};

// Generate JWT token
const generateToken = (
  payload,
  expiresIn = process.env.JWT_EXPIRES_IN || "7d",
) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

// Verify JWT token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Access token is required",
        code: "AUTH_TOKEN_MISSING",
      });
    }

    // MODO DESENVOLVIMENTO: Aceitar tokens demo e admin do CMS
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
      const devTokens = ['demo-token', 'admin-token', 'admin-token-123'];
      if (devTokens.includes(token)) {
        // Criar usuário demo/admin mockado
        const demoUser = {
          id: token === 'demo-token' ? 1 : 2,
          email: token === 'demo-token' ? 'demo@onionrsv.com' : 'admin@rsv360.com.br',
          name: token === 'demo-token' ? 'Usuário Demo' : 'Administrador',
          role: 'admin',
          status: 'active',
          permissions: ['admin'],
          last_login: new Date().toISOString(),
        };

        req.user = demoUser;
        req.token = token;

        logDevAuthOnceInTest(`[DEV] Admin user authenticated: ${demoUser.email} (ID: ${demoUser.id})`);
        return next();
      }
    }

    // Verify token (JWT real)
    const decoded = verifyToken(token);

    // Get user from database
    const user = await db("users")
      .where({ id: decoded.userId, status: "active" })
      .select(
        "id",
        "email",
        "name",
        "role",
        "status",
        "permissions",
        "last_login",
      )
      .first();

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found or inactive",
        code: "AUTH_USER_NOT_FOUND",
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;

    // Log successful authentication
    logger.info(`User authenticated: ${user.email} (ID: ${user.id})`);

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
        code: "AUTH_TOKEN_INVALID",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token expired",
        code: "AUTH_TOKEN_EXPIRED",
      });
    }

    logger.logError(error, req);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Authentication error",
      code: "AUTH_INTERNAL_ERROR",
    });
  }
};

// Authorization middleware - check user role
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
          code: "AUTH_USER_NOT_AUTHENTICATED",
        });
      }

      // If no roles specified, just check if user is authenticated
      if (allowedRoles.length === 0) {
        return next();
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        logger.logSecurity("Unauthorized access attempt", {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          endpoint: req.originalUrl,
          method: req.method,
          ip: req.ip,
        });

        return res.status(403).json({
          error: "Forbidden",
          message: "Insufficient permissions",
          code: "AUTH_INSUFFICIENT_PERMISSIONS",
          required: allowedRoles,
          current: req.user.role,
        });
      }

      next();
    } catch (error) {
      logger.logError(error, req);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Authorization error",
        code: "AUTH_AUTHORIZATION_ERROR",
      });
    }
  };
};

// Check specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
          code: "AUTH_USER_NOT_AUTHENTICATED",
        });
      }

      // Admin role has all permissions
      if (req.user.role === "admin") {
        return next();
      }

      // Check if user has specific permission
      const userPermissions = req.user.permissions || [];
      if (!userPermissions.includes(permission)) {
        logger.logSecurity("Permission denied", {
          userId: req.user.id,
          userRole: req.user.role,
          requiredPermission: permission,
          userPermissions,
          endpoint: req.originalUrl,
          method: req.method,
          ip: req.ip,
        });

        return res.status(403).json({
          error: "Forbidden",
          message: `Permission '${permission}' required`,
          code: "AUTH_PERMISSION_DENIED",
          required: permission,
        });
      }

      next();
    } catch (error) {
      logger.logError(error, req);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Permission check error",
        code: "AUTH_PERMISSION_ERROR",
      });
    }
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    const user = await db("users")
      .where({ id: decoded.userId, status: "active" })
      .select("id", "email", "name", "role", "status", "permissions")
      .first();

    req.user = user || null;
    req.token = token;

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    req.user = null;
    next();
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = (req, res, next) => {
  // This could be enhanced with Redis for distributed rate limiting
  const key = req.ip;
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  // For now, we'll use a simple in-memory store
  // In production, use Redis or a proper rate limiting solution
  if (!global.authAttempts) {
    global.authAttempts = new Map();
  }

  const now = Date.now();
  const userAttempts = global.authAttempts.get(key) || {
    count: 0,
    resetTime: now + windowMs,
  };

  if (now > userAttempts.resetTime) {
    userAttempts.count = 0;
    userAttempts.resetTime = now + windowMs;
  }

  if (userAttempts.count >= maxAttempts) {
    logger.logSecurity("Rate limit exceeded for auth", {
      ip: req.ip,
      attempts: userAttempts.count,
      endpoint: req.originalUrl,
    });

    return res.status(429).json({
      error: "Too Many Requests",
      message: "Too many authentication attempts, please try again later",
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000),
    });
  }

  userAttempts.count++;
  global.authAttempts.set(key, userAttempts);

  next();
};

// Account lockout check
const checkAccountLockout = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next();
    }

    const user = await db("users")
      .where({ email })
      .select("id", "login_attempts", "locked_until")
      .first();

    if (!user) {
      return next();
    }

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const remainingTime = Math.ceil(
        (new Date(user.locked_until) - new Date()) / 1000 / 60,
      );

      logger.logSecurity("Locked account login attempt", {
        userId: user.id,
        email,
        ip: req.ip,
        remainingLockTime: remainingTime,
      });

      return res.status(423).json({
        error: "Account Locked",
        message:
          "Account is temporarily locked due to too many failed login attempts",
        code: "AUTH_ACCOUNT_LOCKED",
        remainingTime: remainingTime,
      });
    }

    req.userLoginInfo = user;
    next();
  } catch (error) {
    logger.logError(error, req);
    next(); // Continue even if check fails
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticateToken,
  authorize,
  requirePermission,
  optionalAuth,
  authRateLimit,
  checkAccountLockout,
};
