// Teste simples do servidor
const express = require("express");
const app = express();

app.use(express.json());

// Teste básico
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Servidor de teste funcionando!",
  });
});

// Teste com algumas rotas principais
try {
  const authRoutes = require("./src/routes/auth");
  const userRoutes = require("./src/routes/users");
  const bookingRoutes = require("./src/routes/bookings");
  const paymentRoutes = require("./src/routes/payments");

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/payments", paymentRoutes);

  console.log("✅ Rotas principais carregadas com sucesso");
} catch (error) {
  console.error("❌ Erro ao carregar rotas:", error.message);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});
