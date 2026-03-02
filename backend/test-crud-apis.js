const axios = require("axios");

const BASE_URL = "http://localhost:5000";
const ADMIN_TOKEN = "Bearer admin-token-test"; // Token de teste

// Função para testar as APIs CRUD
async function testCRUDAPIs() {
  console.log("🧪 Iniciando testes das APIs CRUD...\n");

  try {
    // Teste 1: Health Check
    console.log("1️⃣ Testando Health Check...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health Check:", healthResponse.data.status);
    console.log("");

    // Teste 2: Listar Conteúdo
    console.log("2️⃣ Testando GET /api/admin/website/content...");
    const listResponse = await axios.get(
      `${BASE_URL}/api/admin/website/content`,
      {
        headers: { Authorization: ADMIN_TOKEN },
      },
    );
    console.log(
      "✅ Lista de conteúdo:",
      listResponse.data.total,
      "itens encontrados",
    );
    console.log("   Tipos:", [
      ...new Set(listResponse.data.content.map((item) => item.page_type)),
    ]);
    console.log("");

    // Teste 3: Obter Item Específico
    console.log("3️⃣ Testando GET /api/admin/website/content/1...");
    const itemResponse = await axios.get(
      `${BASE_URL}/api/admin/website/content/1`,
      {
        headers: { Authorization: ADMIN_TOKEN },
      },
    );
    console.log("✅ Item específico:", itemResponse.data.content.title);
    console.log("");

    // Teste 4: Criar Novo Conteúdo
    console.log("4️⃣ Testando POST /api/admin/website/content...");
    const newItem = {
      page_type: "hotels",
      title: "Hotel Teste API",
      description: "Hotel criado via API de teste",
      price: 150.0,
      original_price: 200.0,
      discount: 25,
      stars: 4,
      location: "Caldas Novas, GO",
      status: "active",
      images: [
        "https://via.placeholder.com/800x600/6366F1/FFFFFF?text=Hotel+Teste",
      ],
      features: ["Wi-Fi", "Piscina", "Restaurante"],
      metadata: { capacity: 50, rooms: 25 },
    };

    const createResponse = await axios.post(
      `${BASE_URL}/api/admin/website/content`,
      newItem,
      {
        headers: { Authorization: ADMIN_TOKEN },
      },
    );
    console.log("✅ Novo item criado:", createResponse.data.content.title);
    const newItemId = createResponse.data.content.id;
    console.log("");

    // Teste 5: Atualizar Conteúdo
    console.log(
      "5️⃣ Testando PUT /api/admin/website/content/" + newItemId + "...",
    );
    const updateData = {
      title: "Hotel Teste API - Atualizado",
      price: 160.0,
    };

    const updateResponse = await axios.put(
      `${BASE_URL}/api/admin/website/content/${newItemId}`,
      updateData,
      {
        headers: { Authorization: ADMIN_TOKEN },
      },
    );
    console.log("✅ Item atualizado:", updateResponse.data.content.title);
    console.log("");

    // Teste 6: Deletar Conteúdo
    console.log(
      "6️⃣ Testando DELETE /api/admin/website/content/" + newItemId + "...",
    );
    const deleteResponse = await axios.delete(
      `${BASE_URL}/api/admin/website/content/${newItemId}`,
      {
        headers: { Authorization: ADMIN_TOKEN },
      },
    );
    console.log("✅ Item deletado:", deleteResponse.data.message);
    console.log("");

    // Teste 7: Upload de Imagem
    console.log("7️⃣ Testando POST /api/admin/upload...");
    const uploadResponse = await axios.post(
      `${BASE_URL}/api/admin/upload`,
      {},
      {
        headers: { Authorization: ADMIN_TOKEN },
      },
    );
    console.log("✅ Upload de imagem:", uploadResponse.data.imageUrl);
    console.log("");

    console.log(
      "🎉 Todos os testes CRUD passaram! As APIs estão funcionando perfeitamente.",
    );
    console.log("📊 Resumo dos testes:");
    console.log("   ✅ Health Check");
    console.log("   ✅ Listar Conteúdo");
    console.log("   ✅ Obter Item Específico");
    console.log("   ✅ Criar Novo Conteúdo");
    console.log("   ✅ Atualizar Conteúdo");
    console.log("   ✅ Deletar Conteúdo");
    console.log("   ✅ Upload de Imagem");
  } catch (error) {
    console.error("❌ Erro nos testes:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }
    if (error.code === "ECONNREFUSED") {
      console.log(
        "💡 Dica: Certifique-se de que o servidor está rodando na porta 5000",
      );
    }
  }
}

// Executar testes
testCRUDAPIs();
