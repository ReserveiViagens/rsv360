const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Import configurations and utilities
const logger = require("./utils/logger");
const { connectDatabase } = require("./config/database");
const { setupSwagger } = require("./config/swagger");
const { connectRedis, disconnectRedis, checkRedisHealth } = require("./config/redis");
const { createWebSocketServer } = require("./websocket/server");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const customerRoutes = require("./routes/customers");
const travelPackageRoutes = require("./routes/travel-packages");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");
const uploadRoutes = require("./routes/uploads");
const uploadSimpleRoutes = require("./routes/upload");
const analyticsRoutes = require("./routes/analytics");
const workflowRoutes = require("./routes/workflows");
const projectRoutes = require("./routes/projects");
const financialRoutes = require("./routes/financial");
const integrationRoutes = require("./routes/integrations");
const securityRoutes = require("./routes/security");
const performanceRoutes = require("./routes/performance");
const backupRoutes = require("./routes/backup");
const trainingRoutes = require("./routes/training");
const adminWebsiteRoutes = require("./routes/admin-website");
const websiteRealRoutes = require("./routes/website-real");
const leiloesRoutes = require("./api/v1/leiloes/routes");
const excursoesRoutes = require("./api/v1/excursoes/routes");
const viagensGrupoRoutes = require("./api/v1/viagens-grupo/routes");
const routeExchangeRoutes = require("./api/v1/route-exchange/routes");
const attractionsRoutes = require("./api/v1/attractions/routes");
const parksRoutes = require("./api/v1/parks/routes");
const seoRoutes = require("./api/v1/seo/routes");
const recommendationsRoutes = require("./api/v1/recommendations/routes");
const rewardsRoutes = require("./api/v1/rewards/routes");
const inventoryRoutes = require("./api/v1/inventory/routes");
const productsRoutes = require("./api/v1/products/routes");
const salesRoutes = require("./api/v1/sales/routes");
const multilingualRoutes = require("./api/v1/multilingual/routes");
const ecommerceRoutes = require("./api/v1/ecommerce/routes");
const financeRoutes = require("./api/v1/finance/routes");
const paymentsRoutes = require("./api/v1/payments/routes");
const chatbotsRoutes = require("./api/v1/chatbots/routes");
const automationRoutes = require("./api/v1/automation/routes");
const giftCardsRoutes = require("./api/v1/giftcards/routes");
const workflowsRoutes = require("./api/v1/workflows/routes");
const notificationsRoutes = require("./api/v1/notifications/routes");
const vouchersRoutes = require("./api/v1/vouchers/routes");
const usersRoutes = require("./api/v1/users/routes");
const rolesRoutes = require("./api/v1/roles/routes");
const settingsRoutes = require("./api/v1/settings/routes");
const documentsRoutes = require("./api/v1/documents/routes");
const insuranceRoutes = require("./api/v1/insurance/routes");
const visasRoutes = require("./api/v1/visas/routes");
const enterprisesRoutes = require("./api/v1/enterprises/routes");
const propertiesRoutes = require("./api/v1/properties/routes");
const accommodationsRoutes = require("./api/v1/accommodations/routes");
const auctionsRoutes = require("./api/v1/auctions/routes");
const flashDealsRoutes = require("./api/v1/flash-deals/routes");
const otaRoutes = require("./api/v1/ota/routes");
const googleHotelAdsRoutes = require("./api/v1/google-hotel-ads/routes");
const marketplaceRoutes = require("./api/v1/marketplace/routes");
const affiliatesRoutes = require("./api/v1/affiliates/routes");
const crmIntegrationsRoutes = require("./api/v1/crm-integrations/routes");
const voiceCommerceRoutes = require("./api/v1/voice-commerce/routes");
const proprietorRoutes = require("./api/v1/proprietor/routes");

// Import middleware
const errorHandlerModule = require("./middleware/errorHandler");
const errorHandler = errorHandlerModule.errorHandler || errorHandlerModule;
const { authenticateToken } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

