// Templates específicos por região - Foco em Caldas Novas e outras regiões turísticas

import { Template } from './templates-data';
import { generateId } from './utils';

// Templates específicos para Caldas Novas - GO
export const caldasNovasTemplates: Template[] = [
  {
    id: 'caldas-novas-resort-termal',
    name: 'Resort Termal Caldas Novas',
    category: 'hotel',
    description: 'Pacote completo em resort com águas termais naturais de Caldas Novas, incluindo hospedagem, refeições e acesso às piscinas termais',
    icon: '🏨',
    color: 'bg-blue-100 text-blue-600',
    preview: '/templates/previews/caldas-novas-resort.jpg',
    isDefault: false,
    tags: ['caldas-novas', 'termal', 'resort', 'família', 'águas-quentes', 'goiás'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'hotel',
      title: 'Escapada Termal - Resort Caldas Novas',
      currency: 'BRL',
      hotelState: 'Goiás',
      hotelCity: 'Caldas Novas',
      hotelName: 'Resort Termal Caldas Novas',
      items: [
        {
          id: generateId(),
          name: 'Hospedagem Resort Termal',
          description: 'Apartamento família com vista para as piscinas termais',
          category: 'Hospedagem',
          quantity: 3,
          unitPrice: 320.00,
          totalPrice: 960.00,
          details: {
            checkIn: '',
            checkOut: '',
            roomType: 'Apartamento Família',
            guests: 4,
            accommodationType: 'Resort Termal'
          }
        },
        {
          id: generateId(),
          name: 'Acesso às Piscinas Termais',
          description: 'Acesso ilimitado às 7 piscinas com águas termais',
          category: 'Lazer',
          quantity: 4,
          unitPrice: 45.00,
          totalPrice: 180.00
        },
        {
          id: generateId(),
          name: 'Café da Manhã',
          description: 'Buffet completo com especialidades regionais',
          category: 'Alimentação',
          quantity: 3,
          unitPrice: 35.00,
          totalPrice: 105.00
        }
      ],
      highlights: [
        { id: generateId(), title: '7 piscinas com águas termais naturais (37°C)', description: '', checked: true },
        { id: generateId(), title: 'Toboáguas e área aquática infantil', description: '', checked: true },
        { id: generateId(), title: 'Propriedades terapêuticas das águas termais', description: '', checked: true },
        { id: generateId(), title: 'Localização privilegiada no centro de Caldas Novas', description: '', checked: true },
        { id: generateId(), title: 'Estacionamento gratuito', description: '', checked: true }
      ],
      benefits: [
        { id: generateId(), description: 'Acesso 24h às piscinas termais', checked: true },
        { id: generateId(), description: 'Wi-Fi gratuito em todo o resort', checked: true },
        { id: generateId(), description: 'Atividades de recreação aquática', checked: true },
        { id: generateId(), description: 'Toalhas de piscina incluídas', checked: true }
      ],
      importantNotes: [
        { id: generateId(), note: 'Águas termais com temperatura natural de 37°C', checked: true },
        { id: generateId(), note: 'Recomendado para todas as idades', checked: true },
        { id: generateId(), note: 'Check-in às 14h e check-out às 12h', checked: true },
        { id: generateId(), note: 'Valores sujeitos à disponibilidade', checked: true }
      ]
    }
  },
  {
    id: 'caldas-novas-parque-aquatico',
    name: 'Parque Aquático Caldas Novas',
    category: 'parque',
    description: 'Diversão garantida no maior complexo de parques aquáticos de águas termais do mundo',
    icon: '🎢',
    color: 'bg-purple-100 text-purple-600',
    preview: '/templates/previews/caldas-novas-parque.jpg',
    isDefault: false,
    tags: ['caldas-novas', 'parque-aquático', 'família', 'águas-termais', 'diversão'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'parque',
      title: 'Diversão Termal - Parques Aquáticos Caldas Novas',
      currency: 'BRL',
      parkState: 'Goiás',
      parkCity: 'Caldas Novas',
      parkName: 'Complexo Aquático Caldas Novas',
      parkType: 'aquatico',
      items: [
        {
          id: generateId(),
          name: 'Ingresso Adulto - Parque das Fontes',
          description: 'Acesso completo ao maior parque aquático termal',
          category: 'Ingresso',
          quantity: 2,
          unitPrice: 89.90,
          totalPrice: 179.80,
          details: {
            ageGroup: 'adulto',
            ticketType: 'Dia Inteiro',
            validityDays: 1
          }
        },
        {
          id: generateId(),
          name: 'Ingresso Criança - Parque das Fontes',
          description: 'Acesso completo com área infantil dedicada',
          category: 'Ingresso',
          quantity: 2,
          unitPrice: 69.90,
          totalPrice: 139.80,
          details: {
            ageGroup: 'crianca',
            ticketType: 'Dia Inteiro',
            validityDays: 1
          }
        },
        {
          id: generateId(),
          name: 'Combo Almoço Termal',
          description: 'Refeição no restaurante do parque',
          category: 'Alimentação',
          quantity: 4,
          unitPrice: 45.00,
          totalPrice: 180.00
        }
      ],
      highlights: [
        { id: generateId(), title: 'Mais de 20 piscinas com águas termais', description: '', checked: true },
        { id: generateId(), title: 'Toboáguas gigantes e radicais', description: '', checked: true },
        { id: generateId(), title: 'Rio lento com águas termais', description: '', checked: true },
        { id: generateId(), title: 'Área infantil Acqua Kids', description: '', checked: true },
        { id: generateId(), title: 'Shows aquáticos e entretenimento', description: '', checked: true }
      ],
      benefits: [
        { id: generateId(), description: 'Estacionamento gratuito', checked: true },
        { id: generateId(), description: 'Vestiários com armários', checked: true },
        { id: generateId(), description: 'Área de descanso com espreguiçadeiras', checked: true }
      ]
    }
  },
  {
    id: 'caldas-novas-city-tour',
    name: 'City Tour Caldas Novas',
    category: 'passeio',
    description: 'Conheça as principais atrações de Caldas Novas, incluindo fontes termais, lagoa quente e pontos turísticos',
    icon: '🚌',
    color: 'bg-orange-100 text-orange-600',
    preview: '/templates/previews/caldas-novas-tour.jpg',
    isDefault: false,
    tags: ['caldas-novas', 'city-tour', 'fontes-termais', 'cultura', 'história'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'passeio',
      title: 'City Tour Caldas Novas - Águas Termais',
      currency: 'BRL',
      tourState: 'Goiás',
      tourCity: 'Caldas Novas',
      tourName: 'City Tour Caldas Novas Completo',
      items: [
        {
          id: generateId(),
          name: 'City Tour Caldas Novas',
          description: 'Tour completo pelas principais atrações termais',
          category: 'Passeio',
          quantity: 4,
          unitPrice: 85.00,
          totalPrice: 340.00,
          details: {
            ageGroup: 'adulto',
            departureTime: '08:30',
            returnTime: '17:00',
            transportIncluded: true,
            guideIncluded: true
          }
        },
        {
          id: generateId(),
          name: 'Entrada Lagoa Quente',
          description: 'Banho na famosa lagoa de águas termais',
          category: 'Atração',
          quantity: 4,
          unitPrice: 25.00,
          totalPrice: 100.00
        }
      ],
      highlights: [
        { id: generateId(), title: 'Visita às fontes termais naturais', description: '', checked: true },
        { id: generateId(), title: 'Banho na Lagoa Quente (37°C)', description: '', checked: true },
        { id: generateId(), title: 'Feira do Luar (produtos regionais)', description: '', checked: true },
        { id: generateId(), title: 'Centro histórico de Caldas Novas', description: '', checked: true },
        { id: generateId(), title: 'Mirante da Serra de Caldas', description: '', checked: true }
      ],
      benefits: [
        { id: generateId(), description: 'Guia especializado em turismo termal', checked: true },
        { id: generateId(), description: 'Transporte com ar condicionado', checked: true },
        { id: generateId(), description: 'Água mineral durante o passeio', checked: true }
      ]
    }
  },
  {
    id: 'caldas-novas-spa-wellness',
    name: 'Spa & Wellness Caldas Novas',
    category: 'hotel',
    description: 'Experiência completa de relaxamento e bem-estar com tratamentos termais exclusivos',
    icon: '🧘',
    color: 'bg-green-100 text-green-600',
    preview: '/templates/previews/caldas-novas-spa.jpg',
    isDefault: false,
    tags: ['caldas-novas', 'spa', 'wellness', 'relaxamento', 'termal', 'saúde'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'hotel',
      title: 'Retiro Termal Wellness - Caldas Novas',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Hospedagem Spa Resort',
          description: 'Suíte com hidromassagem termal privativa',
          category: 'Hospedagem',
          quantity: 2,
          unitPrice: 450.00,
          totalPrice: 900.00,
          details: {
            roomType: 'Suíte Spa',
            guests: 2,
            accommodationType: 'Spa Resort'
          }
        },
        {
          id: generateId(),
          name: 'Pacote Spa Termal',
          description: 'Massagem relaxante + banho termal + aromaterapia',
          category: 'Spa',
          quantity: 2,
          unitPrice: 180.00,
          totalPrice: 360.00
        },
        {
          id: generateId(),
          name: 'Tratamento Facial Termal',
          description: 'Limpeza de pele com argila termal de Caldas Novas',
          category: 'Spa',
          quantity: 2,
          unitPrice: 120.00,
          totalPrice: 240.00
        }
      ],
      highlights: [
        { id: generateId(), title: 'Hidromassagem termal privativa na suíte', description: '', checked: true },
        { id: generateId(), title: 'Spa com águas termais medicinais', description: '', checked: true },
        { id: generateId(), title: 'Tratamentos exclusivos com argila termal', description: '', checked: true },
        { id: generateId(), title: 'Área de relaxamento com vista panorâmica', description: '', checked: true }
      ]
    }
  }
];

