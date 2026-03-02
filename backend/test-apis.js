const axios = require("axios");

const BASE_URL = "http://localhost:5000";

// Função para testar as APIs
async function testAPIs() {
  console.log("🧪 Iniciando testes das APIs...\n");

  try {
    // Teste 1: Health Check
    console.log("1️⃣ Testando Health Check...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health Check:", healthResponse.data);
    console.log("");

    // Teste 2: Test Endpoint
    console.log("2️⃣ Testando Endpoint de Teste...");
    const testResponse = await axios.get(`${BASE_URL}/test`);
    console.log("✅ Test Endpoint:", testResponse.data);
    console.log("");

    console.log("🎉 Todos os testes passaram! As APIs estão funcionando.");
  } catch (error) {
    console.error("❌ Erro nos testes:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.log(
        "💡 Dica: Certifique-se de que o servidor está rodando na porta 5000",
      );
    }
  }
}

// Executar testes
testAPIs();
