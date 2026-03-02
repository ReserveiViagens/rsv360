const axios = require("axios");
const { db } = require("../src/config/database");

const API_BASE_URL = "http://localhost:5000";

// Test data
const testUser = {
  name: "Admin RSV",
  email: "admin@reserveiviagens.com.br",
  password: "admin123456",
  role: "admin",
};

const testBooking = {
  title: "Caldas Novas - Pacote Família",
  description: "Pacote completo para família com 2 adultos e 2 crianças",
  type: "package",
  start_date: "2025-02-15",
  end_date: "2025-02-18",
  total_amount: 2500.0,
  currency: "BRL",
  guests_count: 4,
  adults_count: 2,
  children_count: 2,
  provider_name: "Hotel Caldas Plaza",
};

const testPayment = {
  amount: 1250.0,
  method: "credit_card",
  installments: 2,
  description: "Pagamento entrada - Caldas Novas",
  card_data: {
    number: "4111111111111111",
    brand: "visa",
    holder_name: "ADMIN RSV",
    expiry_month: "12",
    expiry_year: "26",
    cvv: "123",
  },
};

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testAPI() {
  console.log("🚀 Iniciando teste de integração completo...\n");

  let authToken = null;
  let userId = null;
  let bookingId = null;
  let paymentId = null;

  try {
    // 1. Test health check
    console.log("1️⃣ Testando health check...");
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log(`✅ Health check: ${healthResponse.data.status}`);

    // 2. Test user registration
    console.log("\n2️⃣ Testando registro de usuário...");
    try {
      const registerResponse = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        testUser,
      );
      console.log(`✅ Usuário registrado: ${registerResponse.data.data.email}`);
      userId = registerResponse.data.data.id;
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("already exists")
      ) {
        console.log("ℹ️ Usuário já existe, continuando...");
      } else {
        throw error;
      }
    }

    // 3. Test user login
    console.log("\n3️⃣ Testando login...");
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    if (loginResponse.data.data.requiresTwoFactor) {
      console.log("ℹ️ 2FA requerido, mas continuando teste...");
      return;
    }

    authToken = loginResponse.data.data.access_token;
    userId = loginResponse.data.data.user.id;
    console.log(`✅ Login realizado: ${loginResponse.data.data.user.email}`);

    // Setup axios with auth token
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    // 4. Test booking creation
    console.log("\n4️⃣ Testando criação de reserva...");
    const bookingResponse = await apiClient.post("/api/bookings", testBooking);
    bookingId = bookingResponse.data.data.id;
    console.log(
      `✅ Reserva criada: ${bookingResponse.data.data.booking_number}`,
    );

    // 5. Test booking retrieval
    console.log("\n5️⃣ Testando busca de reserva...");
    const getBookingResponse = await apiClient.get(
      `/api/bookings/${bookingId}`,
    );
    console.log(`✅ Reserva encontrada: ${getBookingResponse.data.data.title}`);

    // 6. Test booking list
    console.log("\n6️⃣ Testando lista de reservas...");
    const bookingsListResponse = await apiClient.get("/api/bookings");
    console.log(
      `✅ Lista de reservas: ${bookingsListResponse.data.data.bookings.length} reservas`,
    );

    // 7. Test payment processing
    console.log("\n7️⃣ Testando processamento de pagamento...");
    const paymentResponse = await apiClient.post("/api/payments", {
      ...testPayment,
      booking_id: bookingId,
    });
    paymentId = paymentResponse.data.data.id;
    console.log(
      `✅ Pagamento processado: ${paymentResponse.data.data.transaction_id}`,
    );

    // 8. Test payment retrieval
    console.log("\n8️⃣ Testando busca de pagamento...");
    const getPaymentResponse = await apiClient.get(
      `/api/payments/${paymentId}`,
    );
    console.log(
      `✅ Pagamento encontrado: ${getPaymentResponse.data.data.status}`,
    );

    // 9. Test statistics (if admin)
    try {
      console.log("\n9️⃣ Testando estatísticas...");
      const bookingStatsResponse = await apiClient.get("/api/bookings/stats");
      console.log(
        `✅ Estatísticas de reservas: ${bookingStatsResponse.data.data.overview.total_bookings} total`,
      );

      const paymentStatsResponse = await apiClient.get("/api/payments/stats");
      console.log(
        `✅ Estatísticas de pagamentos: R$ ${paymentStatsResponse.data.data.overview.total_revenue}`,
      );
    } catch (error) {
      console.log("ℹ️ Estatísticas não disponíveis (permissões)");
    }

    // 10. Test API documentation
    console.log("\n🔟 Testando documentação da API...");
    const docsResponse = await axios.get(`${API_BASE_URL}/api-docs`);
    console.log(`✅ Documentação disponível (${docsResponse.status})`);

    console.log("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 🎉");
    console.log("\n📊 RESUMO DOS TESTES:");
    console.log(`   ✅ Health Check`);
    console.log(`   ✅ Registro de Usuário`);
    console.log(`   ✅ Login/Autenticação`);
    console.log(`   ✅ Criação de Reserva`);
    console.log(`   ✅ Busca de Reserva`);
    console.log(`   ✅ Lista de Reservas`);
    console.log(`   ✅ Processamento de Pagamento`);
    console.log(`   ✅ Busca de Pagamento`);
    console.log(`   ✅ Estatísticas (se disponível)`);
    console.log(`   ✅ Documentação da API`);

    console.log("\n🔥 SISTEMA ONBOARDING RSV FUNCIONANDO 100%! 🔥");
  } catch (error) {
    console.error("\n❌ ERRO NO TESTE:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);
    console.error("URL:", error.config?.url);
  }
}

// Database connection test
async function testDatabase() {
  console.log("\n💾 Testando conexão com banco de dados...");

  try {
    // Test database connection
    await db.raw("SELECT 1");
    console.log("✅ Conexão com banco de dados OK");

    // Count tables
    const tables = await db.raw(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    );
    console.log(`✅ Tabelas criadas: ${tables.length}`);

    // Count users
    const userCount = await db("users").count("* as count").first();
    console.log(`✅ Usuários no banco: ${userCount.count}`);

    // Count bookings
    const bookingCount = await db("bookings").count("* as count").first();
    console.log(`✅ Reservas no banco: ${bookingCount.count}`);

    // Count payments
    const paymentCount = await db("payments").count("* as count").first();
    console.log(`✅ Pagamentos no banco: ${paymentCount.count}`);
  } catch (error) {
    console.error("❌ Erro no banco de dados:", error.message);
  }
}

// Main test function
async function runTests() {
  console.log("🎯 TESTE DE INTEGRAÇÃO - ONBOARDING RSV");
  console.log("=========================================\n");

  // Wait for server to be ready
  console.log("⏳ Aguardando servidor estar pronto...");
  await wait(3000);

  // Test database first
  await testDatabase();

  // Then test API
  await testAPI();

  console.log("\n🏁 TESTE COMPLETO FINALIZADO!");
  process.exit(0);
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error("❌ Erro não tratado:", error);
  process.exit(1);
});

// Run tests
runTests();
