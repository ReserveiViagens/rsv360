const logger = require("../utils/logger");

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Database error handler
const handleDatabaseError = (error) => {
  // PostgreSQL error codes
  const pgErrorCodes = {
    23505: "Duplicate entry",
    23503: "Foreign key constraint violation",
    23502: "Not null constraint violation",
    23514: "Check constraint violation",
    42703: "Undefined column",
    "42P01": "Undefined table",
    42601: "Syntax error",
  };

  if (error.code && pgErrorCodes[error.code]) {
    return new AppError(pgErrorCodes[error.code], 400, `DB_${error.code}`, {
      constraint: error.constraint,
      table: error.table,
      column: error.column,
      detail: error.detail,
    });
  }

  // Generic database error
  return new AppError("Database operation failed", 500, "DATABASE_ERROR", {
    originalError: error.message,
  });
};

// Validation error handler
const handleValidationError = (error) => {
  if (error.details && Array.isArray(error.details)) {
    // Joi validation error
    const validationErrors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
      value: detail.context?.value,
    }));

    return new AppError(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      validationErrors,
    );
  }

  return new AppError("Invalid input data", 400, "VALIDATION_ERROR", {
    message: error.message,
  });
};

// JWT error handler
const handleJWTError = (error) => {
  if (error.name === "JsonWebTokenError") {
    return new AppError("Invalid token", 401, "AUTH_TOKEN_INVALID");
  }

  if (error.name === "TokenExpiredError") {
    return new AppError("Token expired", 401, "AUTH_TOKEN_EXPIRED");
  }

  return new AppError("Authentication failed", 401, "AUTH_ERROR");
};

// File upload error handler
const handleFileUploadError = (error) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return new AppError("File size too large", 400, "FILE_SIZE_EXCEEDED", {
      maxSize: error.limit,
    });
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return new AppError("Too many files", 400, "FILE_COUNT_EXCEEDED", {
      maxCount: error.limit,
    });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return new AppError("Unexpected file field", 400, "UNEXPECTED_FILE_FIELD", {
      fieldName: error.field,
    });
  }

  return new AppError("File upload failed", 400, "FILE_UPLOAD_ERROR", {
    message: error.message,
  });
};

// Development error response
const sendErrorDev = (err, req, res) => {
  logger.logError(err, req);

  res.status(err.statusCode || 500).json({
    status: "error",
    error: err.message,
    code: err.code || "UNKNOWN_ERROR",
    details: err.details || null,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  });
};

// Production error response
const sendErrorProd = (err, req, res) => {
  // Log error for monitoring
  logger.logError(err, req);

  // Only send operational errors to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: "error",
      error: err.message,
      code: err.code || "OPERATIONAL_ERROR",
      details: err.details || null,
    });
  } else {
    // Generic error for non-operational errors
    res.status(500).json({
      status: "error",
      error: "Something went wrong",
      code: "INTERNAL_ERROR",
    });
  }
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Database errors
  if (err.routine && err.code) {
    error = handleDatabaseError(err);
  }

  // Validation errors (Joi)
  if (err.isJoi || (err.details && err.details.length)) {
    error = handleValidationError(err);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    error = handleJWTError(err);
  }

  // File upload errors (Multer)
  if (err.code && err.code.startsWith("LIMIT_")) {
    error = handleFileUploadError(err);
  }

  // Knex errors
  if (err.name === "KnexTimeoutError") {
    error = new AppError("Database timeout", 503, "DATABASE_TIMEOUT");
  }

  // Express validator errors
  if (err.array && typeof err.array === "function") {
    const validationErrors = err.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    error = new AppError(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      validationErrors,
    );
  }

  // Default error status
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  // Send error response
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    "ROUTE_NOT_FOUND",
  );
  next(error);
};

// Global exception handlers
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection - reason:", reason);
  if (reason && typeof reason === "object" && "stack" in reason) {
    logger.error("Stack:", reason.stack);
  }
  process.exit(1);
});

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  handleDatabaseError,
  handleValidationError,
  handleJWTError,
  handleFileUploadError,
};
