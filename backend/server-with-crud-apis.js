const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
const websiteRoutes = require("./src/routes/website");
const adminRoutes = require("./src/routes/admin-mock");

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por windowMs para testes
  message: "Muitas requisições deste IP, tente novamente em 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares globais
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);
app.use(morgan("combined"));
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: "development",
    version: "1.0.0",
    apis: {
      website: "/api/website",
      admin: "/api/admin",
    },
  });
});

// API Routes
app.use("/api/website", websiteRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Erro:", err);
  res.status(500).json({
    success: false,
    error: "Erro interno do servidor",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint não encontrado",
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      health: "GET /health",
      website: {
        settings: "GET /api/website/settings",
        content: "GET /api/website/content/:type",
      },
      admin: {
        content: "GET /api/admin/website/content",
        create: "POST /api/admin/website/content",
        update: "PUT /api/admin/website/content/:id",
        delete: "DELETE /api/admin/website/content/:id",
        settings: "PUT /api/admin/website/settings",
        upload: "POST /api/admin/upload",
      },
    },
  });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Servidor RSV 360 com APIs CRUD rodando na porta ${PORT}`);
  console.log(`📍 Environment: development`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔧 Admin APIs: http://localhost:${PORT}/api/admin`);
  console.log(`🌍 Website APIs: http://localhost:${PORT}/api/website`);
  console.log(`\n📋 Endpoints disponíveis:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/website/settings`);
  console.log(`   GET  /api/website/content/:type`);
  console.log(`   GET  /api/admin/website/content`);
  console.log(`   POST /api/admin/website/content`);
  console.log(`   PUT  /api/admin/website/content/:id`);
  console.log(`   DELETE /api/admin/website/content/:id`);
  console.log(`   PUT  /api/admin/website/settings`);
  console.log(`   POST /api/admin/upload`);
});

module.exports = app;