// Templates sazonais para Caldas Novas
export const seasonalTemplates: Template[] = [
  {
    id: 'caldas-novas-alta-temporada',
    name: 'Caldas Novas - Alta Temporada',
    category: 'hotel',
    description: 'Pacote especial para alta temporada com tarifas e serviços premium',
    icon: '☀️',
    color: 'bg-yellow-100 text-yellow-600',
    preview: '/templates/previews/caldas-novas-alta.jpg',
    isDefault: false,
    tags: ['caldas-novas', 'alta-temporada', 'verão', 'férias', 'premium'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'hotel',
      title: 'Caldas Novas - Pacote Alta Temporada',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Hospedagem Premium - Alta Temporada',
          description: 'Resort 5 estrelas com todas as comodidades',
          category: 'Hospedagem',
          quantity: 4,
          unitPrice: 420.00,
          totalPrice: 1680.00
        },
        {
          id: generateId(),
          name: 'All Inclusive Premium',
          description: 'Todas as refeições e bebidas incluídas',
          category: 'Alimentação',
          quantity: 4,
          unitPrice: 150.00,
          totalPrice: 600.00
        }
      ],
      highlights: [
        { id: generateId(), title: 'Tarifas especiais de alta temporada', description: '', checked: true },
        { id: generateId(), title: 'Programação especial de entretenimento', description: '', checked: true },
        { id: generateId(), title: 'Reserva garantida em período de alta demanda', description: '', checked: true }
      ]
    }
  },
  {
    id: 'caldas-novas-baixa-temporada',
    name: 'Caldas Novas - Baixa Temporada',
    category: 'hotel',
    description: 'Oportunidade única com preços especiais para baixa temporada',
    icon: '🍂',
    color: 'bg-amber-100 text-amber-600',
    preview: '/templates/previews/caldas-novas-baixa.jpg',
    isDefault: false,
    tags: ['caldas-novas', 'baixa-temporada', 'promoção', 'economia', 'desconto'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'hotel',
      title: 'Caldas Novas - Promoção Baixa Temporada',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Hospedagem Promocional',
          description: 'Mesmo conforto com preço especial',
          category: 'Hospedagem',
          quantity: 3,
          unitPrice: 180.00,
          totalPrice: 540.00
        }
      ],
      highlights: [
        { id: generateId(), title: 'Desconto de até 40% nas tarifas', description: '', checked: true },
        { id: generateId(), title: 'Menor movimento - mais tranquilidade', description: '', checked: true },
        { id: generateId(), title: 'Mesmo padrão de qualidade', description: '', checked: true }
      ]
    }
  }
];