function withTimeout(promise, timeoutMs, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "http://localhost:5000", "https://localhost:5000", "http://localhost:3000", "https://localhost:3000", "https://www.reserveiviagens.com.br", "https://home.reservarviagens.com.br", "https://*", "http://*"],
        mediaSrc: ["'self'", "http://localhost:5000", "https://localhost:5000", "http://localhost:3000", "https://localhost:3000", "https://www.reserveiviagens.com.br", "https://home.reservarviagens.com.br", "https://*", "http://*", "blob:", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Rate limiting (desativado em testes para evitar timers abertos do MemoryStore do middleware)
if (process.env.NODE_ENV !== "test") {
  const shouldSkipLocalRateLimit =
    process.env.RATE_LIMIT_SKIP_LOCAL !== "false" &&
    process.env.NODE_ENV !== "production";

  const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
    message: {
      error: "Too many requests from this IP, please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      if (!shouldSkipLocalRateLimit) return false;
      const ip =
        String(req.ip || req.connection?.remoteAddress || "").toLowerCase();
      const host = String(req.headers.host || "").toLowerCase();
      return (
        ip.includes("127.0.0.1") ||
        ip.includes("::1") ||
        ip.includes("localhost") ||
        host.includes("localhost")
      );
    },
  });

  app.use(limiter);
}

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3005"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files - Servir arquivos de upload com CORS
const uploadsPath = path.join(__dirname, "../uploads");

// Garantir que o diretório de uploads existe
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  logger.info(`📁 Diretório de uploads criado: ${uploadsPath}`);
}

app.use("/uploads", (req, res, next) => {
  // Adicionar headers CORS para arquivos estáticos
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Permitir acesso a imagens e vídeos
    const ext = path.extname(filePath).toLowerCase();
    if (ext.match(/\.(jpg|jpeg|png|gif|svg|webp|mp4|webm|mov|avi)$/i)) {
      // Definir Content-Type correto baseado na extensão
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo'
      };
      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
      res.setHeader("Cache-Control", "public, max-age=31536000");
    }
  }
}));

