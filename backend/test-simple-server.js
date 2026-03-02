/**
 * 🧠 CHAIN OF THOUGHT: Servidor minimal para teste das APIs Website
 * 🦴 SKELETON OF THOUGHT: Express básico + Rotas + Teste
 * 🌳 TREE OF THOUGHT: Prioridade = funcionamento > otimização
 */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

// 🔧 Middleware básico
app.use(cors());
app.use(express.json());

// 🏥 Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Servidor teste funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// 📊 Mock das APIs Website (TAREFA 2)
app.get("/api/website/settings", (req, res) => {
  console.log("🎯 GET /api/website/settings chamado");

  const mockSettings = {
    site_info: {
      title: "Reservei Viagens",
      tagline: "Parques, Hotéis & Atrações",
    },
    contact_info: {
      phones: ["(64) 99319-7555", "(64) 99306-8752"],
      email: "reservas@reserveiviagens.com.br",
    },
    social_media: {
      facebook: "comercialreservei",
      instagram: "reserveiviagens",
    },
  };

  res.json({
    success: true,
    data: mockSettings,
    source: "mock_data",
  });
});

app.get("/api/website/content/:pageType", (req, res) => {
  const { pageType } = req.params;
  console.log(`🎯 GET /api/website/content/${pageType} chamado`);

  const mockContent = {
    hotels: [
      {
        id: 1,
        title: "Hotel Teste Caldas Novas",
        description: "Hotel com águas termais",
        image: "/images/hotel1.jpg",
        price: "R$ 150/dia",
      },
    ],
    promotions: [
      {
        id: 1,
        title: "Promoção Especial",
        description: "3 dias por 2",
        discount: "30%",
      },
    ],
    attractions: [
      {
        id: 1,
        title: "Parque das Águas",
        description: "Diversão para toda família",
        price: "R$ 50",
      },
    ],
  };

  const data = mockContent[pageType] || [];

  res.json({
    success: true,
    data: data,
    pageType: pageType,
    source: "mock_data",
  });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor teste rodando na porta ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`🌐 APIs Website:`);
  console.log(`   GET http://localhost:${PORT}/api/website/settings`);
  console.log(`   GET http://localhost:${PORT}/api/website/content/hotels`);
  console.log(`   GET http://localhost:${PORT}/api/website/content/promotions`);
  console.log(
    `   GET http://localhost:${PORT}/api/website/content/attractions`,
  );
  console.log("");
  console.log("🧠 APLICANDO CHAIN OF THOUGHT: Teste → Validação → Integração");
});

// ✅ SELF CONSISTENCY: Error handling
app.use((err, req, res, next) => {
  console.error("❌ Erro:", err.message);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

// 🎯 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} não encontrado`,
  });
});