// Templates de outras regiões turísticas
export const otherRegionalTemplates: Template[] = [
  {
    id: 'bonito-ecoturismo',
    name: 'Ecoturismo Bonito - MS',
    category: 'passeio',
    description: 'Aventura completa em Bonito com flutuação, grutas e cachoeiras',
    icon: '🐠',
    color: 'bg-cyan-100 text-cyan-600',
    preview: '/templates/previews/bonito-eco.jpg',
    isDefault: false,
    tags: ['bonito', 'ecoturismo', 'flutuação', 'natureza', 'mato-grosso-sul'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'passeio',
      title: 'Ecoturismo Bonito - Águas Cristalinas',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Flutuação Rio da Prata',
          description: 'Flutuação em águas cristalinas com peixes coloridos',
          category: 'Ecoturismo',
          quantity: 2,
          unitPrice: 180.00,
          totalPrice: 360.00
        },
        {
          id: generateId(),
          name: 'Gruta do Lago Azul',
          description: 'Visita à famosa gruta com lago azul',
          category: 'Atração',
          quantity: 2,
          unitPrice: 45.00,
          totalPrice: 90.00
        }
      ]
    }
  },
  {
    id: 'gramado-serra-gaucha',
    name: 'Gramado - Serra Gaúcha',
    category: 'hotel',
    description: 'Charme europeu na Serra Gaúcha com hospedagem e atrações',
    icon: '🏔️',
    color: 'bg-indigo-100 text-indigo-600',
    preview: '/templates/previews/gramado-serra.jpg',
    isDefault: false,
    tags: ['gramado', 'serra-gaúcha', 'europeu', 'romântico', 'rio-grande-sul'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'hotel',
      title: 'Gramado Romântico - Serra Gaúcha',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Hospedagem Pousada Europeia',
          description: 'Charme europeu no coração de Gramado',
          category: 'Hospedagem',
          quantity: 3,
          unitPrice: 280.00,
          totalPrice: 840.00
        }
      ]
    }
  },
  {
    id: 'fernando-noronha-mergulho',
    name: 'Fernando de Noronha - Mergulho',
    category: 'passeio',
    description: 'Paraíso do mergulho com vida marinha exuberante',
    icon: '🐢',
    color: 'bg-teal-100 text-teal-600',
    preview: '/templates/previews/noronha-mergulho.jpg',
    isDefault: false,
    tags: ['fernando-noronha', 'mergulho', 'vida-marinha', 'paraíso', 'pernambuco'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budget: {
      type: 'passeio',
      title: 'Fernando de Noronha - Mergulho Paradisíaco',
      currency: 'BRL',
      items: [
        {
          id: generateId(),
          name: 'Mergulho Batismo',
          description: 'Primeira experiência de mergulho com instrutor',
          category: 'Mergulho',
          quantity: 2,
          unitPrice: 350.00,
          totalPrice: 700.00
        }
      ]
    }
  }
];

