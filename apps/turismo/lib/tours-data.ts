// Dados dos principais passeios e tours do Brasil

export interface Tour {
  id: string
  name: string
  city: string
  state: string
  type: 'city_tour' | 'eco_tour' | 'cultural_tour' | 'gastronomic_tour' | 'adventure_tour' | 'historical_tour' | 'beach_tour' | 'night_tour'
  description?: string
  website?: string
  duration: string // Duração do passeio
  difficulty: 'facil' | 'moderado' | 'dificil'
  minParticipants: number
  maxParticipants: number
  hasGroupDiscount: boolean
  transportIncluded: boolean
  guideIncluded: boolean
  mealIncluded: boolean
  operatingDays: string[]
  departureTime: string
  returnTime?: string
  meetingPoint: string
  ticketTypes: TourTicketType[]
  includes: string[]
  excludes: string[]
  recommendations: string[]
  restrictions?: string[]
  cancellationPolicy?: string
  weatherDependent?: boolean
}

export interface TourTicketType {
  id: string
  name: string
  description: string
  ageGroup: 'adulto' | 'crianca' | 'idoso' | 'estudante' | 'familia'
  basePrice: number
  includes?: string[]
  restrictions?: string[]
}

export interface City {
  name: string
  state: string
  tours: Tour[]
}

export interface State {
  name: string
  code: string
  cities: City[]
}

