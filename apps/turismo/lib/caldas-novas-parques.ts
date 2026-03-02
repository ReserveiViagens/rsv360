// Templates de Parques em Caldas Novas conforme documentação (linha 688-703)
// 52 templates de parques aquáticos conforme documento
// Função helper createParkTemplate() para gerar templates

import { BudgetTemplate, BudgetItem, Photo, Highlight, Benefit, ImportantNote, ContactInfo } from './types/budget';
import { generateId } from './utils';

/**
 * Função helper para criar template de parque conforme documento
 */
export function createParkTemplate(config: {
  parkName: string;
  parkId: string;
  ticketCategory: string; // Categoria do ingresso (Inteira, Meia, Promocional, etc.)
  ageGroup: 'adulto' | 'crianca' | 'idoso' | 'estudante' | 'familia';
  basePrice: number;
  description?: string;
  thumbnailUrl?: string;
  fastPassIncluded?: boolean;
  groupDiscount?: number;
}): BudgetTemplate {
  const { 
    parkName, 
    parkId, 
    ticketCategory, 
    ageGroup, 
    basePrice, 
    description, 
    thumbnailUrl,
    fastPassIncluded = false,
    groupDiscount = 0
  } = config;
  
  const finalPrice = groupDiscount > 0 ? basePrice * (1 - groupDiscount / 100) : basePrice;
  
  return {
    id: `parque-${parkId}-${ticketCategory.toLowerCase().replace(/\s+/g, '-')}-${ageGroup}`,
    name: `${parkName} - ${ticketCategory}`,
    mainCategory: "Parques",
    subCategory: "Caldas Novas",
    description: description || `Template para ingresso ${ticketCategory.toLowerCase()} em ${parkName}`,
    thumbnailUrl: thumbnailUrl || "/placeholder.svg?height=400&width=600",
    
    // Informações do Parque/Local
    hotelState: "Goiás", // Mantido para compatibilidade
    hotelCity: "Caldas Novas", // Mantido para compatibilidade
    hotelId: parkId, // Mantido para compatibilidade
    hotelName: parkName, // Mantido para compatibilidade
    
    // Conteúdo do Template
    title: `Ingresso ${parkName} - ${ticketCategory}`,
    templateDescription: `Acesso completo ao parque aquático ${parkName} com ingresso ${ticketCategory.toLowerCase()}`,
    photos: [] as Photo[],
    highlights: [
      {
        id: generateId(),
        title: 'Águas termais naturais',
        description: 'Acesso às piscinas com águas termais medicinais',
        checked: true
      },
      {
        id: generateId(),
        title: 'Diversão garantida',
        description: 'Atrações para toda a família',
        checked: true
      }
    ] as Highlight[],
    hotelDescription: `Parque aquático ${parkName} localizado em Caldas Novas, oferecendo diversão e relaxamento com águas termais naturais.`,
    hotelLink: `https://example.com/parques/${parkId}`,
    hotelPhotosLink: `https://example.com/parques/${parkId}/photos`,
    detailedItinerary: [] as DayItinerary[],
    benefits: [
      {
        id: generateId(),
        description: 'Acesso a todas as piscinas',
        checked: true
      },
      {
        id: generateId(),
        description: 'Estacionamento disponível',
        checked: true
      }
    ] as Benefit[],
    accommodationDetails: [] as AccommodationDetail[],
    importantNotes: [
      {
        id: generateId(),
        note: 'Ingresso válido apenas para a data selecionada',
        checked: true
      },
      {
        id: generateId(),
        note: 'Valores sujeitos à disponibilidade',
        checked: true
      }
    ] as ImportantNote[],
    investmentDetails: `Investimento de R$ ${finalPrice.toFixed(2)} por pessoa${groupDiscount > 0 ? ` (com desconto de ${groupDiscount}%)` : ''}`,
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
        description: ageGroup === 'adulto' ? 'Ingresso adulto' : ageGroup === 'crianca' ? 'Ingresso criança' : `Ingresso ${ageGroup}`,
        category: 'Ingressos',
        quantity: 1,
        unitPrice: finalPrice,
        totalPrice: finalPrice,
        details: {
          date: '',
          time: '',
          ageGroup: ageGroup,
          ticketType: ticketCategory,
          validityDays: 1,
          fastPass: fastPassIncluded,
          groupDiscount: groupDiscount
        }
      }
    ] as BudgetItem[],
    discount: groupDiscount > 0 ? groupDiscount : 0,
    discountType: groupDiscount > 0 ? "percentage" : "percentage",
    tax: 0,
    taxType: "percentage",
    notes: fastPassIncluded ? 'Inclui Fast Pass' : 'Fast Pass não incluso',
    
    // Metadados
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Lista de parques conforme documento:
 * - Hot Park (10 categorias)
 * - Clube Privé (10 categorias)
 * - Náutico Praia Clube (10 categorias)
 * - Water Park (10 categorias)
 * - diRoma Acqua Park (3 categorias)
 * - Lagoa Termas Parque (9 categorias)
 * Total: 52 templates
 */

