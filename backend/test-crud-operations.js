/**
 * 🧠 CHAIN OF THOUGHT: Teste completo das operações CRUD
 * 🦴 SKELETON OF THOUGHT: Setup → Testes → Validação → Relatório
 * 🌳 TREE OF THOUGHT: Testar todos os cenários possíveis
 * ✅ SELF CONSISTENCY: Validar cada operação individualmente
 */

const axios = require("axios");

const BASE_URL = "http://localhost:5002";
const AUTH_TOKEN = "admin-token-123";

const headers = {
  Authorization: `Bearer ${AUTH_TOKEN}`,
  "Content-Type": "application/json",
};

// 📊 Dados de teste
const testHotel = {
  page_type: "hotels",
  content_id: "test-hotel-crud",
  title: "Hotel Teste CRUD",
  description:
    "Hotel criado para testar operações CRUD do sistema administrativo.",
  images: [
    "https://example.com/test-hotel-1.jpg",
    "https://example.com/test-hotel-2.jpg",
  ],
  metadata: {
    stars: 4,
    price: 300,
    originalPrice: 375,
    discount: 20,
    features: ["Piscina", "Wi-Fi", "Restaurante"],
    location: "Centro de Teste",
    capacity: "4 pessoas",
  },
  seo_data: {
    title: "Hotel Teste CRUD - Teste de Sistema",
    description:
      "Hotel criado para testar operações CRUD do sistema administrativo.",
    keywords: ["teste", "crud", "hotel", "sistema"],
  },
  status: "active",
  order_index: 999,
};

const testPromotion = {
  page_type: "promotions",
  content_id: "test-promocao-crud",
  title: "🔥 Promoção Teste CRUD",
  description:
    "Promoção criada para testar operações CRUD do sistema administrativo.",
  images: ["https://example.com/test-promotion.jpg"],
  metadata: {
    discount: 25,
    benefits: ["25% desconto", "Teste gratuito"],
    validUntil: "2025-12-31",
    featured: true,
  },
  seo_data: {
    title: "Promoção Teste CRUD - Sistema Administrativo",
    description:
      "Promoção criada para testar operações CRUD do sistema administrativo.",
    keywords: ["teste", "promoção", "crud", "sistema"],
  },
  status: "active",
  order_index: 999,
};

// 🧪 Funções de teste
async function testHealthCheck() {
  console.log("\n🏥 Testando Health Check...");
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health Check OK:", response.data.message);
    return true;
  } catch (error) {
    console.log("❌ Health Check FALHOU:", error.message);
    return false;
  }
}

async function testCreateContent(data, type) {
  console.log(`\n📝 Testando CREATE ${type}...`);
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/website/content`,
      data,
      { headers },
    );
    console.log(`✅ ${type} criado com sucesso:`, response.data.data.title);
    return response.data.data;
  } catch (error) {
    console.log(
      `❌ CREATE ${type} FALHOU:`,
      error.response?.data?.error || error.message,
    );
    return null;
  }
}

async function testReadContent(pageType, contentId) {
  console.log(`\n📖 Testando READ ${pageType}/${contentId}...`);
  try {
    const response = await axios.get(
      `${BASE_URL}/api/admin/website/content/${pageType}/${contentId}`,
      { headers },
    );
    console.log(`✅ ${pageType} lido com sucesso:`, response.data.data.title);
    return response.data.data;
  } catch (error) {
    console.log(
      `❌ READ ${pageType} FALHOU:`,
      error.response?.data?.error || error.message,
    );
    return null;
  }
}

async function testUpdateContent(pageType, contentId, updateData) {
  console.log(`\n✏️ Testando UPDATE ${pageType}/${contentId}...`);
  try {
    const response = await axios.put(
      `${BASE_URL}/api/admin/website/content/${pageType}/${contentId}`,
      updateData,
      { headers },
    );
    console.log(
      `✅ ${pageType} atualizado com sucesso:`,
      response.data.data.title,
    );
    return response.data.data;
  } catch (error) {
    console.log(
      `❌ UPDATE ${pageType} FALHOU:`,
      error.response?.data?.error || error.message,
    );
    return null;
  }
}

async function testUpdateStatus(pageType, contentId, status) {
  console.log(
    `\n🔄 Testando UPDATE STATUS ${pageType}/${contentId} para ${status}...`,
  );
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/admin/website/content/${pageType}/${contentId}/status`,
      { status },
      { headers },
    );
    console.log(
      `✅ Status atualizado para ${status}:`,
      response.data.data.title,
    );
    return response.data.data;
  } catch (error) {
    console.log(
      `❌ UPDATE STATUS FALHOU:`,
      error.response?.data?.error || error.message,
    );
    return null;
  }
}