// Tours do Rio de Janeiro
export const rioDeJaneiroTours: Tour[] = [
  {
    id: "city-tour-rio-completo",
    name: "City Tour Rio Completo",
    city: "Rio de Janeiro",
    state: "Rio de Janeiro",
    type: "city_tour",
    description: "Tour completo pelos principais pontos turísticos do Rio de Janeiro",
    duration: "8 horas",
    difficulty: "facil",
    minParticipants: 2,
    maxParticipants: 44,
    hasGroupDiscount: true,
    transportIncluded: true,
    guideIncluded: true,
    mealIncluded: false,
    operatingDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
    departureTime: "08:00",
    returnTime: "16:00",
    meetingPoint: "Hotel ou endereço em Copacabana/Ipanema",
    weatherDependent: false,
    includes: [
      "Transporte em veículo com ar condicionado",
      "Guia turístico credenciado",
      "Visita ao Cristo Redentor",
      "Visita ao Pão de Açúcar",
      "Passagem pela Catedral Metropolitana",
      "Vista do Estádio do Maracanã",
      "Passagem pelo Sambódromo"
    ],
    excludes: [
      "Ingressos para atrações",
      "Refeições",
      "Bebidas",
      "Despesas pessoais"
    ],
    recommendations: [
      "Usar roupas confortáveis",
      "Levar protetor solar",
      "Levar água",
      "Câmera fotográfica"
    ],
    restrictions: [
      "Não recomendado para pessoas com mobilidade reduzida",
      "Sujeito a condições climáticas"
    ],
    cancellationPolicy: "Cancelamento gratuito até 24h antes",
    ticketTypes: [
      {
        id: "adulto",
        name: "Adulto",
        description: "Acima de 12 anos",
        ageGroup: "adulto",
        basePrice: 180.00,
        includes: ["Todos os itens do tour"]
      },
      {
        id: "crianca",
        name: "Criança",
        description: "6 a 11 anos",
        ageGroup: "crianca",
        basePrice: 90.00,
        includes: ["Todos os itens do tour"]
      },
      {
        id: "idoso",
        name: "Idoso",
        description: "Acima de 60 anos",
        ageGroup: "idoso",
        basePrice: 144.00,
        includes: ["Todos os itens do tour"]
      }
    ]
  },
  {
    id: "tour-gastronomico-santa-teresa",
    name: "Tour Gastronômico Santa Teresa",
    city: "Rio de Janeiro",
    state: "Rio de Janeiro",
    type: "gastronomic_tour",
    description: "Descobra os sabores únicos do charmoso bairro de Santa Teresa",
    duration: "4 horas",
    difficulty: "facil",
    minParticipants: 4,
    maxParticipants: 12,
    hasGroupDiscount: true,
    transportIncluded: false,
    guideIncluded: true,
    mealIncluded: true,
    operatingDays: ["Quinta", "Sexta", "Sábado"],
    departureTime: "14:00",
    returnTime: "18:00",
    meetingPoint: "Largo do Guimarães, Santa Teresa",
    weatherDependent: false,
    includes: [
      "Guia gastronômico especializado",
      "Degustações em 5 estabelecimentos",
      "Bebidas incluídas",
      "História e cultura local",
      "Mapa do bairro"
    ],
    excludes: [
      "Transporte até o ponto de encontro",
      "Refeição completa",
      "Compras pessoais"
    ],
    recommendations: [
      "Vir com fome moderada",
      "Informar restrições alimentares",
      "Usar calçados confortáveis"
    ],
    restrictions: [
      "Não recomendado para vegetarianos estritos",
      "Informar alergias alimentares"
    ],
    cancellationPolicy: "Cancelamento gratuito até 48h antes",
    ticketTypes: [
      {
        id: "adulto",
        name: "Adulto",
        description: "Acima de 18 anos",
        ageGroup: "adulto",
        basePrice: 220.00,
        includes: ["Todas as degustações", "Bebidas", "Guia especializado"]
      }
    ]
  },
  {
    id: "trilha-pedra-bonita",
    name: "Trilha Pedra Bonita",
    city: "Rio de Janeiro",
    state: "Rio de Janeiro",
    type: "adventure_tour",
    description: "Trilha com vista panorâmica da cidade e praia",
    duration: "5 horas",
    difficulty: "moderado",
    minParticipants: 2,
    maxParticipants: 8,
    hasGroupDiscount: true,
    transportIncluded: true,
    guideIncluded: true,
    mealIncluded: false,
    operatingDays: ["Sábado", "Domingo"],
    departureTime: "07:00",
    returnTime: "12:00",
    meetingPoint: "Hotel ou ponto combinado",
    weatherDependent: true,
    includes: [
      "Transporte ida e volta",
      "Guia de montanha certificado",
      "Equipamentos de segurança",
      "Seguro de acidentes pessoais",
      "Água durante a trilha"
    ],
    excludes: [
      "Refeições",
      "Equipamentos pessoais",
      "Fotos profissionais"
    ],
    recommendations: [
      "Bom condicionamento físico",
      "Roupas esportivas",
      "Tênis de trilha",
      "Protetor solar",
      "Lanche energético"
    ],
    restrictions: [
      "Mínimo 16 anos",
      "Não recomendado para gestantes",
      "Problemas cardíacos ou respiratórios"
    ],
    cancellationPolicy: "Cancelamento por condições climáticas sem custo",
    ticketTypes: [
      {
        id: "adulto",
        name: "Adulto",
        description: "16 anos ou mais",
        ageGroup: "adulto",
        basePrice: 150.00,
        includes: ["Todos os equipamentos", "Seguro", "Guia certificado"]
      }
    ]
  }
]

