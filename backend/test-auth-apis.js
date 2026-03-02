const axios = require("axios");

const BASE_URL = "http://localhost:5000";

// Função para testar as APIs de autenticação
async function testAuthAPIs() {
  console.log("🔐 Iniciando testes das APIs de Autenticação...\n");

  let authToken = null;

  try {
    // Teste 1: Health Check
    console.log("1️⃣ Testando Health Check...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health Check:", healthResponse.data.status);
    console.log("");

    // Teste 2: Login com credenciais válidas
    console.log("2️⃣ Testando Login...");
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "admin@rsv360.com",
      password: "admin123",
    });
    console.log("✅ Login realizado:", loginResponse.data.data.user.name);
    console.log("   Role:", loginResponse.data.data.user.role);
    console.log(
      "   Token recebido:",
      loginResponse.data.data.token ? "Sim" : "Não",
    );
    authToken = loginResponse.data.data.token;
    console.log("");

    // Teste 3: Verificar token
    console.log("3️⃣ Testando verificação de token...");
    const verifyResponse = await axios.post(
      `${BASE_URL}/api/auth/verify`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    console.log("✅ Token válido:", verifyResponse.data.data.user.email);
    console.log("");

    // Teste 4: Obter dados do usuário
    console.log("4️⃣ Testando GET /api/auth/me...");
    const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Dados do usuário:", meResponse.data.data.user.name);
    console.log("   Email:", meResponse.data.data.user.email);
    console.log("   Role:", meResponse.data.data.user.role);
    console.log("");

    // Teste 5: Testar acesso às APIs admin
    console.log("5️⃣ Testando acesso às APIs admin...");
    const adminResponse = await axios.get(
      `${BASE_URL}/api/admin/website/content`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    console.log(
      "✅ Acesso às APIs admin:",
      adminResponse.data.total,
      "itens encontrados",
    );
    console.log("");

    // Teste 6: Testar login com credenciais inválidas
    console.log("6️⃣ Testando login com credenciais inválidas...");
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: "admin@rsv360.com",
        password: "senhaerrada",
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(
          "✅ Login com credenciais inválidas rejeitado corretamente",
        );
      } else {
        throw error;
      }
    }
    console.log("");

    // Teste 7: Testar acesso sem token
    console.log("7️⃣ Testando acesso sem token...");
    try {
      await axios.get(`${BASE_URL}/api/admin/website/content`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("✅ Acesso sem token rejeitado corretamente");
      } else {
        throw error;
      }
    }
    console.log("");

    // Teste 8: Logout
    console.log("8️⃣ Testando logout...");
    const logoutResponse = await axios.post(
      `${BASE_URL}/api/auth/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    console.log("✅ Logout realizado:", logoutResponse.data.message);
    console.log("");

    console.log("🎉 Todos os testes de autenticação passaram!");
    console.log("📊 Resumo dos testes:");
    console.log("   ✅ Health Check");
    console.log("   ✅ Login com credenciais válidas");
    console.log("   ✅ Verificação de token");
    console.log("   ✅ Obter dados do usuário");
    console.log("   ✅ Acesso às APIs admin");
    console.log("   ✅ Rejeição de credenciais inválidas");
    console.log("   ✅ Rejeição de acesso sem token");
    console.log("   ✅ Logout");
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
testAuthAPIs();
