const { db } = require("../src/config/database");
const logger = require("../src/utils/logger");

async function seedNewData() {
  console.log("🌱 Criando dados de exemplo para novas tabelas...\n");

  try {
    // Seed Customers
    console.log("👥 Criando clientes de exemplo...");
    const customers = [
      {
        name: "Maria Silva Santos",
        email: "maria.santos@email.com",
        phone: "(64) 99999-1111",
        document: "123.456.789-01",
        document_type: "cpf",
        birth_date: "1985-05-15",
        gender: "F",
        address: "Rua das Flores, 123",
        city: "Caldas Novas",
        state: "GO",
        zip_code: "75690-000",
        status: "active",
        type: "individual",
        preferred_contact: "whatsapp",
        marketing_consent: true,
        total_bookings: 3,
        total_spent: 4500.0,
        average_booking_value: 1500.0,
        vip_level: "gold",
        travel_preferences: JSON.stringify([
          "águas termais",
          "família",
          "resort",
        ]),
        created_by: 1,
      },
      {
        name: "João Carlos Oliveira",
        email: "joao.oliveira@email.com",
        phone: "(64) 99999-2222",
        document: "987.654.321-02",
        document_type: "cpf",
        birth_date: "1978-10-22",
        gender: "M",
        address: "Av. Central, 456",
        city: "Goiânia",
        state: "GO",
        zip_code: "74000-000",
        status: "active",
        type: "individual",
        preferred_contact: "email",
        marketing_consent: true,
        total_bookings: 5,
        total_spent: 8200.0,
        average_booking_value: 1640.0,
        vip_level: "platinum",
        travel_preferences: JSON.stringify([
          "aventura",
          "natureza",
          "ecoturismo",
        ]),
        created_by: 1,
      },
      {
        name: "Empresa TurCorp LTDA",
        email: "contato@turcorp.com.br",
        phone: "(11) 3333-4444",
        document: "12.345.678/0001-90",
        document_type: "cnpj",
        address: "Rua Empresarial, 789",
        city: "São Paulo",
        state: "SP",
        zip_code: "01000-000",
        status: "active",
        type: "corporate",
        company_name: "TurCorp Viagens Corporativas",
        preferred_contact: "email",
        marketing_consent: true,
        total_bookings: 12,
        total_spent: 25000.0,
        average_booking_value: 2083.33,
        vip_level: "platinum",
        travel_preferences: JSON.stringify([
          "corporativo",
          "eventos",
          "grupos",
        ]),
        created_by: 1,
      },
    ];

    for (const customer of customers) {
      await db("customers").insert(customer);
    }
    console.log(`✅ ${customers.length} clientes criados com sucesso!`);

    // Seed Travel Packages
    console.log("\n🏝️ Criando pacotes de viagem...");
    const packages = [
      {
        name: "Caldas Novas Família - 3 dias",
        slug: "caldas-novas-familia-3-dias",
        description:
          "Pacote completo para família em Caldas Novas com hospedagem em resort, águas termais e atividades para crianças.",
        short_description:
          "Diversão garantida para toda família nas águas termais de Caldas Novas",
        destination: "Caldas Novas, GO",
        category: "package",
        duration_days: 3,
        duration_nights: 2,
        base_price: 1200.0,
        adult_price: 400.0,
        child_price: 200.0,
        infant_price: 0.0,
        min_people: 2,
        max_people: 6,
        status: "active",
        is_featured: true,
        included_services: JSON.stringify([
          "Hospedagem em resort 4 estrelas",
          "Café da manhã incluso",
          "Acesso às piscinas termais",
          "Atividades recreativas para crianças",
          "Transfer aeroporto",
        ]),
        hotel_name: "DiRoma Resort Caldas Novas",
        hotel_stars: 4,
        hotel_address: "Rua das Fontes, 1000 - Caldas Novas, GO",
        transportation_included: true,
        transportation_type: "van",
        meals_included: true,
        meal_plan: "breakfast",
        tour_guide_included: false,
        total_bookings: 45,
        average_rating: 4.8,
        total_reviews: 32,
        gallery_images: JSON.stringify([
          "https://example.com/caldas1.jpg",
          "https://example.com/caldas2.jpg",
        ]),
        tags: JSON.stringify([
          "família",
          "águas termais",
          "resort",
          "crianças",
        ]),
        created_by: 1,
      },
      {
        name: "Rio Quente Romance - 2 dias",
        slug: "rio-quente-romance-2-dias",
        description:
          "Escapada romântica no Rio Quente Resorts com spa, jantar especial e atividades para casais.",
        short_description:
          "Fim de semana romântico nas águas termais do Rio Quente",
        destination: "Rio Quente, GO",
        category: "package",
        duration_days: 2,
        duration_nights: 1,
        base_price: 800.0,
        adult_price: 400.0,
        min_people: 2,
        max_people: 2,
        status: "active",
        is_featured: true,
        included_services: JSON.stringify([
          "Hospedagem suite romântica",
          "Jantar especial para dois",
          "Spa com massagem relaxante",
          "Acesso ao Hot Park",
          "Transfer incluso",
        ]),
        hotel_name: "Rio Quente Resorts",
        hotel_stars: 5,
        transportation_included: true,
        meals_included: true,
        meal_plan: "dinner",
        total_bookings: 28,
        average_rating: 4.9,
        total_reviews: 24,
        tags: JSON.stringify(["romance", "spa", "águas termais", "casal"]),
        created_by: 1,
      },
      {
        name: "Pirenópolis Histórico - 4 dias",
        slug: "pirenopolis-historico-4-dias",
        description:
          "Explore a cidade histórica de Pirenópolis com suas cachoeiras, arquitetura colonial e gastronomia local.",
        short_description: "Turismo histórico e ecológico em Pirenópolis",
        destination: "Pirenópolis, GO",
        category: "tour",
        duration_days: 4,
        duration_nights: 3,
        base_price: 950.0,
        adult_price: 475.0,
        child_price: 280.0,
        min_people: 2,
        max_people: 8,
        difficulty_level: "moderate",
        status: "active",
        included_services: JSON.stringify([
          "Hospedagem pousada histórica",
          "City tour guiado",
          "Visita às cachoeiras",
          "Degustação gastronômica",
          "Transporte local",
        ]),
        hotel_name: "Pousada dos Pireneus",
        hotel_stars: 3,
        transportation_included: true,
        tour_guide_included: true,
        guide_language: "Portuguese",
        total_bookings: 18,
        average_rating: 4.6,
        total_reviews: 15,
        tags: JSON.stringify([
          "história",
          "cachoeiras",
          "ecoturismo",
          "gastronomia",
        ]),
        created_by: 1,
      },
      {
        name: "Águas Termais Premium - 5 dias",
        slug: "aguas-termais-premium-5-dias",
        description:
          "Experiência premium em Caldas Novas com hospedagem 5 estrelas, tratamentos spa e gastronomia gourmet.",
        short_description: "Luxo e relaxamento nas melhores águas termais",
        destination: "Caldas Novas, GO",
        category: "package",
        duration_days: 5,
        duration_nights: 4,
        base_price: 2500.0,
        adult_price: 1250.0,
        child_price: 625.0,
        min_people: 2,
        max_people: 4,
        status: "active",
        is_featured: true,
        included_services: JSON.stringify([
          "Hospedagem resort 5 estrelas",
          "All inclusive premium",
          "Spa com tratamentos exclusivos",
          "Jantar gourmet",
          "Transfer executivo",
          "Concierge personalizado",
        ]),
        hotel_name: "Pousada do Rio Quente Resort Premium",
        hotel_stars: 5,
        transportation_included: true,
        transportation_type: "car",
        meals_included: true,
        meal_plan: "all_inclusive",
        tour_guide_included: true,
        total_bookings: 12,
        average_rating: 5.0,
        total_reviews: 8,
        tags: JSON.stringify([
          "luxo",
          "premium",
          "spa",
          "gastronomia",
          "all-inclusive",
        ]),
        created_by: 1,
      },
    ];

    for (const package of packages) {
      await db("travel_packages").insert(package);
    }
    console.log(`✅ ${packages.length} pacotes de viagem criados com sucesso!`);

    console.log("\n🎉 Dados de exemplo criados com sucesso!\n");

    // Show summary
    const customerCount = await db("customers").count("* as count").first();
    const packageCount = await db("travel_packages")
      .count("* as count")
      .first();

    console.log("📊 RESUMO DOS DADOS CRIADOS:");
    console.log(`   👥 Clientes: ${customerCount.count}`);
    console.log(`   🏝️ Pacotes: ${packageCount.count}`);
    console.log("");
  } catch (error) {
    console.error("❌ Erro ao criar dados de exemplo:", error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  seedNewData()
    .then(() => {
      console.log("✅ Script executado com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro no script:", error);
      process.exit(1);
    });
}

module.exports = { seedNewData };