// Tours de São Paulo
export const saoPauloTours: Tour[] = [
  {
    id: "city-tour-sp-historico",
    name: "City Tour São Paulo Histórico",
    city: "São Paulo",
    state: "São Paulo",
    type: "historical_tour",
    description: "Conheça a história de São Paulo através de seus marcos históricos",
    duration: "6 horas",
    difficulty: "facil",
    minParticipants: 2,
    maxParticipants: 40,
    hasGroupDiscount: true,
    transportIncluded: true,
    guideIncluded: true,
    mealIncluded: false,
    operatingDays: ["Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
    departureTime: "09:00",
    returnTime: "15:00",
    meetingPoint: "Praça da Sé ou hotel",
    weatherDependent: false,
    includes: [
      "Transporte em ônibus executivo",
      "Guia turístico especializado",
      "Visita ao Centro Histórico",
      "Teatro Municipal",
      "Edifício Copan",
      "Mercado Municipal",
      "Bairro da Liberdade"
    ],
    excludes: [
      "Ingressos para museus",
      "Refeições",
      "Compras no Mercado Municipal"
    ],
    recommendations: [
      "Roupas confortáveis",
      "Calçados para caminhada",
      "Câmera fotográfica"
    ],
    ticketTypes: [
      {
        id: "adulto",
        name: "Adulto",
        description: "Acima de 12 anos",
        ageGroup: "adulto",
        basePrice: 120.00
      },
      {
        id: "crianca",
        name: "Criança",
        description: "6 a 11 anos",
        ageGroup: "crianca",
        basePrice: 60.00
      },
      {
        id: "idoso",
        name: "Idoso",
        description: "Acima de 60 anos",
        ageGroup: "idoso",
        basePrice: 96.00
      }
    ]
  },
  {
    id: "tour-gastronomico-vila-madalena",
    name: "Tour Gastronômico Vila Madalena",
    city: "São Paulo",
    state: "São Paulo",
    type: "gastronomic_tour",
    description: "Explore a cena gastronômica da Vila Madalena",
    duration: "4 horas",
    difficulty: "facil",
    minParticipants: 6,
    maxParticipants: 15,
    hasGroupDiscount: true,
    transportIncluded: false,
    guideIncluded: true,
    mealIncluded: true,
    operatingDays: ["Sexta", "Sábado"],
    departureTime: "19:00",
    returnTime: "23:00",
    meetingPoint: "Estação Vila Madalena do Metrô",
    weatherDependent: false,
    includes: [
      "Guia gastronômico local",
      "Degustações em 6 estabelecimentos",
      "Bebidas incluídas",
      "História dos bares e restaurantes"
    ],
    excludes: [
      "Transporte",
      "Refeição completa",
      "Bebidas extras"
    ],
    recommendations: [
      "Vir com apetite",
      "Informar restrições alimentares"
    ],
    ticketTypes: [
      {
        id: "adulto",
        name: "Adulto",
        description: "Acima de 18 anos",
        ageGroup: "adulto",
        basePrice: 180.00
      }
    ]
  }
]

// Tours de Salvador
export const salvadorTours: Tour[] = [
  {
    id: "tour-pelourinho-cultural",
    name: "Tour Cultural Pelourinho",
    city: "Salvador",
    state: "Bahia",
    type: "cultural_tour",
    description: "Mergulhe na rica cultura afro-brasileira do Pelourinho",
    duration: "3 horas",
    difficulty: "facil",
    minParticipants: 2,
    maxParticipants: 20,
    hasGroupDiscount: true,
    transportIncluded: false,
    guideIncluded: true,
    mealIncluded: false,
    operatingDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
    departureTime: "14:00",
    returnTime: "17:00",
    meetingPoint: "Terreiro de Jesus, Pelourinho",
    weatherDependent: false,
    includes: [
      "Guia cultural especializado",
      "Visita às igrejas históricas",
      "Casa de Jorge Amado",
      "Museu da Cidade",
      "Apresentação de capoeira",
      "Degustação de acarajé"
    ],
    excludes: [
      "Transporte até o Pelourinho",
      "Ingressos para museus",
      "Compras de artesanato"
    ],
    recommendations: [
      "Roupas leves e confortáveis",
      "Protetor solar",
      "Câmera fotográfica"
    ],
    ticketTypes: [
      {
        id: "adulto",
        name: "Adulto",
        description: "Acima de 12 anos",
        ageGroup: "adulto",
        basePrice: 80.00
      },
      {
        id: "crianca",
        name: "Criança",
        description: "6 a 11 anos",
        ageGroup: "crianca",
        basePrice: 40.00
      },
      {
        id: "estudante",
        name: "Estudante",
        description: "Com carteirinha",
        ageGroup: "estudante",
        basePrice: 64.00
      }
    ]
  }
]

// Tours de Foz do Iguaçu
export const fozDoIguacuTours: Tour[] = [
  {
    id: "cataratas-lado-brasileiro",
    name: "Cataratas do Iguaçu - Lado Brasileiro",
    city: "Foz do Iguaçu",
    state: "Paraná",
    type: "eco_tour",
    description: "Vista panorâmica das Cataratas do Iguaçu pelo lado brasileiro",
    duration: "4 horas",
    difficulty: "facil",
    minParticipants: 1,
    maxParticipants: 50,
    hasGroupDiscount: true,
    transportIncluded: true,
    guideIncluded: true,
    mealIncluded: false,
    operatingDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
    departureTime: "08:00",
    returnTime: "12:00",
    meetingPoint: "Hotel ou pousada",
    weatherDependent: false,
    includes: [
      "Transporte ida e volta",
      "Guia turístico bilíngue",
      "Ingresso do Parque Nacional",
      "Trilha ecológica",
      "Vista da Garganta do Diabo"
    ],
    excludes: [
      "Refeições",
      "Passeio de helicóptero",
      "Macuco Safari"
    ],
    recommendations: [
      "Roupas confortáveis",
      "Calçados antiderrapantes",
      "Capa de chuva",
      "Câmera à prova d'água"
    ],
    ticketTypes: [
      {
        id: "adulto",
        name: "Adulto",
        description: "Acima de 12 anos",
        ageGroup: "adulto",
        basePrice: 160.00
      },
      {
        id: "crianca",
        name: "Criança",
        description: "6 a 11 anos",
        ageGroup: "crianca",
        basePrice: 80.00
      }
    ]
  }
]

// Estados do Brasil com tours
export const brazilStatesWithTours: State[] = [
  {
    name: "Rio de Janeiro",
    code: "RJ",
    cities: [
      {
        name: "Rio de Janeiro",
        state: "Rio de Janeiro",
        tours: rioDeJaneiroTours
      }
    ]
  },
  {
    name: "São Paulo",
    code: "SP",
    cities: [
      {
        name: "São Paulo",
        state: "São Paulo",
        tours: saoPauloTours
      }
    ]
  },
  {
    name: "Bahia",
    code: "BA",
    cities: [
      {
        name: "Salvador",
        state: "Bahia",
        tours: salvadorTours
      }
    ]
  },
  {
    name: "Paraná",
    code: "PR",
    cities: [
      {
        name: "Foz do Iguaçu",
        state: "Paraná",
        tours: fozDoIguacuTours
      }
    ]
  }
]

// Funções utilitárias
export function getAllTours(): Tour[] {
  return brazilStatesWithTours.flatMap(state => 
    state.cities.flatMap(city => city.tours)
  )
}

export function getToursByCity(cityName: string): Tour[] {
  for (const state of brazilStatesWithTours) {
    const city = state.cities.find(c => c.name === cityName)
    if (city) return city.tours
  }
  return []
}

export function getToursByState(stateName: string): Tour[] {
  const state = brazilStatesWithTours.find(s => s.name === stateName)
  return state ? state.cities.flatMap(city => city.tours) : []
}

export function getToursByType(type: Tour['type']): Tour[] {
  return getAllTours().filter(tour => tour.type === type)
}

export function searchTours(query: string): Tour[] {
  const lowerCaseQuery = query.toLowerCase()
  return getAllTours().filter(tour =>
    tour.name.toLowerCase().includes(lowerCaseQuery) ||
    tour.city.toLowerCase().includes(lowerCaseQuery) ||
    tour.state.toLowerCase().includes(lowerCaseQuery) ||
    tour.description?.toLowerCase().includes(lowerCaseQuery) ||
    tour.includes.some(item => item.toLowerCase().includes(lowerCaseQuery))
  )
}

export function getTourById(id: string): Tour | undefined {
  return getAllTours().find(tour => tour.id === id)
}

// Tipos de tours para filtros
export const tourTypes = [
  { value: 'city_tour', label: '🏙️ City Tour', description: 'Tours pela cidade e pontos turísticos' },
  { value: 'eco_tour', label: '🌿 Eco Tour', description: 'Tours ecológicos e natureza' },
  { value: 'cultural_tour', label: '🎭 Tour Cultural', description: 'Cultura, arte e tradições locais' },
  { value: 'gastronomic_tour', label: '🍽️ Tour Gastronômico', description: 'Experiências culinárias locais' },
  { value: 'adventure_tour', label: '🏔️ Tour de Aventura', description: 'Trilhas, esportes e aventura' },
  { value: 'historical_tour', label: '🏛️ Tour Histórico', description: 'História e patrimônio cultural' },
  { value: 'beach_tour', label: '🏖️ Tour de Praia', description: 'Praias e atividades aquáticas' },
  { value: 'night_tour', label: '🌙 Tour Noturno', description: 'Vida noturna e entretenimento' }
] as const