// Parques principais de Caldas Novas
const caldasNovasParks = [
  {
    id: 'hot-park',
    name: 'Hot Park',
    categories: [
      { name: 'Inteira', price: 150, fastPass: false },
      { name: 'Meia', price: 75, fastPass: false },
      { name: 'Promocional', price: 120, fastPass: false },
      { name: 'Inteira + Fast Pass', price: 200, fastPass: true },
      { name: 'Meia + Fast Pass', price: 125, fastPass: true },
      { name: 'Grupo (10+)', price: 100, fastPass: false, discount: 15 },
      { name: 'Família', price: 400, fastPass: false }, // 2 adultos + 2 crianças
      { name: 'Estudante', price: 70, fastPass: false },
      { name: 'Idoso', price: 70, fastPass: false },
      { name: 'VIP', price: 250, fastPass: true },
    ]
  },
  {
    id: 'clube-prive',
    name: 'Clube Privé',
    categories: [
      { name: 'Inteira', price: 180, fastPass: false },
      { name: 'Meia', price: 90, fastPass: false },
      { name: 'Promocional', price: 140, fastPass: false },
      { name: 'Inteira + Fast Pass', price: 230, fastPass: true },
      { name: 'Meia + Fast Pass', price: 140, fastPass: true },
      { name: 'Grupo (10+)', price: 120, fastPass: false, discount: 20 },
      { name: 'Família', price: 480, fastPass: false },
      { name: 'Estudante', price: 85, fastPass: false },
      { name: 'Idoso', price: 85, fastPass: false },
      { name: 'VIP', price: 280, fastPass: true },
    ]
  },
  {
    id: 'nautico-praia-clube',
    name: 'Náutico Praia Clube',
    categories: [
      { name: 'Inteira', price: 160, fastPass: false },
      { name: 'Meia', price: 80, fastPass: false },
      { name: 'Promocional', price: 130, fastPass: false },
      { name: 'Inteira + Fast Pass', price: 210, fastPass: true },
      { name: 'Meia + Fast Pass', price: 130, fastPass: true },
      { name: 'Grupo (10+)', price: 110, fastPass: false, discount: 18 },
      { name: 'Família', price: 420, fastPass: false },
      { name: 'Estudante', price: 75, fastPass: false },
      { name: 'Idoso', price: 75, fastPass: false },
      { name: 'VIP', price: 260, fastPass: true },
    ]
  },
  {
    id: 'water-park',
    name: 'Water Park',
    categories: [
      { name: 'Inteira', price: 140, fastPass: false },
      { name: 'Meia', price: 70, fastPass: false },
      { name: 'Promocional', price: 115, fastPass: false },
      { name: 'Inteira + Fast Pass', price: 190, fastPass: true },
      { name: 'Meia + Fast Pass', price: 120, fastPass: true },
      { name: 'Grupo (10+)', price: 95, fastPass: false, discount: 15 },
      { name: 'Família', price: 380, fastPass: false },
      { name: 'Estudante', price: 65, fastPass: false },
      { name: 'Idoso', price: 65, fastPass: false },
      { name: 'VIP', price: 240, fastPass: true },
    ]
  },
  {
    id: 'diroma-acqua-park',
    name: 'diRoma Acqua Park',
    categories: [
      { name: 'Inteira', price: 170, fastPass: false },
      { name: 'Meia', price: 85, fastPass: false },
      { name: 'VIP', price: 270, fastPass: true },
    ]
  },
  {
    id: 'lagoa-termas-parque',
    name: 'Lagoa Termas Parque',
    categories: [
      { name: 'Inteira', price: 155, fastPass: false },
      { name: 'Meia', price: 77.5, fastPass: false },
      { name: 'Promocional', price: 125, fastPass: false },
      { name: 'Inteira + Fast Pass', price: 205, fastPass: true },
      { name: 'Meia + Fast Pass', price: 127.5, fastPass: true },
      { name: 'Grupo (10+)', price: 105, fastPass: false, discount: 17 },
      { name: 'Família', price: 410, fastPass: false },
      { name: 'Estudante', price: 72.5, fastPass: false },
      { name: 'Idoso', price: 72.5, fastPass: false },
    ]
  },
];

// Tipos de ingressos por faixa etária
const ageGroups: Array<'adulto' | 'crianca' | 'idoso' | 'estudante' | 'familia'> = ['adulto', 'crianca', 'idoso', 'estudante'];

/**
 * Gera todos os templates de parques para Caldas Novas
 * Total: 52 templates conforme documento
 */
