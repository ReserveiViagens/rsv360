const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
const adminRoutes = require("./src/routes/admin-mock");
const authRoutes = require("./src/routes/auth");
const analyticsRoutes = require("./src/routes/analytics");

const app = express();

// Middlewares básicos
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);
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
    message: "Servidor RSV 360 com APIs CRUD funcionando!",
    apis: {
      admin: "/api/admin",
      health: "/health",
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor RSV 360 com APIs CRUD rodando na porta ${PORT}`);
  console.log(`📍 Environment: development`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Admin APIs: http://localhost:${PORT}/api/admin`);
  console.log(`\n📋 Endpoints disponíveis:`);
  console.log(`   GET  /health`);
  console.log(`\n🔐 Autenticação:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/register`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   PUT  /api/auth/me`);
  console.log(`   POST /api/auth/logout`);
  console.log(`   POST /api/auth/verify`);
  console.log(`\n📊 Analytics:`);
  console.log(`   GET  /api/analytics/overview`);
  console.log(`   GET  /api/analytics/content`);
  console.log(`   GET  /api/analytics/users`);
  console.log(`   GET  /api/analytics/performance`);
  console.log(`   GET  /api/analytics/report`);
  console.log(`   GET  /api/analytics/health`);
  console.log(`   GET  /api/analytics/trends`);
  console.log(`\n🔧 Admin APIs:`);
  console.log(`   GET  /api/admin/website/content`);
  console.log(`   POST /api/admin/website/content`);
  console.log(`   PUT  /api/admin/website/content/:id`);
  console.log(`   DELETE /api/admin/website/content/:id`);
  console.log(`   PUT  /api/admin/website/settings`);
  console.log(`   POST /api/admin/upload`);
});

module.exports = app;
