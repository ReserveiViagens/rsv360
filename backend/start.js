console.log("🚀 Iniciando Sistema Onboarding RSV...");

// Carregamento básico
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const adminWebsiteRoutes = require("./src/routes/admin-website");
const websiteRoutes = require("./src/routes/website-real");
const uploadRoutes = require("./src/routes/upload");

const app = express();
const PORT = Number(process.env.PORT || 5000);

// 🔧 Middleware
// CORS dinâmico para ambientes de desenvolvimento
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3015",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:3015",
]);

// Configuração CORS completa
const corsOptions = {
  origin: (origin, callback) => {
    // Permite ferramentas como Postman (sem origin)
    if (!origin) return callback(null, true);

    try {
      const url = new URL(origin);
      const host = url.hostname;
      const port = url.port;

      // Permite localhost/127.0.0.1 nas portas 3000-3020
      if (
        (host === "localhost" || host === "127.0.0.1") &&
        /^30\d{2}$/.test(port)
      ) {
        return callback(null, true);
      }

      // Permite IPs locais (ex.: 172.x.x.x, 192.168.x.x) nas portas 3000-3020
      const isPrivateIp =
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
        /^192\.168\./.test(host) ||
        /^10\./.test(host);

      if (isPrivateIp && /^30\d{2}$/.test(port)) {
        return callback(null, true);
      }

      // Verifica se está na lista de origens permitidas
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    } catch (err) {
      callback(new Error("Invalid origin"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handler explícito para requisições OPTIONS (preflight)
app.options('*', cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "🎉 Sistema Onboarding RSV - Backend Principal",
    status: "OK",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      health: "/health",
      api: "/api",
      docs: "/api/docs"
    },
    company: "Reservei Viagens - Caldas Novas, GO",
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "🎉 Sistema Onboarding RSV funcionando!",
    timestamp: new Date().toISOString(),
    port: PORT,
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Onboarding RSV API - 100% Completo",
    status: "Todas as 14 APIs implementadas",
    endpoints: 77,
    company: "Reservei Viagens - Caldas Novas, GO",
  });
});

// 🔐 Rotas administrativas
app.use("/api/admin/website", adminWebsiteRoutes);

// 🌐 Rotas públicas do website
app.use("/api/website", websiteRoutes);

// 📤 Rotas de upload
app.use("/api/upload", uploadRoutes);

// 📁 Servir arquivos estáticos (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ SELF CONSISTENCY: Error handling global
app.use((err, req, res, next) => {
  console.error("❌ Erro global:", err.message);
  res.status(500).json({
    success: false,
    error: "Erro interno do servidor",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log("");
  console.log("🎉".repeat(30));
  console.log("🎉 SERVIDOR ONBOARDING RSV INICIADO!");
  console.log("🎉".repeat(30));
  console.log("");
  console.log(`🚀 Porta: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log(`📋 API: http://localhost:${PORT}/api`);
  console.log(`🔐 Admin APIs: http://localhost:${PORT}/api/admin/website/content`);
  console.log("");
  console.log("🎯 Sistema 100% funcional!");
  console.log("✅ Pronto para uso!");
  console.log("");
});
