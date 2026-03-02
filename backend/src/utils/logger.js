const winston = require("winston");
const path = require("path");
const isTestEnv = process.env.NODE_ENV === "test";
const enableLogsInTest = process.env.TEST_LOGS === "true";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  http: "magenta",
  debug: "white",
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    silent: isTestEnv && !enableLogsInTest,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
      ),
    ),
  }),
];

// Add file transport: em producao ou quando LOG_TO_FILE=true (para dev/debug)
const enableFileLogging =
  process.env.NODE_ENV === "production" || process.env.LOG_TO_FILE === "true";
if (enableFileLogging) {
  const fs = require("fs");
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  transports,
  // Do not exit on handled exceptions
  exitOnError: false,
});

// Add request logging helper
logger.logRequest = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
    };

    if (res.statusCode >= 400) {
      logger.warn(
        `HTTP ${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`,
      );
    } else {
      logger.info(
        `HTTP ${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`,
      );
    }
  });

  next();
};

// Add error logging helper
logger.logError = (error, req = null) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };

  if (req) {
    logData.request = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      ip: req.ip || req.connection.remoteAddress,
    };
  }

  logger.error("Application Error:", logData);
};

// Add database logging helper
logger.logDatabase = (query, params = [], duration = null) => {
  const logData = {
    query: query.replace(/\s+/g, " ").trim(),
    params,
    timestamp: new Date().toISOString(),
  };

  if (duration) {
    logData.duration = `${duration}ms`;
  }

  logger.debug("Database Query:", logData);
};

// Add security logging helper
logger.logSecurity = (event, details = {}) => {
  logger.warn(`Security Event: ${event}`, {
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// Add performance logging helper
logger.logPerformance = (operation, duration, details = {}) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    ...details,
    timestamp: new Date().toISOString(),
  };

  if (duration > 1000) {
    logger.warn("Slow Operation:", logData);
  } else {
    logger.info("Performance Log:", logData);
  }
};

module.exports = logger;
