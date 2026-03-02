/**
 * 🧠 CHAIN OF THOUGHT: Servidor com dados migrados da TAREFA 3
 * 🦴 SKELETON OF THOUGHT: Express + CORS + Routes Migradas + Error Handling
 * 🌳 TREE OF THOUGHT: Prioridade = funcionamento > banco > otimização
 * ✅ SELF CONSISTENCY: Dados consistentes e APIs funcionais
 */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5002;

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 📊 Importar rotas com dados migrados
const websiteRoutes = require("./src/routes/website-real");

// 🏥 Health check principal
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Servidor RSV com dados migrados funcionando!",
    timestamp: new Date().toISOString(),
    tasks_completed: [
      "✅ TAREFA 1: Schema do banco criado",
      "✅ TAREFA 2: APIs básicas implementadas",
      "✅ TAREFA 3: Dados migrados do site",
    ],
  });
});

// 🌐 Usar rotas do website
app.use("/api/website", websiteRoutes);

// 🎯 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} não encontrado`,
    available_endpoints: [
      "GET /health",
      "GET /api/website/health",
      "GET /api/website/settings",
      "GET /api/website/content/hotels",
      "GET /api/website/content/promotions",
      "GET /api/website/content/attractions",
      "GET /api/website/content/:pageType/:contentId",
    ],
  });
});

// ✅ SELF CONSISTENCY: Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Erro global:", err.message);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor RSV com dados migrados rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log("");
  console.log("🌐 APIs Website com dados migrados:");
  console.log(`   GET http://localhost:${PORT}/api/website/settings`);
  console.log(`   GET http://localhost:${PORT}/api/website/content/hotels`);
  console.log(`   GET http://localhost:${PORT}/api/website/content/promotions`);
  console.log(
    `   GET http://localhost:${PORT}/api/website/content/attractions`,
  );
  console.log("");
  console.log(
    "🧠 CHAIN OF THOUGHT: Dados extraídos → Transformados → Disponibilizados via API",
  );
  console.log(
    "✅ TAREFA 3 CONCLUÍDA: Migração de dados do site realizada com sucesso!",
  );
});

module.exports = app;