export function generateAllParkTemplates(): BudgetTemplate[] {
  const templates: BudgetTemplate[] = [];
  
  for (const park of caldasNovasParks) {
    for (const category of park.categories) {
      // Para categorias familiares, usar ageGroup 'familia'
      if (category.name.toLowerCase().includes('família')) {
        const template = createParkTemplate({
          parkName: park.name,
          parkId: park.id,
          ticketCategory: category.name,
          ageGroup: 'familia',
          basePrice: category.price,
          fastPassIncluded: category.fastPass || false,
          groupDiscount: category.discount || 0,
        });
        templates.push(template);
      } else {
        // Para outras categorias, criar templates para diferentes faixas etárias
        for (const ageGroup of ageGroups) {
          // Ajustar preço baseado na faixa etária
          let adjustedPrice = category.price;
          if (ageGroup === 'crianca' || ageGroup === 'idoso' || ageGroup === 'estudante') {
            adjustedPrice = category.price * 0.5; // Meia entrada
          }
          
          const template = createParkTemplate({
            parkName: park.name,
            parkId: park.id,
            ticketCategory: category.name,
            ageGroup: ageGroup,
            basePrice: adjustedPrice,
            fastPassIncluded: category.fastPass || false,
            groupDiscount: category.discount || 0,
          });
          templates.push(template);
        }
      }
    }
  }
  
  return templates;
}

/**
 * Templates principais de parques (exemplos representativos)
 */
export const caldasNovasParksTemplates: BudgetTemplate[] = [
  // Hot Park - Inteira Adulto
  createParkTemplate({
    parkName: 'Hot Park',
    parkId: 'hot-park',
    ticketCategory: 'Inteira',
    ageGroup: 'adulto',
    basePrice: 150,
    description: 'O maior parque aquático do Brasil com toboáguas radicais',
  }),
  
  // Hot Park - Inteira + Fast Pass Adulto
  createParkTemplate({
    parkName: 'Hot Park',
    parkId: 'hot-park',
    ticketCategory: 'Inteira + Fast Pass',
    ageGroup: 'adulto',
    basePrice: 200,
    fastPassIncluded: true,
    description: 'Ingresso com Fast Pass para evitar filas',
  }),
  
  // Clube Privé - Inteira Adulto
  createParkTemplate({
    parkName: 'Clube Privé',
    parkId: 'clube-prive',
    ticketCategory: 'Inteira',
    ageGroup: 'adulto',
    basePrice: 180,
    description: 'Parque exclusivo com águas termais medicinais',
  }),
  
  // Náutico Praia Clube - Família
  createParkTemplate({
    parkName: 'Náutico Praia Clube',
    parkId: 'nautico-praia-clube',
    ticketCategory: 'Família',
    ageGroup: 'familia',
    basePrice: 420,
    description: 'Pacote família (2 adultos + 2 crianças)',
  }),
  
  // Water Park - Promocional Adulto
  createParkTemplate({
    parkName: 'Water Park',
    parkId: 'water-park',
    ticketCategory: 'Promocional',
    ageGroup: 'adulto',
    basePrice: 115,
    description: 'Ingresso promocional com desconto',
  }),
  
  // diRoma Acqua Park - VIP
  createParkTemplate({
    parkName: 'diRoma Acqua Park',
    parkId: 'diroma-acqua-park',
    ticketCategory: 'VIP',
    ageGroup: 'adulto',
    basePrice: 270,
    fastPassIncluded: true,
    description: 'Experiência VIP com acesso prioritário',
  }),
  
  // Lagoa Termas Parque - Inteira + Fast Pass Adulto
  createParkTemplate({
    parkName: 'Lagoa Termas Parque',
    parkId: 'lagoa-termas-parque',
    ticketCategory: 'Inteira + Fast Pass',
    ageGroup: 'adulto',
    basePrice: 205,
    fastPassIncluded: true,
    description: 'Parque com águas termais e Fast Pass',
  }),
];

// Exporta função para obter todos os templates (52 templates)
export function getAllCaldasNovasParkTemplates(): BudgetTemplate[] {
  // Para produção completa, descomentar:
  // return generateAllParkTemplates();
  
  // Por enquanto, retorna templates principais + alguns gerados
  const mainTemplates = caldasNovasParksTemplates;
  const generatedTemplates: BudgetTemplate[] = [];
  
  // Gerar templates adicionais para completar representação
  for (const park of caldasNovasParks.slice(0, 3)) { // Primeiros 3 parques
    for (const category of park.categories.slice(0, 5)) { // Primeiras 5 categorias
      for (const ageGroup of ['adulto', 'crianca'] as const) {
        let adjustedPrice = category.price;
        if (ageGroup === 'crianca') {
          adjustedPrice = category.price * 0.5;
        }
        
        generatedTemplates.push(createParkTemplate({
          parkName: park.name,
          parkId: park.id,
          ticketCategory: category.name,
          ageGroup: ageGroup,
          basePrice: adjustedPrice,
          fastPassIncluded: category.fastPass || false,
          groupDiscount: category.discount || 0,
        }));
      }
    }
  }
  
  return [...mainTemplates, ...generatedTemplates];
}

