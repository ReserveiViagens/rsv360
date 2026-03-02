// Templates de Atrações em Caldas Novas conforme documentação (linha 704-721)
// 9 templates de atrações turísticas conforme documento

import { BudgetTemplate, BudgetItem, Photo, Highlight, Benefit, ImportantNote, ContactInfo } from './types/budget';
import { generateId } from './utils';

/**
 * Função helper para criar template de atração conforme documento
 */
export function createAttractionTemplate(config: {
  attractionName: string;
  attractionId: string;
  ticketCategory: string;
  ageGroup: 'adulto' | 'crianca' | 'idoso' | 'estudante';
  basePrice: number;
  description?: string;
  thumbnailUrl?: string;
  hasScheduledTour?: boolean;
  tourGuideIncluded?: boolean;
  duration?: string;
}): BudgetTemplate {
  const { 
    attractionName, 
    attractionId, 
    ticketCategory, 
    ageGroup, 
    basePrice, 
    description, 
    thumbnailUrl,
    hasScheduledTour = false,
    tourGuideIncluded = false,
    duration = '1-2 horas'
  } = config;
  
  return {
    id: `atracao-${attractionId}-${ticketCategory.toLowerCase().replace(/\s+/g, '-')}-${ageGroup}`,
    name: `${attractionName} - ${ticketCategory}`,
    mainCategory: "Atrações",
    subCategory: "Caldas Novas",
    description: description || `Template para ${attractionName}`,
    thumbnailUrl: thumbnailUrl || "/placeholder.svg?height=400&width=600",
    
    // Informações da Atração/Local
    hotelState: "Goiás", // Mantido para compatibilidade
    hotelCity: "Caldas Novas", // Mantido para compatibilidade
    hotelId: attractionId, // Mantido para compatibilidade
    hotelName: attractionName, // Mantido para compatibilidade
    
    // Conteúdo do Template
    title: `Visita ${attractionName} - ${ticketCategory}`,
    templateDescription: `Experiência única em ${attractionName}${duration ? ` com duração de ${duration}` : ''}`,
    photos: [] as Photo[],
    highlights: [
      {
        id: generateId(),
        title: 'Atração turística única',
        description: 'Experiência inesquecível',
        checked: true
      }
    ] as Highlight[],
    hotelDescription: `${attractionName} - ${description || 'Uma das principais atrações turísticas de Caldas Novas'}`,
    hotelLink: `https://example.com/atracoes/${attractionId}`,
    detailedItinerary: [] as DayItinerary[],
    benefits: [
      {
        id: generateId(),
        description: 'Acesso completo à atração',
        checked: true
      },
      ...(tourGuideIncluded ? [{
        id: generateId(),
        description: 'Guia turístico incluído',
        checked: true
      }] : []),
      ...(hasScheduledTour ? [{
        id: generateId(),
        description: 'Tour agendado',
        checked: true
      }] : [])
    ] as Benefit[],
    accommodationDetails: [] as AccommodationDetail[],
    importantNotes: [
      {
        id: generateId(),
        note: `Duração estimada: ${duration}`,
        checked: true
      },
      {
        id: generateId(),
        note: 'Valores sujeitos à disponibilidade',
        checked: true
      }
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
        name: `Ingresso ${ticketCategory} - ${ageGroup}`,
        description: `Acesso à ${attractionName}`,
        category: 'Ingressos',
        quantity: 1,
        unitPrice: basePrice,
        totalPrice: basePrice,
        details: {
          date: '',
          time: '',
          ageGroup: ageGroup,
          ticketType: ticketCategory,
          validityDays: 1,
          tourGuide: tourGuideIncluded,
          scheduledTime: hasScheduledTour ? '09:00' : undefined,
        }
      }
    ] as BudgetItem[],
    discount: 0,
    discountType: "percentage",
    tax: 0,
    taxType: "percentage",
    notes: hasScheduledTour ? 'Tour agendado - horário a definir' : 'Visita livre',
    
    // Metadados
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Lista de atrações conforme documento:
 * 1. Jardim Japonês
 * 2. Monumento das Águas
 * 3. Serra de Caldas
 * 4. Feira Hippie
 * 5. Lagoa Quente de Pirapitinga
 * 6. Parque Estadual da Serra de Caldas Novas
 * 7. SETLAND 6-14 anos
 * 8. SETLAND 15-59 anos
 * 9. SETLAND 60+ anos
 * Total: 9 templates
 */

// Atrações de Caldas Novas
const caldasNovasAttractions = [
  {
    id: 'jardim-japones',
    name: 'Jardim Japonês',
    description: 'Jardim paisagístico inspirado na cultura japonesa',
    basePrice: 25,
    duration: '1 hora',
    tourGuideIncluded: false,
  },
  {
    id: 'monumento-das-aguas',
    name: 'Monumento das Águas',
    description: 'Monumento histórico das águas termais',
    basePrice: 15,
    duration: '30 minutos',
    tourGuideIncluded: false,
  },
  {
    id: 'serra-de-caldas',
    name: 'Serra de Caldas',
    description: 'Mirante com vista panorâmica da região',
    basePrice: 20,
    duration: '1-2 horas',
    tourGuideIncluded: false,
  },
  {
    id: 'feira-hippie',
    name: 'Feira Hippie',
    description: 'Feira de artesanato e produtos regionais',
    basePrice: 0, // Gratuita
    duration: '2-3 horas',
    tourGuideIncluded: false,
  },
  {
    id: 'lagoa-quente-pirapitinga',
    name: 'Lagoa Quente de Pirapitinga',
    description: 'Lagoa natural com águas termais',
    basePrice: 30,
    duration: '2-3 horas',
    tourGuideIncluded: false,
  },
  {
    id: 'parque-estadual-serra-caldas',
    name: 'Parque Estadual da Serra de Caldas Novas',
    description: 'Parque natural com trilhas e natureza preservada',
    basePrice: 35,
    duration: '3-4 horas',
    tourGuideIncluded: true,
    hasScheduledTour: true,
  },
  {
    id: 'setland-6-14',
    name: 'SETLAND - 6 a 14 anos',
    description: 'Parque temático para crianças e adolescentes',
    basePrice: 40,
    ageGroup: 'crianca' as const,
    duration: '3-4 horas',
    tourGuideIncluded: false,
  },
  {
    id: 'setland-15-59',
    name: 'SETLAND - 15 a 59 anos',
    description: 'Parque temático para adultos',
    basePrice: 50,
    ageGroup: 'adulto' as const,
    duration: '3-4 horas',
    tourGuideIncluded: false,
  },
  {
    id: 'setland-60',
    name: 'SETLAND - 60+ anos',
    description: 'Parque temático para idosos',
    basePrice: 30,
    ageGroup: 'idoso' as const,
    duration: '3-4 horas',
    tourGuideIncluded: false,
  },
];

/**
 * Gera todos os templates de atrações para Caldas Novas
 * Total: 9 templates conforme documento
 */
export function generateAllAttractionTemplates(): BudgetTemplate[] {
  const templates: BudgetTemplate[] = [];
  
  for (const attraction of caldasNovasAttractions) {
    const ageGroup = attraction.ageGroup || 'adulto';
    
    const template = createAttractionTemplate({
      attractionName: attraction.name,
      attractionId: attraction.id,
      ticketCategory: 'Inteira',
      ageGroup: ageGroup,
      basePrice: attraction.basePrice,
      description: attraction.description,
      duration: attraction.duration,
      hasScheduledTour: attraction.hasScheduledTour || false,
      tourGuideIncluded: attraction.tourGuideIncluded || false,
    });
    
    templates.push(template);
  }
  
  return templates;
}

/**
 * Templates principais de atrações (9 templates conforme documento)
 */
export const caldasNovasAttractionsTemplates: BudgetTemplate[] = generateAllAttractionTemplates();

// Exporta função para obter todos os templates
export function getAllCaldasNovasAttractionTemplates(): BudgetTemplate[] {
  return caldasNovasAttractionsTemplates;
}