// Test endpoint para verificar uploads
app.get("/test-uploads", (req, res) => {
  const uploadsDir = path.join(__dirname, "../uploads");
  const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
  res.json({
    uploadsPath,
    uploadsDir,
    exists: fs.existsSync(uploadsDir),
    files: files.slice(0, 10), // Primeiros 10 arquivos
    count: files.length
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// API Documentation - Temporariamente desabilitado para debug
// if (process.env.API_DOCS_ENABLED === "true") {
//   try {
//     setupSwagger(app);
//   } catch (swaggerError) {
//     logger.warn("⚠️ Swagger setup failed, but server will continue:", swaggerError.message);
//   }
// }

// API Routes
// Verificar cada rota antes de usar para identificar problemas
const checkAndUseRoute = (path, route, needsAuth = false) => {
  if (!route) {
    logger.error(`❌ Rota ${path} é null ou undefined`);
    throw new Error(`Rota ${path} é null ou undefined`);
  }
  if (typeof route !== 'function') {
    logger.error(`❌ Rota ${path} não é uma função: ${typeof route}`);
    throw new Error(`Rota ${path} não é uma função: ${typeof route}`);
  }
  try {
    if (needsAuth) {
      if (typeof authenticateToken !== 'function') {
        throw new Error(`authenticateToken não é uma função: ${typeof authenticateToken}`);
      }
      app.use(path, authenticateToken, route);
    } else {
      app.use(path, route);
    }
  } catch (err) {
    logger.error(`❌ Erro ao registrar rota ${path}:`, err.message);
    throw err;
  }
};

checkAndUseRoute("/api/auth", authRoutes, false);
checkAndUseRoute("/api/users", userRoutes, true);
checkAndUseRoute("/api/customers", customerRoutes, true);
checkAndUseRoute("/api/travel-packages", travelPackageRoutes, true);
checkAndUseRoute("/api/bookings", bookingRoutes, true);
checkAndUseRoute("/api/payments", paymentRoutes, true);
checkAndUseRoute("/api/uploads", uploadRoutes, true);
checkAndUseRoute("/api/upload", uploadSimpleRoutes, false);
checkAndUseRoute("/api/analytics", analyticsRoutes, true);
checkAndUseRoute("/api/workflows", workflowRoutes, true);
checkAndUseRoute("/api/projects", projectRoutes, true);
checkAndUseRoute("/api/financial", financialRoutes, true);
checkAndUseRoute("/api/integrations", integrationRoutes, true);
checkAndUseRoute("/api/security", securityRoutes, true);
checkAndUseRoute("/api/performance", performanceRoutes, true);
checkAndUseRoute("/api/backup", backupRoutes, true);
checkAndUseRoute("/api/training", trainingRoutes, true);

// Rotas de módulos de turismo
checkAndUseRoute("/api/v1/leiloes", leiloesRoutes, true);
checkAndUseRoute("/api/v1/excursoes", excursoesRoutes, true);
checkAndUseRoute("/api/v1/viagens-grupo", viagensGrupoRoutes, true);
checkAndUseRoute("/api/v1/route-exchange", routeExchangeRoutes, true);
checkAndUseRoute("/api/v1/attractions", attractionsRoutes, true);
checkAndUseRoute("/api/v1/parks", parksRoutes, true);
checkAndUseRoute("/api/v1/seo", seoRoutes, true);
checkAndUseRoute("/api/v1/recommendations", recommendationsRoutes, true);
checkAndUseRoute("/api/v1/rewards", rewardsRoutes, true);
checkAndUseRoute("/api/v1/inventory", inventoryRoutes, true);
checkAndUseRoute("/api/v1/products", productsRoutes, true);
checkAndUseRoute("/api/v1/sales", salesRoutes, true);
checkAndUseRoute("/api/v1/multilingual", multilingualRoutes, true);
checkAndUseRoute("/api/v1/ecommerce", ecommerceRoutes, true);
checkAndUseRoute("/api/v1/finance", financeRoutes, true);
checkAndUseRoute("/api/v1/payments", paymentsRoutes, true);
checkAndUseRoute("/api/v1/chatbots", chatbotsRoutes, true);
checkAndUseRoute("/api/v1/automation", automationRoutes, true);
checkAndUseRoute("/api/v1/giftcards", giftCardsRoutes, true);
checkAndUseRoute("/api/v1/workflows", workflowsRoutes, true);
checkAndUseRoute("/api/v1/notifications", notificationsRoutes, true);
checkAndUseRoute("/api/v1/vouchers", vouchersRoutes, true);
checkAndUseRoute("/api/v1/users", usersRoutes, true);
checkAndUseRoute("/api/v1/roles", rolesRoutes, true);
checkAndUseRoute("/api/v1/settings", settingsRoutes, true);
checkAndUseRoute("/api/v1/documents", documentsRoutes, true);
checkAndUseRoute("/api/v1/insurance", insuranceRoutes, true);
checkAndUseRoute("/api/v1/visas", visasRoutes, true);
checkAndUseRoute("/api/v1/enterprises", enterprisesRoutes, false);
checkAndUseRoute("/api/v1/properties", propertiesRoutes, false);
checkAndUseRoute("/api/v1/accommodations", accommodationsRoutes, false);
checkAndUseRoute("/api/v1/auctions", auctionsRoutes, false);
checkAndUseRoute("/api/v1/flash-deals", flashDealsRoutes, false);
checkAndUseRoute("/api/v1/ota", otaRoutes, false);
checkAndUseRoute("/api/v1/google-hotel-ads", googleHotelAdsRoutes, false);
checkAndUseRoute("/api/v1/marketplace", marketplaceRoutes, false);
checkAndUseRoute("/api/v1/affiliates", affiliatesRoutes, false);
checkAndUseRoute("/api/v1/crm-integrations", crmIntegrationsRoutes, false);
checkAndUseRoute("/api/v1/voice-commerce", voiceCommerceRoutes, false);
checkAndUseRoute("/api/v1/proprietor", proprietorRoutes, true);

// Rotas adicionais do website
checkAndUseRoute("/api/admin/website", adminWebsiteRoutes, false);
checkAndUseRoute("/api/website", websiteRealRoutes, false);

// API base route
app.get("/api", (req, res) => {
  res.json({
    message: "Onboarding RSV API",
    version: "1.0.0",
    documentation:
      process.env.API_DOCS_ENABLED === "true"
        ? "/api-docs"
        : "Documentation disabled",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      bookings: "/api/bookings",
      payments: "/api/payments",
      uploads: "/api/uploads",
      analytics: "/api/analytics",
      workflows: "/api/workflows",
      projects: "/api/projects",
      financial: "/api/financial",
      integrations: "/api/integrations",
      security: "/api/security",
      performance: "/api/performance",
      backup: "/api/backup",
      training: "/api/training",
      leiloes: "/api/v1/leiloes",
      excursoes: "/api/v1/excursoes",
      viagensGrupo: "/api/v1/viagens-grupo",
      routeExchange: "/api/v1/route-exchange",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested route ${req.originalUrl} does not exist`,
    code: "ROUTE_NOT_FOUND",
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Graceful shutdown handlers moved to startServer function

// Start server
const startServer = async () => {
  try {
    // Connect to database (opcional - não bloqueia o servidor se falhar)
    try {
      await connectDatabase();
    } catch (dbError) {
      logger.warn("⚠️ Database connection failed, but server will continue without it:", dbError.message);
      logger.warn("   The server will still work with in-memory data for website routes.");
    }

    // Connect to Redis (opcional - pula se REDIS_ENABLED=false)
    if (process.env.REDIS_ENABLED !== 'false') {
      try {
        const redisConnectTimeoutMs = Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000);
        await withTimeout(connectRedis(), redisConnectTimeoutMs, "Redis connect");
        logger.info("✅ Redis connected successfully");
      } catch (redisError) {
        logger.warn("⚠️ Redis connection failed, but server will continue:", redisError.message);
        logger.warn("   Cache and locks will not be available.");
      }
    } else {
      logger.info("ℹ️ Redis disabled (REDIS_ENABLED=false)");
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      if (process.env.API_DOCS_ENABLED === "true") {
        logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      }
    });

    // Initialize WebSocket (opcional - não bloqueia se falhar)
    let io = null;
    try {
      const wsServer = createWebSocketServer(server);
      io = wsServer.io;
      // Exportar funções de WebSocket para uso em outros módulos
      global.wsServer = wsServer;
      logger.info(`🔌 WebSocket server initialized on port ${PORT}`);
    } catch (wsError) {
      logger.warn("⚠️ WebSocket initialization failed, but server will continue:", wsError.message);
    }

    // Iniciar jobs de leilões
    try {
      const { startJobs: startAuctionJobs } = require('./jobs/auctions');
      startAuctionJobs();
      logger.info('✅ Auction jobs started');
    } catch (jobError) {
      logger.warn("⚠️ Auction jobs initialization failed, but server will continue:", jobError.message);
    }

    // Iniciar jobs de flash deals
    try {
      const { startJobs: startFlashDealJobs } = require('./jobs/flash-deals');
      startFlashDealJobs();
      logger.info('✅ Flash deals jobs started');
    } catch (jobError) {
      logger.warn("⚠️ Flash deals jobs initialization failed, but server will continue:", jobError.message);
    }

    // Iniciar jobs de sincronização OTA
    try {
      const { startJobs: startOTASyncJobs } = require('./jobs/ota-sync');
      startOTASyncJobs();
      logger.info('✅ OTA sync jobs started');
    } catch (jobError) {
      logger.warn("⚠️ OTA sync jobs initialization failed, but server will continue:", jobError.message);
    }

    // Iniciar jobs de Google Hotel Ads
    try {
      require('./jobs/google-hotel-ads');
      logger.info('✅ Google Hotel Ads jobs started');
    } catch (jobError) {
      logger.warn("⚠️ Google Hotel Ads jobs initialization failed, but server will continue:", jobError.message);
    }

    // Iniciar jobs de Afiliados
    try {
      require('./jobs/affiliates');
      logger.info('✅ Affiliates jobs started');
    } catch (jobError) {
      logger.warn("⚠️ Affiliates jobs initialization failed, but server will continue:", jobError.message);
    }

    // Iniciar jobs de Voice Commerce
    try {
      require('./jobs/voice-commerce');
      logger.info('✅ Voice Commerce jobs started');
    } catch (jobError) {
      logger.warn("⚠️ Voice Commerce jobs initialization failed, but server will continue:", jobError.message);
    }

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error("Server error:", error);
      }
      process.exit(1);
    });

    // Graceful shutdown - desconectar Redis
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      await disconnectRedis();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received. Shutting down gracefully...");
      await disconnectRedis();
      process.exit(0);
    });

    return { server, io };
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
