/**
 * Script para sincronizar atrações da página pública para o CMS
 * Executa: node scripts/sync-atracoes.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';
const ADMIN_TOKEN = 'admin-token-123';

// Dados das atrações da página /atracoes
const attractionsFromPublicSite = [
  {
    id: "jardim-japones",
    name: "Jardim Japonês",
    description: "Um refúgio de paz e beleza oriental, ideal para contemplação, meditação e fotografias únicas em meio à natureza exuberante.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images.jfif-qEh8dMMyYkqDeGxaBMbhqplQXVSpEU.jpeg",
    location: "Centro de Caldas Novas",
    duration: "1-2 horas",
    category: "Natureza",
    highlights: ["Arquitetura japonesa", "Lagos ornamentais", "Pontes tradicionais", "Área de meditação"],
    rating: 4.8,
    price: 10,
  },
  {
    id: "lago-corumba",
    name: "Lago Corumbá",
    description: "Passeios de barco, jet ski e uma bela vista para relaxar e se divertir. Perfeito para esportes aquáticos e contemplação.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/97cea591709031183bf3c175de4d26c4.jpg-hDxD6ZNoJL0WRJF9sZC84493RoYy4A.jpeg",
    location: "Caldas Novas - GO",
    duration: "Meio dia",
    category: "Aventura",
    highlights: ["Passeios de barco", "Jet ski", "Pesca esportiva", "Vista panorâmica"],
    rating: 4.6,
    price: null, // Preço sob consulta
  },
  {
    id: "monumento-aguas",
    name: "Monumento das Águas",
    description: "Visite o cartão postal de Caldas Novas, símbolo das águas termais e marco histórico da cidade.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/monumento-as-aguas.jpg-23Ox7hDb2v9O7MvysJbMC402VHtIJ2.jpeg",
    location: "Centro Histórico",
    duration: "30 minutos",
    category: "Histórico",
    highlights: ["Marco histórico", "Fonte termal", "Área para fotos", "Centro da cidade"],
    rating: 4.4,
    free: true,
  },
  {
    id: "feira-hippie",
    name: "Feira do Luar",
    description: "Feira noturna com artesanato local, gastronomia típica e apresentações culturais. Experiência autêntica de Caldas Novas.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/unnamed.jpg-kMID5PSp6hxQkx36Qp540D7NUs1N9Y.jpeg",
    location: "Praça Central",
    duration: "2-3 horas",
    category: "Cultural",
    highlights: ["Artesanato local", "Gastronomia típica", "Música ao vivo", "Produtos regionais"],
    rating: 4.7,
    free: true,
  },
  {
    id: "parque-estadual",
    name: "Parque Estadual da Serra de Caldas",
    description: "Trilhas ecológicas, cachoeiras naturais e vista panorâmica da região. Ideal para ecoturismo e aventura.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Entrada-do-PESCAN-Parque-da-Serra-de-Caldas.jpg-1dCOLwSaVTKLgUQ35R0f6eVwQ20xhX.jpeg",
    location: "Serra de Caldas Novas",
    duration: "Dia inteiro",
    category: "Ecoturismo",
    highlights: ["Trilhas ecológicas", "Cachoeiras", "Vista panorâmica", "Flora e fauna"],
    rating: 4.9,
    price: null, // Preço sob consulta
  },
  {
    id: "centro-historico",
    name: "Centro Histórico",
    description: "Passeio pela história de Caldas Novas, com arquitetura colonial preservada e museus locais.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/O-que-fazer-em-Caldas-Novas-alem-dos-parques-.jpg-hggVCc4sV9K9nxiHfEglNOYL1NO3Mr.jpeg",
    location: "Centro de Caldas Novas",
    duration: "2-3 horas",
    category: "Histórico",
    highlights: ["Arquitetura colonial", "Museu local", "Igreja histórica", "Casarões antigos"],
    rating: 4.3,
    free: true,
  },
];

// Função para converter caminho relativo em URL completa
function convertImagePath(imagePath) {
  if (!imagePath) {
    return 'https://via.placeholder.com/800x600?text=Atracao';
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const baseUrl = process.env.SITE_BASE_URL || 'http://localhost:3015';
  return `${baseUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
}

// Função para mapear atração do site público para formato da API
function mapAttractionToAPI(attraction) {
  const contentId = attraction.id.replace(/-/g, '');
  const imageUrl = convertImagePath(attraction.image);
  
  // Determinar preço
  let price = 0;
  if (attraction.free) {
    price = 0;
  } else if (attraction.price !== null && attraction.price !== undefined) {
    price = attraction.price;
  } else {
    price = 0; // Preço sob consulta será tratado no metadata
  }
  
  return {
    page_type: 'attractions',
    content_id: contentId,
    title: attraction.name,
    description: attraction.description,
    images: [imageUrl],
    metadata: {
      price: price,
      type: attraction.category.toLowerCase(),
      features: attraction.highlights,
      location: attraction.location,
      hours: attraction.duration,
      rating: attraction.rating,
      free: attraction.free || false,
      priceOnRequest: attraction.price === null,
    },
    seo_data: {
      title: `${attraction.name} - Caldas Novas | Reservei Viagens`,
      description: `${attraction.description.substring(0, 150)}... Visite em Caldas Novas!`,
      keywords: [
        attraction.name.toLowerCase(),
        'atração',
        'caldas novas',
        attraction.category.toLowerCase(),
        attraction.location.toLowerCase(),
        'reservei viagens',
      ],
    },
    status: 'active',
    order_index: 0,
  };
}

// Função para sincronizar uma atração
async function syncAttraction(attraction) {
  try {
    const payload = mapAttractionToAPI(attraction);
    
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
      console.log(`⚠️  Atração "${attraction.name}" já existe no CMS`);
      return null;
    }
    throw error;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando sincronização de atrações...\n');
  console.log(`📡 API: ${API_BASE_URL}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const attraction of attractionsFromPublicSite) {
    try {
      console.log(`📦 Sincronizando: ${attraction.name}...`);
      const result = await syncAttraction(attraction);
      
      if (result) {
        console.log(`✅ Criada com sucesso! ID: ${result.data.id}, Content ID: ${result.data.content_id}\n`);
        successCount++;
      } else {
        skipCount++;
      }
    } catch (error) {
      console.error(`❌ Erro ao sincronizar "${attraction.name}":`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Resumo da Sincronização:');
  console.log(`✅ Criadas: ${successCount}`);
  console.log(`⚠️  Já existentes: ${skipCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`📦 Total processado: ${attractionsFromPublicSite.length}`);
}

// Executar
main().catch(console.error);

