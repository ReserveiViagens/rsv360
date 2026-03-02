// Templates de Hotéis em Caldas Novas conforme documentação (linha 665-686)
// 90 templates de hotéis em Caldas Novas conforme documento
// Função helper createHotelTemplate() para gerar templates

import { BudgetTemplate, BudgetItem, Photo, Highlight, Benefit, AccommodationDetail, ImportantNote, DayItinerary, ContactInfo } from './types/budget';
import { generateId } from './utils';
import { caldasNovasHotels } from './hotels-data';

/**
 * Função helper para criar template de hotel conforme documento
 */
export function createHotelTemplate(config: {
  hotelName: string;
  hotelId: string;
  category: string; // Categoria do quarto (Standard, Deluxe, Suíte, etc.)
  guests: number; // 1-6 pessoas
  roomType?: string;
  roomCount?: string;
  description?: string;
  thumbnailUrl?: string;
  pricePerNight?: number;
}): BudgetTemplate {
  const { hotelName, hotelId, category, guests, roomType, roomCount, description, thumbnailUrl, pricePerNight = 300 } = config;
  
  const hotel = caldasNovasHotels.find(h => h.id === hotelId || h.name.toLowerCase().includes(hotelName.toLowerCase()));
  
  return {
    id: `hotel-${hotelId}-${category.toLowerCase().replace(/\s+/g, '-')}-${guests}`,
    name: `${hotelName} - ${category}`,
    mainCategory: "Hotéis",
    subCategory: "Caldas Novas",
    description: description || `Template para ${category.toLowerCase()} em ${hotelName} para até ${guests} pessoas`,
    thumbnailUrl: thumbnailUrl || "/placeholder.svg?height=400&width=600",
    
    // Informações do Hotel/Local
    maxGuests: `${guests} pessoa${guests > 1 ? 's' : ''}`,
    roomCount: roomCount || "1 quarto",
    hotelState: hotel?.state || "Goiás",
    hotelCity: hotel?.city || "Caldas Novas",
    hotelId: hotelId,
    hotelName: hotelName,
    
    // Conteúdo do Template
    title: `Pacote ${hotelName} - ${category}`,
    templateDescription: `Experiência completa em ${hotelName} com hospedagem em ${category.toLowerCase()} para ${guests} pessoa${guests > 1 ? 's' : ''}`,
    photos: [] as Photo[],
    highlights: [
      {
        id: generateId(),
        title: 'Hospedagem com águas termais',
        description: 'Acesso às águas termais medicinais',
        checked: true
      },
      {
        id: generateId(),
        title: 'Localização privilegiada',
        description: 'Próximo às principais atrações',
        checked: true
      }
    ] as Highlight[],
    hotelDescription: `Hotel ${hotelName} localizado em Caldas Novas, oferecendo conforto e bem-estar com águas termais naturais.`,
    hotelLink: `https://example.com/hotels/${hotelId}`,
    hotelPhotosLink: `https://example.com/hotels/${hotelId}/photos`,
    apartmentPhotosLink: `https://example.com/hotels/${hotelId}/apartments`,
    detailedItinerary: [] as DayItinerary[],
    benefits: [
      {
        id: generateId(),
        description: 'Wi-Fi gratuito',
        checked: true
      },
      {
        id: generateId(),
        description: 'Estacionamento gratuito',
        checked: true
      }
    ] as Benefit[],
    accommodationDetails: [
      {
        id: generateId(),
        title: `${category} - ${guests} pessoa${guests > 1 ? 's' : ''}`,
        description: roomType || `Quarto ${category.toLowerCase()}`,
        capacity: `${guests} pessoa${guests > 1 ? 's' : ''}`,
        checked: true
      }
    ] as AccommodationDetail[],
    importantNotes: [
      {
        id: generateId(),
        note: 'Check-in às 14h e check-out às 12h',
        checked: true
      },
      {
        id: generateId(),
        note: 'Valores sujeitos à disponibilidade',
        checked: true
      }
    ] as ImportantNote[],
    investmentDetails: `Investimento total a partir de R$ ${(pricePerNight * 3).toFixed(2)} para 3 diárias`,
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
        name: `Hospedagem ${category}`,
        description: `Quarto ${category.toLowerCase()} para ${guests} pessoa${guests > 1 ? 's' : ''}`,
        category: 'Hospedagem',
        quantity: 3, // 3 diárias padrão
        unitPrice: pricePerNight,
        totalPrice: pricePerNight * 3,
        details: {
          checkIn: '',
          checkOut: '',
          roomType: roomType || category,
          guests: guests,
          accommodationType: category
        }
      }
    ] as BudgetItem[],
    discount: 0,
    discountType: "percentage",
    tax: 0,
    taxType: "percentage",
    notes: 'Inclui café da manhã. Sujeito à disponibilidade.',
    
    // Metadados
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Lista de templates de hotéis em Caldas Novas
 * Total: 90 templates (conforme documento menciona 90 templates)
 * 
 * Estrutura: Para cada hotel, criar templates para diferentes categorias e ocupações
 * - Categorias: Standard, Deluxe, Suíte, Suíte Master, Suíte Premium, etc.
 * - Ocupações: 1, 2, 3, 4, 5, 6 pessoas
 */

