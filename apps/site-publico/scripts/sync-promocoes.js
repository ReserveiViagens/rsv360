/**
 * Script para sincronizar promoções da página pública para o CMS
 * Executa: node scripts/sync-promocoes.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';
const ADMIN_TOKEN = 'admin-token-123';

// Dados das promoções da página /promocoes
const promotionsFromPublicSite = [
  {
    id: "promoferias-20off",
    title: "PROMOFÉRIAS Hotel + Parque Aquático",
    description: "Sinta a magia de Caldas Novas! Pacote completo com hotel 4 estrelas + acesso a parque aquático com estacionamento gratuito incluso.",
    price: 149,
    originalPrice: 186,
    image: "/images/promoferias-parque-aquatico.jpeg",
    discount: 20,
    badge: "PROMOFÉRIAS",
    validUntil: "31/01/2025",
    includes: ["Hotel 4 estrelas", "Parque aquático", "Estacionamento Gratuito", "Wi-Fi grátis"],
    highlight: true,
  },
  {
    id: "ilhas-lago-package",
    title: "Ilhas do Lago Resort + Parque Aquático",
    description: "Hospedagem sofisticada no Ilhas do Lago com acesso a parque aquático e spa relaxante.",
    price: 320,
    originalPrice: 380,
    image: "/images/ilhas-do-lago-resort.jpg",
    discount: 15,
    badge: "Mais Vendido",
    validUntil: "15/02/2025",
    includes: ["Resort 5 estrelas", "Spa incluso", "Parque aquático", "Área de relaxamento"],
  },
  {
    id: "melhor-idade",
    title: "Pacote Melhor Idade Caldas Novas",
    description: "Condições especiais para grupos da melhor idade com atividades adaptadas e acompanhamento especializado.",
    price: 210,
    originalPrice: 260,
    image: "/images/melhor-idade-caldas-novas.jpeg",
    discount: 20,
    badge: "Melhor Idade",
    validUntil: "28/02/2025",
    includes: [
      "Momentos de lazer e convivência",
      "Atividades recreativas adaptadas",
      "Tratamento em Piscinas termais",
      "Hospedagem em hotel com estrutura adaptada",
    ],
  },
  {
    id: "fim-semana-dourado",
    title: "Pacote Fim de Semana Dourado",
    description: "Hotel + Parque com condições imperdíveis para sua escapada de fim de semana perfeita!",
    price: 299,
    originalPrice: 370,
    image: "/images/fim-de-semana-dourado.jpeg",
    discount: 20,
    badge: "Fim de Semana",
    validUntil: "Ver disponibilidade grátis",
    includes: ["Diárias a partir", "Parque aquático", "Atividades grátis oferecidas pelo hotel", "Late check-out"],
  },
  {
    id: "familia-completa",
    title: "Pacote Família Completa",
    description: "Diversão garantida para toda família com crianças até 12 anos grátis e atividades especiais.",
    price: 450,
    originalPrice: 580,
    image: "/images/pacote-familia-completa.jpeg",
    discount: 22,
    badge: "Família",
    validUntil: "31/03/2025",
    includes: ["Entrada no parque aquático", "Kids club", "Atividades familiares", "Quarto família"],
  },
];

// Função para converter data DD/MM/YYYY para YYYY-MM-DD
function convertDate(dateStr) {
  if (!dateStr || dateStr.includes('Ver disponibilidade')) {
    return null;
  }
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

// Função para converter caminho relativo em URL completa
function convertImagePath(imagePath) {
  if (!imagePath) {
    return 'https://via.placeholder.com/800x600?text=Promocao';
  }
  
  // Se já é uma URL completa, retornar como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Se é um caminho relativo, converter para URL completa
  // Assumindo que o site está em localhost:3015
  const baseUrl = process.env.SITE_BASE_URL || 'http://localhost:3015';
  return `${baseUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
}

// Função para mapear promoção do site público para formato da API
function mapPromotionToAPI(promo) {
  const contentId = promo.id.replace(/-/g, '');
  const validUntil = convertDate(promo.validUntil);
  const imageUrl = convertImagePath(promo.image);
  
  return {
    page_type: 'promotions',
    content_id: contentId,
    title: promo.title,
    description: promo.description,
    images: [imageUrl],
    metadata: {
      price: promo.price,
      originalPrice: promo.originalPrice,
      discount: promo.discount,
      discount_percentage: promo.discount,
      badge: promo.badge,
      validUntil: validUntil,
      includes: promo.includes,
      featured: promo.highlight || false,
      benefits: promo.includes || [],
    },
    seo_data: {
      title: `${promo.title} - Caldas Novas | Reservei Viagens`,
      description: `${promo.description.substring(0, 150)}... Aproveite ${promo.discount}% de desconto!`,
      keywords: [
        promo.badge?.toLowerCase() || 'promoção',
        'caldas novas',
        'hotel',
        'parque aquático',
        `${promo.discount}% desconto`,
        'reservei viagens',
      ],
    },
    status: 'active',
    order_index: 0,
  };
}

// Função para sincronizar uma promoção
async function syncPromotion(promo) {
  try {
    const payload = mapPromotionToAPI(promo);
    
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
      console.log(`⚠️  Promoção "${promo.title}" já existe no CMS`);
      return null;
    }
    throw error;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando sincronização de promoções...\n');
  console.log(`📡 API: ${API_BASE_URL}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const promo of promotionsFromPublicSite) {
    try {
      console.log(`📦 Sincronizando: ${promo.title}...`);
      const result = await syncPromotion(promo);
      
      if (result) {
        console.log(`✅ Criada com sucesso! ID: ${result.data.id}, Content ID: ${result.data.content_id}\n`);
        successCount++;
      } else {
        skipCount++;
      }
    } catch (error) {
      console.error(`❌ Erro ao sincronizar "${promo.title}":`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Resumo da Sincronização:');
  console.log(`✅ Criadas: ${successCount}`);
  console.log(`⚠️  Já existentes: ${skipCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`📦 Total processado: ${promotionsFromPublicSite.length}`);
}

// Executar
main().catch(console.error);

