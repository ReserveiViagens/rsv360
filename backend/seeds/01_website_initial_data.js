/**
 * Seed: Website Initial Data
 * Purpose: Insert initial website settings and sample content
 * Author: RSV 360 Integration
 * Date: 2025-01-30
 */

exports.seed = function (knex) {
  return Promise.all([
    // 1. Clean existing data
    knex("website_content_history").del(),
    knex("website_content").del(),
    knex("website_settings").del(),
  ])
    .then(function () {
      return Promise.all([
        // 2. Insert website settings
        knex("website_settings").insert([
          {
            setting_key: "site_info",
            setting_value: JSON.stringify({
              title:
                "PROMOFÉRIAS Caldas Novas: Hotel + Parque 20% OFF | Reservei Viagens",
              tagline: "Parques, Hotéis & Atrações",
              description:
                "PROMOFÉRIAS Reservei Viagens! Sua viagem dos sonhos para Caldas Novas com 20% OFF em Hotel + Parque Aquático. Conforto e diversão garantida. Reserve já!",
              keywords:
                "caldas novas, hotel, parque aquatico, promoção, férias, desconto, reservei viagens, viagem, turismo goias, pacotes caldas novas",
            }),
            description: "Informações básicas do site",
          },
          {
            setting_key: "contact_info",
            setting_value: JSON.stringify({
              email: "reservas@reserveiviagens.com.br",
              phones: [
                "(64) 99319-7555",
                "(64) 99306-8752",
                "(65) 99235-1207",
                "(65) 99204-8814",
              ],
              landline: "(65) 2127-0415",
              addresses: {
                sede: "Rua RP5, Residencial Primavera 2, Caldas Novas, GO",
                filial: "Av. Manoel José de Arruda, Porto, Cuiabá, MT",
              },
              hours: "Seg-Sex 8h-18h, Sáb 8h-12h",
            }),
            description: "Dados de contato da empresa",
          },
          {
            setting_key: "social_media",
            setting_value: JSON.stringify({
              facebook: "comercialreservei",
              instagram: "reserveiviagens",
              website: "reserveiviagens.com.br",
            }),
            description: "Redes sociais da empresa",
          },
          {
            setting_key: "seo_config",
            setting_value: JSON.stringify({
              default_image:
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png",
              site_name: "Reservei Viagens",
              locale: "pt_BR",
              twitter_card: "summary_large_image",
            }),
            description: "Configurações de SEO padrão",
          },
        ]),

        // 3. Insert sample hotels data (migrated from hardcoded data)
        knex("website_content").insert([
          {
            page_type: "hotels",
            content_id: "spazzio-diroma",
            title: "Spazzio DiRoma",
            description:
              "Conforto e lazer completo com a qualidade diRoma. Piscinas termais naturais e estrutura completa para toda família.",
            images: JSON.stringify([
              "/images/spazzio-diroma-hotel.jpg",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/reservei%20Viagens%20%281%29.jpg-7DhCDbMcNkgFfxxptkCNaraAWv9kQ7.jpeg",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/reservei%20Viagens%20%282%29.jpg-MjqWbBqajq4aJnz0SdR4sDrHr11Jv7.jpeg",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/reservei%20Viagens%20%2817%29.jpg-fcutcCanqZ9PdfdfCwPmYr0rkw3jjo.jpeg",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/reservei%20Viagens%20%2814%29.jpg-L1a1WYSclQgw2LQl4C3FbR5AhMaYMS.jpeg",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/reservei%20Viagens%20%2812%29.jpg-xMuEzIDnbv1U94YDSwmYZyWnlGjFCI.jpeg",
            ]),
            metadata: JSON.stringify({
              stars: 4,
              price: 250,
              originalPrice: 312.5,
              discount: 20,
              features: [
                "Piscinas Termais",
                "Acqua Park",
                "Restaurante",
                "Wi-Fi Gratuito",
                "Estacionamento",
              ],
              location: "Centro de Caldas Novas",
              capacity: "4 pessoas",
            }),
            seo_data: JSON.stringify({
              meta_title:
                "Spazzio DiRoma - Hotel 4 Estrelas com Piscinas Termais | Reservei Viagens",
              meta_description:
                "Reserve o Spazzio DiRoma com 20% OFF! Hotel 4 estrelas com piscinas termais, Acqua Park e estrutura completa em Caldas Novas.",
              keywords: [
                "spazzio diroma",
                "hotel caldas novas",
                "piscinas termais",
                "acqua park",
              ],
            }),
            status: "active",
            order_index: 1,
          },
          {
            page_type: "hotels",
            content_id: "piazza-diroma",
            title: "Piazza DiRoma",
            description:
              "Sofisticação e acesso privilegiado aos parques diRoma. Arquitetura italiana e serviços premium.",
            images: JSON.stringify([
              "/images/piazza-diroma-hotel.jpg",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piazza%20Didroma%20reservei%20Viagens%20%286%29.jpg-34SGE3Ulyc1owoVthnaoD8TTKMsPh7.jpeg",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piazza%20Didroma%20reservei%20Viagens%20%2829%29.jpg-gyJlNgGgJrvyWQm5cHWsoqQYr4819K.jpeg",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Piazza%20Didroma%20reservei%20Viagens%20%2811%29.jpg-I7eNXZKVAFPQBpFM4VjUNBJueQU65s.jpeg",
            ]),
            metadata: JSON.stringify({
              stars: 5,
              price: 260,
              originalPrice: 325,
              discount: 20,
              features: [
                "Arquitetura Italiana",
                "Spa Premium",
                "Piscinas Exclusivas",
                "Restaurante Gourmet",
                "Concierge",
              ],
              location: "Área Nobre - Caldas Novas",
              capacity: "4 pessoas",
            }),
            seo_data: JSON.stringify({
              meta_title:
                "Piazza DiRoma - Hotel 5 Estrelas Arquitetura Italiana | Reservei Viagens",
              meta_description:
                "Piazza DiRoma 5 estrelas com 20% OFF! Arquitetura italiana, spa premium e serviços exclusivos em Caldas Novas.",
              keywords: [
                "piazza diroma",
                "hotel 5 estrelas",
                "arquitetura italiana",
                "spa premium",
              ],
            }),
            status: "active",
            order_index: 2,
          },
          {
            page_type: "hotels",
            content_id: "lacqua-diroma",
            title: "Lacqua DiRoma",
            description:
              "Parque aquático exclusivo e diversão para toda a família. Toboáguas e piscinas de ondas incríveis.",
            images: JSON.stringify([
              "/images/lacqua-diroma-hotel.png",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/184981043%20%281%29-I2iuBzXMrj8RLrl2o2tI55osVahFhB.jpeg",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/184981048-bOYk2CDC50epvKbMqur42WwuJY3KFa.jpeg",
            ]),
            metadata: JSON.stringify({
              stars: 4,
              price: 440,
              originalPrice: 550,
              discount: 20,
              features: [
                "Jardins Acqua Park",
                "Piscinas de Ondas",
                "Toboáguas",
                "Ofurôs",
                "Kids Club",
              ],
              location: "Próximo ao Centro",
              capacity: "4 pessoas",
            }),
            seo_data: JSON.stringify({
              meta_title:
                "Lacqua DiRoma - Hotel com Parque Aquático Exclusivo | Reservei Viagens",
              meta_description:
                "Lacqua DiRoma com 20% OFF! Hotel com parque aquático exclusivo, toboáguas e piscinas de ondas em Caldas Novas.",
              keywords: [
                "lacqua diroma",
                "parque aquático",
                "toboáguas",
                "piscinas de ondas",
              ],
            }),
            status: "active",
            order_index: 3,
          },
        ]),
      ]);
    })
    .then(function () {
      return Promise.all([
        // 4. Insert sample promotions data
        knex("website_content").insert([
          {
            page_type: "promotions",
            content_id: "promoferias-20off",
            title: "PROMOFÉRIAS Hotel + Parque Aquático",
            description:
              "Sinta a magia de Caldas Novas! Pacote completo com hotel 4 estrelas + acesso a parque aquático com estacionamento gratuito incluso.",
            images: JSON.stringify([
              "/images/promoferias-parque-aquatico.jpeg",
            ]),
            metadata: JSON.stringify({
              price: 149,
              originalPrice: 186,
              discount: 20,
              badge: "PROMOFÉRIAS",
              validUntil: "31/01/2025",
              includes: [
                "Hotel 4 estrelas",
                "Parque aquático",
                "Estacionamento Gratuito",
                "Wi-Fi grátis",
              ],
              highlight: true,
            }),
            seo_data: JSON.stringify({
              meta_title:
                "PROMOFÉRIAS: Hotel + Parque Aquático 20% OFF | Reservei Viagens",
              meta_description:
                "PROMOFÉRIAS imperdível! Hotel 4 estrelas + parque aquático com 20% OFF. Pacote completo em Caldas Novas por R$ 149.",
              keywords: [
                "promoférias",
                "hotel parque aquático",
                "caldas novas promoção",
                "20% desconto",
              ],
            }),
            status: "active",
            order_index: 1,
          },
          {
            page_type: "promotions",
            content_id: "melhor-idade",
            title: "Pacote Melhor Idade Caldas Novas",
            description:
              "Condições especiais para grupos da melhor idade com atividades adaptadas e acompanhamento especializado.",
            images: JSON.stringify(["/images/melhor-idade-caldas-novas.jpeg"]),
            metadata: JSON.stringify({
              price: 210,
              originalPrice: 260,
              discount: 20,
              badge: "Melhor Idade",
              validUntil: "28/02/2025",
              includes: [
                "Momentos de lazer e convivência",
                "Atividades recreativas adaptadas",
                "Tratamento em Piscinas termais",
                "Hospedagem em hotel com estrutura adaptada",
              ],
            }),
            seo_data: JSON.stringify({
              meta_title:
                "Pacote Melhor Idade - Caldas Novas com 20% OFF | Reservei Viagens",
              meta_description:
                "Pacote especial para melhor idade em Caldas Novas. Atividades adaptadas e piscinas termais com 20% de desconto.",
              keywords: [
                "melhor idade",
                "terceira idade",
                "caldas novas idosos",
                "piscinas termais",
              ],
            }),
            status: "active",
            order_index: 2,
          },
        ]),
      ]);
    })
    .then(function () {
      return Promise.all([
        // 5. Insert sample attractions data
        knex("website_content").insert([
          {
            page_type: "attractions",
            content_id: "hot-park",
            title: "Hot Park - Parque Aquático",
            description:
              "O maior parque aquático de águas termais do mundo! Toboáguas emocionantes, piscinas de ondas e diversão garantida.",
            images: JSON.stringify([
              "/images/hot-park-attraction.jpg",
              "https://example.com/hot-park-1.jpg",
              "https://example.com/hot-park-2.jpg",
            ]),
            metadata: JSON.stringify({
              category: "Parque Aquático",
              duration: "Dia inteiro",
              ageGroup: "Todas as idades",
              highlights: [
                "Maior parque aquático termal do mundo",
                "Toboáguas emocionantes",
                "Piscinas de ondas",
                "Área kids",
              ],
              location: "Rio Quente, GO",
              operatingHours: "9h às 18h",
            }),
            seo_data: JSON.stringify({
              meta_title:
                "Hot Park - Maior Parque Aquático Termal do Mundo | Reservei Viagens",
              meta_description:
                "Visite o Hot Park, maior parque aquático de águas termais do mundo! Toboáguas, piscinas de ondas e diversão em Rio Quente.",
              keywords: [
                "hot park",
                "parque aquático termal",
                "rio quente",
                "toboáguas",
                "águas termais",
              ],
            }),
            status: "active",
            order_index: 1,
          },
          {
            page_type: "attractions",
            content_id: "parque-ecologico",
            title: "Parque Ecológico de Caldas Novas",
            description:
              "Trilhas ecológicas, nascentes termais naturais e contato direto com a natureza do cerrado goiano.",
            images: JSON.stringify(["/images/parque-ecologico.jpg"]),
            metadata: JSON.stringify({
              category: "Ecoturismo",
              duration: "4 horas",
              ageGroup: "Todas as idades",
              highlights: [
                "Trilhas ecológicas",
                "Nascentes termais",
                "Fauna e flora do cerrado",
                "Banho em águas naturais",
              ],
              location: "Caldas Novas, GO",
              operatingHours: "8h às 17h",
            }),
            seo_data: JSON.stringify({
              meta_title:
                "Parque Ecológico - Trilhas e Nascentes Termais | Reservei Viagens",
              meta_description:
                "Explore o Parque Ecológico de Caldas Novas! Trilhas, nascentes termais naturais e a beleza do cerrado goiano.",
              keywords: [
                "parque ecológico",
                "trilhas caldas novas",
                "nascentes termais",
                "ecoturismo",
                "cerrado",
              ],
            }),
            status: "active",
            order_index: 2,
          },
        ]),
      ]);
    });
};
