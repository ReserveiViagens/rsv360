// Templates de Passeios em Caldas Novas conforme documentação (linha 722-728)
// 6 templates de passeios turísticos conforme documento

import { BudgetTemplate, BudgetItem, Photo, Highlight, Benefit, ImportantNote, DayItinerary, ContactInfo } from './types/budget';
import { generateId } from './utils';

/**
 * Função helper para criar template de passeio conforme documento
 */
export function createTourTemplate(config: {
  tourName: string;
  tourId: string;
  tourType: 'city_tour' | 'eco_tour' | 'cultural_tour' | 'gastronomic_tour' | 'adventure_tour' | 'historical_tour' | 'beach_tour' | 'night_tour';
  basePrice: number;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  transportIncluded?: boolean;
  guideIncluded?: boolean;
  mealIncluded?: boolean;
  difficulty?: 'facil' | 'moderado' | 'dificil';
  minParticipants?: number;
  maxParticipants?: number;
  includes?: string[];
  excludes?: string[];
}): BudgetTemplate {
  const { 
    tourName, 
    tourId, 
    tourType, 
    basePrice, 
    description, 
    thumbnailUrl,
    duration = '4 horas',
    transportIncluded = true,
    guideIncluded = true,
    mealIncluded = false,
    difficulty = 'facil',
    minParticipants = 2,
    maxParticipants = 20,
    includes = [],
    excludes = []
  } = config;
  
  return {
    id: `passeio-${tourId}-${tourType}`,
    name: `${tourName}`,
    mainCategory: "Passeios",
    subCategory: "Caldas Novas",
    description: description || `Passeio ${tourType.replace('_', ' ')} em Caldas Novas`,
    thumbnailUrl: thumbnailUrl || "/placeholder.svg?height=400&width=600",
    
    // Informações do Passeio/Local
    hotelState: "Goiás", // Mantido para compatibilidade
    hotelCity: "Caldas Novas", // Mantido para compatibilidade
    hotelId: tourId, // Mantido para compatibilidade
    hotelName: tourName, // Mantido para compatibilidade
    
    // Conteúdo do Template
    title: `Passeio ${tourName}`,
    templateDescription: `Experiência única de ${tourType.replace('_', ' ')} com duração de ${duration}`,
    photos: [] as Photo[],
    highlights: [
      {
        id: generateId(),
        title: `Passeio ${tourType.replace('_', ' ')}`,
        description: description || `Descubra Caldas Novas através deste ${tourType.replace('_', ' ')}`,
        checked: true
      }
    ] as Highlight[],
    hotelDescription: `${tourName} - ${description || `Passeio ${tourType.replace('_', ' ')} completo`}`,
    hotelLink: `https://example.com/passeios/${tourId}`,
    detailedItinerary: [] as DayItinerary[],
    benefits: [
      ...(transportIncluded ? [{
        id: generateId(),
        description: 'Transporte incluído',
        checked: true
      }] : []),
      ...(guideIncluded ? [{
        id: generateId(),
        description: 'Guia turístico incluído',
        checked: true
      }] : []),
      ...(mealIncluded ? [{
        id: generateId(),
        description: 'Refeição incluída',
        checked: true
      }] : []),
      ...includes.map(item => ({
        id: generateId(),
        description: item,
        checked: true
      }))
    ] as Benefit[],
    accommodationDetails: [] as AccommodationDetail[],
    importantNotes: [
      {
        id: generateId(),
        note: `Duração: ${duration}`,
        checked: true
      },
      {
        id: generateId(),
        note: `Dificuldade: ${difficulty}`,
        checked: true
      },
      {
        id: generateId(),
        note: `Mínimo de ${minParticipants} participantes`,
        checked: true
      },
      ...excludes.map(exclude => ({
        id: generateId(),
        note: `Não inclui: ${exclude}`,
        checked: true
      }))
    ] as ImportantNote[],
    investmentDetails: `Investimento de R$ ${basePrice.toFixed(2)} por pessoa`,
    contacts: {
      phone: '(64) 3451-0000',
      whatsapp: '(64) 99999-9999',
      email: 'contato@reserveiviagens.com',
      website: 'https://www.reserveiviagens.com'
    } as ContactInfo,
    
    // Itens e Preços
    items: [
      {
        id: generateId(),
        name: `Passeio ${tourName}`,
        description: `Passeio ${tourType.replace('_', ' ')} completo`,
        category: 'Passeios',
        quantity: 1,
        unitPrice: basePrice,
        totalPrice: basePrice,
        details: {
          departureTime: '08:00',
          returnTime: '12:00',
          transportIncluded: transportIncluded,
          guideIncluded: guideIncluded,
          mealIncluded: mealIncluded,
          weatherDependent: tourType === 'eco_tour' || tourType === 'adventure_tour',
          minParticipants: minParticipants,
          maxParticipants: maxParticipants,
          includes: includes,
          excludes: excludes,
          pickupLocation: 'Hotel em Caldas Novas',
          language: 'Português',
        }
      }
    ] as BudgetItem[],
    discount: 0,
    discountType: "percentage",
    tax: 0,
    taxType: "percentage",
    notes: `Grupo mínimo de ${minParticipants} pessoas. Sujeito a condições climáticas.`,
    
    // Metadados
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Lista de passeios conforme documento:
 * 6 templates de passeios turísticos
 */

// Passeios de Caldas Novas
const caldasNovasTours = [
  {
    id: 'tour-termas-completo',
    name: 'Tour Termas Completo',
    tourType: 'city_tour' as const,
    basePrice: 120,
    description: 'Passeio completo pelas principais termas e atrações de Caldas Novas',
    duration: '8 horas',
    includes: [
      'Transporte com ar condicionado',
      'Guia turístico credenciado',
      'Visita a 3 parques aquáticos',
      'Almoço em restaurante local',
    ],
    excludes: [
      'Ingressos para parques',
      'Bebidas',
      'Despesas pessoais',
    ],
  },
  {
    id: 'eco-tour-serra-caldas',
    name: 'Eco Tour Serra de Caldas',
    tourType: 'eco_tour' as const,
    basePrice: 150,
    description: 'Trilhas ecológicas na Serra de Caldas com guia especializado',
    duration: '6 horas',
    difficulty: 'moderado' as const,
    includes: [
      'Guia ambiental',
      'Equipamentos de segurança',
      'Lanche durante a trilha',
      'Seguro de acidentes pessoais',
    ],
    excludes: [
      'Almoço',
      'Equipamentos pessoais',
    ],
  },
  {
    id: 'tour-cultural-caldas',
    name: 'Tour Cultural Caldas Novas',
    tourType: 'cultural_tour' as const,
    basePrice: 80,
    description: 'Conheça a história e cultura de Caldas Novas',
    duration: '4 horas',
    includes: [
      'Transporte',
      'Guia turístico',
      'Visita ao Museu Histórico',
      'Visita ao Centro Histórico',
    ],
    excludes: [
      'Ingressos',
      'Refeições',
    ],
  },
  {
    id: 'tour-gastronomico',
    name: 'Tour Gastronômico',
    tourType: 'gastronomic_tour' as const,
    basePrice: 200,
    description: 'Degustação da culinária regional goiana',
    duration: '5 horas',
    mealIncluded: true,
    includes: [
      'Transporte',
      'Guia gastronômico',
      '3 paradas para degustação',
      'Jantar incluso',
    ],
    excludes: [
      'Bebidas alcoólicas',
    ],
  },
  {
    id: 'adventure-tour',
    name: 'Tour Aventura',
    tourType: 'adventure_tour' as const,
    basePrice: 180,
    description: 'Aventuras radicais na região de Caldas Novas',
    duration: '6 horas',
    difficulty: 'dificil' as const,
    includes: [
      'Equipamentos de segurança',
      'Instrutor especializado',
      'Seguro de acidentes pessoais',
      'Equipamentos de aventura',
    ],
    excludes: [
      'Almoço',
      'Transporte (encontro no local)',
    ],
  },
  {
    id: 'tour-historico',
    name: 'Tour Histórico',
    tourType: 'historical_tour' as const,
    basePrice: 90,
    description: 'Roteiro histórico de Caldas Novas e região',
    duration: '5 horas',
    includes: [
      'Transporte',
      'Guia historiador',
      'Visita a monumentos históricos',
      'Material informativo',
    ],
    excludes: [
      'Ingressos',
      'Refeições',
    ],
  },
];

/**
 * Gera todos os templates de passeios para Caldas Novas
 * Total: 6 templates conforme documento
 */
export function generateAllTourTemplates(): BudgetTemplate[] {
  const templates: BudgetTemplate[] = [];
  
  for (const tour of caldasNovasTours) {
    const template = createTourTemplate({
      tourName: tour.name,
      tourId: tour.id,
      tourType: tour.tourType,
      basePrice: tour.basePrice,
      description: tour.description,
      duration: tour.duration,
      transportIncluded: tour.transportIncluded !== false,
      guideIncluded: tour.guideIncluded !== false,
      mealIncluded: tour.mealIncluded || false,
      difficulty: tour.difficulty || 'facil',
      minParticipants: tour.minParticipants || 2,
      maxParticipants: tour.maxParticipants || 20,
      includes: tour.includes || [],
      excludes: tour.excludes || [],
    });
    
    templates.push(template);
  }
  
  return templates;
}

/**
 * Templates principais de passeios (6 templates conforme documento)
 */
export const caldasNovasToursTemplates: BudgetTemplate[] = generateAllTourTemplates();

// Exporta função para obter todos os templates
export function getAllCaldasNovasTourTemplates(): BudgetTemplate[] {
  return caldasNovasToursTemplates;
}

