/**
 * 🧠 CHAIN OF THOUGHT: Script de Migração de Dados do Website
 * 🦴 SKELETON OF THOUGHT: Extrair → Transformar → Carregar (ETL)
 * 🌳 TREE OF THOUGHT: Prioridade: Hotéis > Promoções > Atrações > Ingressos > Configurações
 * ✅ SELF CONSISTENCY: Validar dados após inserção
 * 📊 Dados: 41 hotéis, 11 promoções, 7 atrações, 5 ingressos
 */

const { db } = require("../src/config/database");
const {
  hotelData,
  promotionsData,
  attractionsData,
  ticketsData,
} = require("./website-content-full-data");

// ⚙️ CONFIGURAÇÕES DO SITE
const settingsData = [
  {
    setting_key: "site_info",
    setting_value: {
      title: "Reservei Viagens",
      tagline: "Parques, Hotéis & Atrações em Caldas Novas",
      description:
        "Especialistas em turismo em Caldas Novas. Os melhores hotéis, pacotes e atrações com desconto especial.",
    },
    description: "Informações básicas do site",
  },
  {
    setting_key: "contact_info",
    setting_value: {
      phones: [
        "(64) 99319-7555",
        "(64) 99306-8752",
        "(65) 99235-1207",
        "(65) 99204-8814",
      ],
      email: "reservas@reserveiviagens.com.br",
      whatsapp: "5564993197555",
      address: "Rua RP5, Residencial Primavera 2, Caldas Novas, GO",
      filial: "Av. Manoel José de Arruda, Porto, Cuiabá, MT",
      fixo: "(65) 2127-0415",
      hours: "Seg-Sex 8h-18h, Sáb 8h-12h",
    },
    description: "Dados de contato da empresa",
  },
  {
    setting_key: "social_media",
    setting_value: {
      facebook: "facebook.com/comercialreservei",
      instagram: "@reserveiviagens",
      website: "reserveiviagens.com.br",
    },
    description: "Redes sociais e website",
  },
  {
    setting_key: "seo_global",
    setting_value: {
      title: "Reservei Viagens - Hotéis e Atrações em Caldas Novas",
      description:
        "Especialista em turismo em Caldas Novas. Hotéis com desconto, pacotes promocionais e as melhores atrações.",
      keywords: [
        "caldas novas",
        "hotéis caldas novas",
        "piscinas termais",
        "reservei viagens",
        "turismo goiás",
      ],
      og_image: "/images/og-reservei-viagens.jpg",
    },
    description: "Configurações SEO globais",
  },
];

/**
 * 🚀 FUNÇÃO PRINCIPAL DE MIGRAÇÃO
 */