async function testDeleteContent(pageType, contentId) {
  console.log(`\n🗑️ Testando DELETE ${pageType}/${contentId}...`);
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/admin/website/content/${pageType}/${contentId}`,
      { headers },
    );
    console.log(
      `✅ ${pageType} deletado com sucesso:`,
      response.data.data.title,
    );
    return true;
  } catch (error) {
    console.log(
      `❌ DELETE ${pageType} FALHOU:`,
      error.response?.data?.error || error.message,
    );
    return false;
  }
}

async function testListContent(pageType) {
  console.log(`\n📋 Testando LIST ${pageType}...`);
  try {
    const response = await axios.get(
      `${BASE_URL}/api/admin/website/content/${pageType}`,
      { headers },
    );
    console.log(`✅ Lista de ${pageType} obtida: ${response.data.total} itens`);
    return response.data.data;
  } catch (error) {
    console.log(
      `❌ LIST ${pageType} FALHOU:`,
      error.response?.data?.error || error.message,
    );
    return null;
  }
}

async function testListAllContent() {
  console.log(`\n📋 Testando LIST ALL CONTENT...`);
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/website/content`, {
      headers,
    });
    console.log(`✅ Todo conteúdo listado:`, response.data.totals);
    return response.data.data;
  } catch (error) {
    console.log(
      `❌ LIST ALL FALHOU:`,
      error.response?.data?.error || error.message,
    );
    return null;
  }
}

async function testAuthentication() {
  console.log("\n🔐 Testando Autenticação...");

  // Teste sem token
  try {
    await axios.get(`${BASE_URL}/api/admin/website/content`);
    console.log("❌ Acesso sem token deveria falhar!");
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("✅ Acesso sem token corretamente bloqueado");
    } else {
      console.log(
        "❌ Erro inesperado no teste de autenticação:",
        error.message,
      );
      return false;
    }
  }

  // Teste com token inválido
  try {
    await axios.get(`${BASE_URL}/api/admin/website/content`, {
      headers: { Authorization: "Bearer token-invalido" },
    });
    console.log("❌ Acesso com token inválido deveria falhar!");
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log("✅ Acesso com token inválido corretamente bloqueado");
    } else {
      console.log(
        "❌ Erro inesperado no teste de token inválido:",
        error.message,
      );
      return false;
    }
  }

  console.log("✅ Autenticação funcionando corretamente");
  return true;
}

async function testValidation() {
  console.log("\n📋 Testando Validações...");

  // Teste com dados inválidos
  const invalidData = {
    page_type: "invalid_type",
    title: "A", // Muito curto
    description: "Test", // Muito curto
  };

  try {
    await axios.post(`${BASE_URL}/api/admin/website/content`, invalidData, {
      headers,
    });
    console.log("❌ Dados inválidos deveriam ser rejeitados!");
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Dados inválidos corretamente rejeitados");
      console.log("   Detalhes:", error.response.data.details);
    } else {
      console.log("❌ Erro inesperado na validação:", error.message);
      return false;
    }
  }

  return true;
}

