const winston = require("winston");
const path = require("path");

// Configurar formato personalizado
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (stack) {
      log += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  }),
);

// Configurar transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(winston.format.colorize(), logFormat),
  }),

  // File transport para todos os logs
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/app.log"),
    level: "info",
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // File transport apenas para erros
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/error.log"),
    level: "error",
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Adicionar transports específicos para produção
if (process.env.NODE_ENV === "production") {
  // Em produção, podemos adicionar transports como Papertrail, LogDNA, etc.

  // Exemplo: Papertrail
  if (process.env.PAPERTRAIL_HOST && process.env.PAPERTRAIL_PORT) {
    const { Papertrail } = require("winston-papertrail");

    transports.push(
      new Papertrail({
        host: process.env.PAPERTRAIL_HOST,
        port: process.env.PAPERTRAIL_PORT,
        hostname: process.env.APP_NAME || "rsv-360",
        program: "backend",
        level: "info",
      }),
    );
  }
}

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports,
  exitOnError: false,

  // Não logar requisições HTTP em produção (muito verboso)
  silent: false,
});

// Stream para Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Helper functions
logger.logRequest = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    const logData = {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip: ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    if (statusCode >= 400) {
      logger.warn("HTTP Request", logData);
    } else {
      logger.info("HTTP Request", logData);
    }
  });

  next();
};

logger.logError = (error, req = null) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };

  if (req) {
    errorData.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      body: req.body,
      params: req.params,
      query: req.query,
    };
  }

  logger.error("Application Error", errorData);
};

logger.logApiCall = (service, endpoint, duration, success = true) => {
  const logData = {
    service,
    endpoint,
    duration: `${duration}ms`,
    success,
  };

  if (success) {
    logger.info("External API Call", logData);
  } else {
    logger.warn("External API Call Failed", logData);
  }
};

logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info("Performance Metric", {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
};

logger.logSecurity = (event, details) => {
  logger.warn("Security Event", {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Configurar captura de exceções não tratadas
if (process.env.NODE_ENV === "production") {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/exceptions.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/rejections.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  );
}

// Criar diretório de logs se não existir
const fs = require("fs");
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

module.exports = logger;