async function migrateWebsiteData() {
  console.log("🧠 INICIANDO MIGRAÇÃO COM CHAIN OF THOUGHT");
  console.log("🦴 SKELETON: Configurações → Hotéis → Promoções → Atrações");

  try {
    // 🔄 STEP 1: Limpar dados existentes
    console.log("\n📋 Limpando dados existentes...");
    await db("website_content").del();
    await db("website_settings").del();

    // 🔄 STEP 2: Inserir configurações
    console.log("\n⚙️ Inserindo configurações do site...");
    for (const setting of settingsData) {
      await db("website_settings").insert({
        setting_key: setting.setting_key,
        setting_value: JSON.stringify(setting.setting_value),
        description: setting.description,
        updated_at: new Date(),
      });
      console.log(`✅ Configuração "${setting.setting_key}" inserida`);
    }

    // 🔄 STEP 3: Inserir hotéis
    console.log("\n🏨 Inserindo dados de hotéis...");
    for (const hotel of hotelData) {
      await db("website_content").insert({
        page_type: "hotels",
        content_id: hotel.content_id,
        title: hotel.title,
        description: hotel.description,
        images: JSON.stringify(hotel.images),
        metadata: JSON.stringify(hotel.metadata),
        seo_data: JSON.stringify(hotel.seo_data),
        status: "active",
        order_index: hotel.order_index,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`✅ Hotel "${hotel.title}" inserido`);
    }

    // 🔄 STEP 4: Inserir promoções
    console.log("\n🔥 Inserindo promoções...");
    for (const promo of promotionsData) {
      await db("website_content").insert({
        page_type: "promotions",
        content_id: promo.content_id,
        title: promo.title,
        description: promo.description,
        images: JSON.stringify(promo.images),
        metadata: JSON.stringify(promo.metadata),
        seo_data: JSON.stringify(promo.seo_data),
        status: "active",
        order_index: promo.order_index,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`✅ Promoção "${promo.title}" inserida`);
    }

    // 🔄 STEP 5: Inserir atrações
    console.log("\n🎢 Inserindo atrações...");
    for (const attraction of attractionsData) {
      await db("website_content").insert({
        page_type: "attractions",
        content_id: attraction.content_id,
        title: attraction.title,
        description: attraction.description,
        images: JSON.stringify(attraction.images),
        metadata: JSON.stringify(attraction.metadata),
        seo_data: JSON.stringify(attraction.seo_data),
        status: "active",
        order_index: attraction.order_index,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`✅ Atração "${attraction.title}" inserida`);
    }

    // 🔄 STEP 6: Inserir ingressos (tickets)
    console.log("\n🎟️ Inserindo ingressos...");
    for (const ticket of ticketsData) {
      await db("website_content").insert({
        page_type: "tickets",
        content_id: ticket.content_id,
        title: ticket.title,
        description: ticket.description,
        images: JSON.stringify(ticket.images),
        metadata: JSON.stringify(ticket.metadata),
        seo_data: JSON.stringify(ticket.seo_data),
        status: "active",
        order_index: ticket.order_index,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`✅ Ingresso "${ticket.title}" inserido`);
    }

    // 🔄 STEP 7: Garantir tabela website_header (para Header do CMS)
    try {
      const hasHeaderTable = await db.raw(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'website_header'
        )
      `);
      if (!hasHeaderTable.rows[0]?.exists) {
        await db.raw(`
          CREATE TABLE IF NOT EXISTS website_header (
            id SERIAL PRIMARY KEY,
            type VARCHAR(10) NOT NULL CHECK (type IN ('image', 'video')),
            url TEXT NOT NULL,
            title TEXT,
            autoplay BOOLEAN DEFAULT true,
            muted BOOLEAN DEFAULT true,
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        await db.raw(`
          INSERT INTO website_header (type, url, title, autoplay, muted, updated_at)
          VALUES ('image', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png', 'Reservei Viagens', true, true, NOW())
        `);
        console.log("✅ Tabela website_header criada com header padrão");
      }
    } catch (headerErr) {
      console.warn("⚠️ website_header:", headerErr.message);
    }

    // ✅ STEP 8: SELF CONSISTENCY - Validação
    console.log("\n🎯 SELF CONSISTENCY - Validando dados inseridos...");

    const hotelCount = await db("website_content")
      .where("page_type", "hotels")
      .count("* as total");
    const promotionCount = await db("website_content")
      .where("page_type", "promotions")
      .count("* as total");
    const attractionCount = await db("website_content")
      .where("page_type", "attractions")
      .count("* as total");
    const ticketCount = await db("website_content")
      .where("page_type", "tickets")
      .count("* as total");
    const settingsCount = await db("website_settings").count("* as total");

    console.log(`📊 RESULTADOS:`);
    console.log(`   🏨 Hotéis: ${hotelCount[0].total} registros`);
    console.log(`   🔥 Promoções: ${promotionCount[0].total} registros`);
    console.log(`   🎢 Atrações: ${attractionCount[0].total} registros`);
    console.log(`   🎟️ Ingressos: ${ticketCount[0].total} registros`);
    console.log(`   ⚙️ Configurações: ${settingsCount[0].total} registros`);

    console.log("\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!");
    console.log(
      "🧠 CHAIN OF THOUGHT aplicado: Análise → Transformação → Carregamento → Validação",
    );
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
    throw error;
  }
}

/**
 * 🏃‍♂️ EXECUTAR SE CHAMADO DIRETAMENTE
 */
if (require.main === module) {
  migrateWebsiteData()
    .then(() => {
      console.log("\n✅ Script de migração finalizado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Falha na migração:", error);
      process.exit(1);
    });
}

module.exports = { migrateWebsiteData };