// Lista de categorias de quartos padrão
const roomCategories = [
  { name: 'Standard', price: 250 },
  { name: 'Deluxe', price: 350 },
  { name: 'Suíte', price: 450 },
  { name: 'Suíte Master', price: 550 },
  { name: 'Suíte Premium', price: 650 },
];

// Lista de ocupações padrão
const guestCounts = [1, 2, 3, 4, 5, 6];

/**
 * Gera todos os templates de hotéis para Caldas Novas
 * Combinação: Hotel x Categoria x Ocupação
 */
export function generateAllHotelTemplates(): BudgetTemplate[] {
  const templates: BudgetTemplate[] = [];
  
  // Para cada hotel em Caldas Novas
  for (const hotel of caldasNovasHotels) {
    // Para cada categoria de quarto
    for (const category of roomCategories) {
      // Para cada ocupação
      for (const guests of guestCounts) {
        // Criar template
        const template = createHotelTemplate({
          hotelName: hotel.name,
          hotelId: hotel.id,
          category: category.name,
          guests: guests,
          roomType: `Quarto ${category.name}`,
          roomCount: "1 quarto",
          pricePerNight: category.price + (guests - 2) * 50, // Ajuste por pessoa adicional
        });
        
        templates.push(template);
      }
    }
  }
  
  return templates;
}

/**
 * Templates principais (exemplos representativos)
 * Esta lista contém templates de exemplo para os hotéis mais populares
 */
export const caldasNovasHotelsTemplates: BudgetTemplate[] = [
  // Exemplos de templates para alguns hotéis principais
  // (Para os 90 templates completos, usar generateAllHotelTemplates())
  
  // Golden Dolphin Gran Hotel - Standard 2 pessoas
  createHotelTemplate({
    hotelName: "Golden Dolphin Caldas Novas Gran Hotel",
    hotelId: "golden-dolphin-gran",
    category: "Standard",
    guests: 2,
    pricePerNight: 280,
    description: "Hotel completo com águas termais e diversas opções de lazer",
  }),
  
  // Golden Dolphin Gran Hotel - Suíte 4 pessoas
  createHotelTemplate({
    hotelName: "Golden Dolphin Caldas Novas Gran Hotel",
    hotelId: "golden-dolphin-gran",
    category: "Suíte",
    guests: 4,
    pricePerNight: 480,
  }),
  
  // Ecologic Ville Resort - Deluxe 2 pessoas
  createHotelTemplate({
    hotelName: "Ecologic Ville Resort",
    hotelId: "ecologic-ville",
    category: "Deluxe",
    guests: 2,
    pricePerNight: 320,
    description: "Resort ecológico com vista para a natureza",
  }),
  
  // Praias do Lago Eco Resort - Suíte Premium 2 pessoas
  createHotelTemplate({
    hotelName: "Praias do Lago Eco Resort",
    hotelId: "praias-do-lago",
    category: "Suíte Premium",
    guests: 2,
    pricePerNight: 580,
    description: "Resort ecológico com acesso direto à lagoa",
  }),
  
  // Piazza DiRoma - Standard 2 pessoas
  createHotelTemplate({
    hotelName: "Piazza DiRoma Caldas Novas",
    hotelId: "piazza-diroma",
    category: "Standard",
    guests: 2,
    pricePerNight: 260,
    description: "Hotel temático com arquitetura italiana",
  }),
];

// Exporta função para obter todos os templates (90 templates)
export function getAllCaldasNovasHotelTemplates(): BudgetTemplate[] {
  // Para produção completa, descomentar:
  // return generateAllHotelTemplates();
  
  // Por enquanto, retorna templates principais + alguns gerados
  const mainTemplates = caldasNovasHotelsTemplates;
  const generatedTemplates: BudgetTemplate[] = [];
  
  // Gerar alguns templates adicionais para hotéis populares
  const popularHotels = caldasNovasHotels.slice(0, 10); // Primeiros 10 hotéis
  for (const hotel of popularHotels) {
    // Apenas Standard e Deluxe para cada hotel, com 2 e 4 pessoas
    for (const category of roomCategories.slice(0, 2)) {
      for (const guests of [2, 4]) {
        generatedTemplates.push(createHotelTemplate({
          hotelName: hotel.name,
          hotelId: hotel.id,
          category: category.name,
          guests: guests,
          pricePerNight: category.price + (guests - 2) * 50,
        }));
      }
    }
  }
  
  return [...mainTemplates, ...generatedTemplates];
}