// Função para obter templates por região
export function getTemplatesByRegion(region: string): Template[] {
  const regionMap: { [key: string]: Template[] } = {
    'caldas-novas': caldasNovasTemplates,
    'seasonal': seasonalTemplates,
    'other-regions': otherRegionalTemplates,
    'all-regional': [...caldasNovasTemplates, ...seasonalTemplates, ...otherRegionalTemplates]
  };
  
  return regionMap[region] || [];
}

// Função para obter templates sazonais
export function getSeasonalTemplates(season: 'alta' | 'baixa' | 'all'): Template[] {
  if (season === 'all') return seasonalTemplates;
  
  return seasonalTemplates.filter(template => 
    season === 'alta' 
      ? template.tags.includes('alta-temporada')
      : template.tags.includes('baixa-temporada')
  );
}

// Função para obter templates por estado
export function getTemplatesByState(state: string): Template[] {
  const allRegionalTemplates = [...caldasNovasTemplates, ...seasonalTemplates, ...otherRegionalTemplates];
  
  const stateMap: { [key: string]: string[] } = {
    'goias': ['caldas-novas'],
    'mato-grosso-sul': ['bonito'],
    'rio-grande-sul': ['gramado'],
    'pernambuco': ['fernando-noronha']
  };
  
  const regionTags = stateMap[state.toLowerCase()] || [];
  
  return allRegionalTemplates.filter(template =>
    template.tags.some(tag => regionTags.includes(tag))
  );
}

export default {
  caldasNovasTemplates,
  seasonalTemplates,
  otherRegionalTemplates,
  getTemplatesByRegion,
  getSeasonalTemplates,
  getTemplatesByState
};
