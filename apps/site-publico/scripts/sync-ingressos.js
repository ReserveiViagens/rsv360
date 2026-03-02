/**
 * Script para sincronizar ingressos da página pública para o CMS
 * Executa: node scripts/sync-ingressos.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';
const ADMIN_TOKEN = 'admin-token-123';

// Dados dos ingressos da página /ingressos
const ticketsFromPublicSite = [
  {
    id: "hot-park",
    name: "Ingresso Hot Park",
    description: "Aventura e relaxamento no maior parque de águas quentes da América do Sul! Toboáguas emocionantes e piscinas termais naturais.",
    price: 189,
    originalPrice: 220,
    discount: 14,
    image: "/images/lagoa-termas-parque.jpeg",
    features: ["Toboáguas radicais", "Piscinas termais", "Rio lento", "Área infantil", "Restaurantes"],
    location: "Rio Quente - GO",
    duration: "Dia inteiro",
    ageGroup: "Todas as idades",
    popular: true,
  },
  {
    id: "diroma-acqua-park",
    name: "Ingresso diRoma Acqua Park",
    description: "Diversão aquática para todas as idades com toboáguas emocionantes e piscinas de ondas incríveis.",
    price: 90,
    originalPrice: 110,
    discount: 18,
    image: "/images/diroma-acqua-park.jpeg",
    features: ["Toboáguas variados", "Piscina de ondas", "Área kids", "Bar molhado", "Espreguiçadeiras"],
    location: "Caldas Novas - GO",
    duration: "Dia inteiro",
    ageGroup: "Todas as idades",
  },
  {
    id: "lagoa-termas",
    name: "Ingresso Lagoa Termas Parque",
    description: "Relaxe nas águas termais da Lagoa Quente e aproveite a natureza exuberante em um ambiente único.",
    price: 75,
    originalPrice: 95,
    discount: 21,
    image: "/images/hot-park.jpeg",
    features: ["Águas termais naturais", "Trilhas ecológicas", "Área de descanso", "Lanchonete", "Estacionamento"],
    location: "Caldas Novas - GO",
    duration: "Meio dia",
    ageGroup: "Todas as idades",
  },
  {
    id: "water-park",
    name: "Ingresso Water Park",
    description: "Parque aquático moderno com as mais novas atrações e tecnologia de ponta para diversão garantida.",
    price: 120,
    originalPrice: 150,
    discount: 20,
    image: "/images/water-park.jpeg",
    features: ["Toboáguas modernos", "Piscina com ondas", "Tirolesa aquática", "Área gourmet", "Wi-Fi gratuito"],
    location: "Caldas Novas - GO",
    duration: "Dia inteiro",
    ageGroup: "Todas as idades",
  },
  {
    id: "kawana-park",
    name: "Ingresso Kawana Park",
    description: "Parque aquático familiar com piscinas termais naturais, toboáguas emocionantes e área de lazer completa. Diversão garantida em águas quentinhas!",
    price: 85,
    originalPrice: 110,
    discount: 23,
    image: "/images/kawana-park.jpeg",
    features: [
      "Piscinas termais naturais",
      "Toboáguas familiares",
      "Área infantil aquática",
      "Bar e restaurante",
      "Deck para relaxamento",
    ],
    location: "Caldas Novas - GO",
    duration: "Dia inteiro",
    ageGroup: "Todas as idades",
  },
];

// Função para converter caminho relativo em URL completa
function convertImagePath(imagePath) {
  if (!imagePath) {
    return 'https://via.placeholder.com/800x600?text=Ingresso';
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const baseUrl = process.env.SITE_BASE_URL || 'http://localhost:3015';
  return `${baseUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
}

// Função para mapear ingresso do site público para formato da API
function mapTicketToAPI(ticket) {
  const contentId = ticket.id.replace(/-/g, '');
  const imageUrl = convertImagePath(ticket.image);
  
  return {
    page_type: 'tickets',
    content_id: contentId,
    title: ticket.name,
    description: ticket.description,
    images: [imageUrl],
    metadata: {
      price: ticket.price,
      originalPrice: ticket.originalPrice,
      discount: ticket.discount,
      discount_percentage: ticket.discount,
      location: ticket.location,
      duration: ticket.duration,
      ageGroup: ticket.ageGroup,
      features: ticket.features,
      popular: ticket.popular || false,
      category: 'parque_aquatico',
      rating: 4.5,
    },
    seo_data: {
      title: `${ticket.name} - Caldas Novas | Reservei Viagens`,
      description: `${ticket.description.substring(0, 150)}... Aproveite ${ticket.discount}% de desconto!`,
      keywords: [
        ticket.name.toLowerCase(),
        'ingresso',
        'caldas novas',
        'parque aquático',
        `${ticket.discount}% desconto`,
        ticket.location.toLowerCase(),
        'reservei viagens',
      ],
    },
    status: 'active',
    order_index: 0,
  };
}

// Função para sincronizar um ingresso
async function syncTicket(ticket) {
  try {
    const payload = mapTicketToAPI(ticket);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/website/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message.includes('já existe')) {
      console.log(`⚠️  Ingresso "${ticket.name}" já existe no CMS`);
      return null;
    }
    throw error;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando sincronização de ingressos...\n');
  console.log(`📡 API: ${API_BASE_URL}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const ticket of ticketsFromPublicSite) {
    try {
      console.log(`📦 Sincronizando: ${ticket.name}...`);
      const result = await syncTicket(ticket);
      
      if (result) {
        console.log(`✅ Criado com sucesso! ID: ${result.data.id}, Content ID: ${result.data.content_id}\n`);
        successCount++;
      } else {
        skipCount++;
      }
    } catch (error) {
      console.error(`❌ Erro ao sincronizar "${ticket.name}":`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Resumo da Sincronização:');
  console.log(`✅ Criados: ${successCount}`);
  console.log(`⚠️  Já existentes: ${skipCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`📦 Total processado: ${ticketsFromPublicSite.length}`);
}

// Executar
main().catch(console.error);