// 🚀 Executar todos os testes
async function runAllTests() {
  console.log("🧪 INICIANDO TESTES COMPLETOS DAS APIs ADMINISTRATIVAS CRUD");
  console.log("=".repeat(70));

  const results = {
    healthCheck: false,
    authentication: false,
    validation: false,
    hotelCRUD: false,
    promotionCRUD: false,
    listOperations: false,
  };

  // 1. Health Check
  results.healthCheck = await testHealthCheck();
  if (!results.healthCheck) {
    console.log(
      "\n❌ Servidor não está rodando. Execute: node test-admin-server.js",
    );
    return;
  }

  // 2. Autenticação
  results.authentication = await testAuthentication();

  // 3. Validações
  results.validation = await testValidation();

  // 4. Teste CRUD Hotel
  console.log("\n🏨 TESTANDO CRUD COMPLETO - HOTEL");
  console.log("-".repeat(50));

  const createdHotel = await testCreateContent(testHotel, "HOTEL");
  if (createdHotel) {
    const readHotel = await testReadContent("hotels", "test-hotel-crud");
    if (readHotel) {
      const updateData = {
        ...testHotel,
        title: "Hotel Teste CRUD - ATUALIZADO",
      };
      const updatedHotel = await testUpdateContent(
        "hotels",
        "test-hotel-crud",
        updateData,
      );
      if (updatedHotel) {
        const statusUpdated = await testUpdateStatus(
          "hotels",
          "test-hotel-crud",
          "inactive",
        );
        if (statusUpdated) {
          const deleted = await testDeleteContent("hotels", "test-hotel-crud");
          results.hotelCRUD = deleted;
        }
      }
    }
  }

  // 5. Teste CRUD Promoção
  console.log("\n🔥 TESTANDO CRUD COMPLETO - PROMOÇÃO");
  console.log("-".repeat(50));

  const createdPromotion = await testCreateContent(testPromotion, "PROMOÇÃO");
  if (createdPromotion) {
    const readPromotion = await testReadContent(
      "promotions",
      "test-promocao-crud",
    );
    if (readPromotion) {
      const updateData = {
        ...testPromotion,
        title: "🔥 Promoção Teste CRUD - ATUALIZADA",
      };
      const updatedPromotion = await testUpdateContent(
        "promotions",
        "test-promocao-crud",
        updateData,
      );
      if (updatedPromotion) {
        const deleted = await testDeleteContent(
          "promotions",
          "test-promocao-crud",
        );
        results.promotionCRUD = deleted;
      }
    }
  }

  // 6. Teste Listas
  console.log("\n📋 TESTANDO OPERAÇÕES DE LISTA");
  console.log("-".repeat(50));

  const hotelsList = await testListContent("hotels");
  const promotionsList = await testListContent("promotions");
  const attractionsList = await testListContent("attractions");
  const allContent = await testListAllContent();

  results.listOperations = !!(
    hotelsList &&
    promotionsList &&
    attractionsList &&
    allContent
  );

  // 📊 Relatório Final
  console.log("\n📊 RELATÓRIO FINAL DOS TESTES");
  console.log("=".repeat(70));

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(
    `✅ Testes Aprovados: ${passedTests}/${totalTests} (${successRate}%)`,
  );
  console.log(`🏥 Health Check: ${results.healthCheck ? "✅" : "❌"}`);
  console.log(`🔐 Autenticação: ${results.authentication ? "✅" : "❌"}`);
  console.log(`📋 Validações: ${results.validation ? "✅" : "❌"}`);
  console.log(`🏨 CRUD Hotel: ${results.hotelCRUD ? "✅" : "❌"}`);
  console.log(`🔥 CRUD Promoção: ${results.promotionCRUD ? "✅" : "❌"}`);
  console.log(`📋 Listas: ${results.listOperations ? "✅" : "❌"}`);

  if (successRate === "100.0") {
    console.log(
      "\n🎉 TODOS OS TESTES PASSARAM! APIs Administrativas CRUD funcionando perfeitamente!",
    );
  } else {
    console.log("\n⚠️ Alguns testes falharam. Verifique os logs acima.");
  }

  console.log("\n🚀 Para usar as APIs:");
  console.log(
    `   curl -H "Authorization: Bearer ${AUTH_TOKEN}" http://localhost:${PORT}/api/admin/website/content`,
  );
}

// 🎯 Executar testes
runAllTests().catch(console.error);
