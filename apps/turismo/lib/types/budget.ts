// Tipos para o sistema de cotações RSV 360

// Tipo de orçamento (conforme documentação)
export type BudgetType = 'hotel' | 'parque' | 'atracao' | 'passeio' | 'personalizado';

export interface Budget {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string; // Conforme documento: obrigatório, não opcional
  clientDocument?: string;
  
  // Informações da cotação
  type: BudgetType; // Mantido para compatibilidade
  budgetType?: BudgetType; // Adicionado conforme documento
  category?: string;
  mainCategory?: string; // Adicionado conforme documento
  description?: string;
  notes?: string;
  
  // Valores
  subtotal: number;
  discount: number;
  discountType?: 'percentage' | 'fixed'; // Mantido opcional para compatibilidade, mas deve ser definido
  taxes: number;
  tax?: number; // Adicionado conforme documento (alias opcional para taxes)
  taxType?: 'percentage' | 'fixed'; // Mantido opcional para compatibilidade, mas deve ser definido
  total: number;
  currency: string;
  
  // Status e datas
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'; // Mantido 'expired' para compatibilidade
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // Mantido para compatibilidade
  validUntil?: string; // Mantido opcional para compatibilidade, mas recomendado conforme documento
  
  // Mensagem de urgência
  showUrgencyMessage?: boolean;
  urgencyMessage?: string;
  
  // Itens da cotação
  items: BudgetItem[];
  
  // Configurações
  template?: string;
  companyInfo?: CompanyInfo; // Mantido para compatibilidade
  companyHeader?: CompanyHeader; // Adicionado conforme documento
  terms?: string;
  
  // Campos específicos para hotéis
  hotelState?: string;
  hotelCity?: string;
  hotelId?: string;
  hotelName?: string;
  
  // Campos específicos para parques
  parkState?: string;
  parkCity?: string;
  parkId?: string;
  parkName?: string;
  parkType?: 'aquatico' | 'tematico' | 'aventura' | 'zoologico' | 'diversoes';
  visitDate?: string;
  groupSize?: number;
  hasGroupDiscount?: boolean;
  fastPassIncluded?: boolean;
  
  // Campos específicos para atrações
  attractionState?: string;
  attractionCity?: string;
  attractionId?: string;
  attractionName?: string;
  attractionType?: 'museu' | 'monumento' | 'parque_natural' | 'centro_historico' | 'mirante' | 'show' | 'tour' | 'experiencia';
  visitDate?: string;
  visitTime?: string;
  groupSize?: number;
  hasGroupDiscount?: boolean;
  hasScheduledTour?: boolean;
  tourGuideIncluded?: boolean;
  duration?: string;
  
  // Campos específicos para passeios
  tourState?: string;
  tourCity?: string;
  tourId?: string;
  tourName?: string;
  tourType?: 'city_tour' | 'eco_tour' | 'cultural_tour' | 'gastronomic_tour' | 'adventure_tour' | 'historical_tour' | 'beach_tour' | 'night_tour';
  tourDate?: string;
  departureTime?: string;
  returnTime?: string;
  transportIncluded?: boolean;
  guideIncluded?: boolean;
  mealIncluded?: boolean;
  meetingPoint?: string;
  difficulty?: 'facil' | 'moderado' | 'dificil';
  weatherDependent?: boolean;
  minParticipants?: number;
  maxParticipants?: number;
  
  // Conteúdo visual e detalhes
  photos?: Photo[]; // Mantido opcional para compatibilidade (documento espera array obrigatório)
  galleryStyle?: GalleryStyle;
  investmentStyle?: InvestmentStyle;
  notesStyle?: NotesStyle;
  highlights?: Highlight[]; // Mantido opcional para compatibilidade (documento espera array obrigatório)
  benefits?: Benefit[]; // Mantido opcional para compatibilidade (documento espera array obrigatório)
  accommodationDetails?: AccommodationDetail[]; // Mantido opcional para compatibilidade (documento espera array obrigatório)
  importantNotes?: ImportantNote[]; // Mantido opcional para compatibilidade (documento espera array obrigatório)
  detailedItinerary?: DayItinerary[]; // Mantido opcional para compatibilidade (documento espera array obrigatório)
  
  // Links e descrições
  hotelDescription?: string;
  hotelLink?: string;
  hotelPhotosLink?: string;
  apartmentPhotosLink?: string;
  itineraryRichText?: string;
  investmentDetails?: string;
  
  // Informações de contato
  contacts?: ContactInfo; // Mantido opcional para compatibilidade (documento espera obrigatório)
  
  // Metadados
  version: number;
  tags?: string[];
}

export interface BudgetItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // Detalhes específicos por tipo
  details?: {
    // Para hotéis
    checkIn?: string;
    checkOut?: string;
    roomType?: string;
    guests?: number;
    accommodationType?: string;
    
          // Para parques/atrações
          date?: string;
          time?: string;
          ageGroup?: 'adulto' | 'crianca' | 'idoso' | 'estudante' | 'familia';
          ticketType?: string;
          validityDays?: number;
          fastPass?: boolean;
          groupDiscount?: number;
          
          // Para atrações específicas
          tourGuide?: boolean;
          audioGuide?: boolean;
          scheduledTime?: string;
          meetingPoint?: string;
          difficulty?: 'facil' | 'moderado' | 'dificil';
          accessibility?: boolean;
          
          // Para passeios específicos
          departureTime?: string;
          returnTime?: string;
          transportIncluded?: boolean;
          guideIncluded?: boolean;
          mealIncluded?: boolean;
          weatherDependent?: boolean;
          minParticipants?: number;
          maxParticipants?: number;
          includes?: string[];
          excludes?: string[];
          pickupLocation?: string;
          dropoffLocation?: string;
          language?: string;
          groupSize?: number;
          specialRequests?: string;
    
    // Para passeios
    duration?: string;
    includes?: string[];
    excludes?: string[];
  };
}

// Interfaces específicas para hotéis
export interface Photo {
  id: string;
  url: string;
  caption?: string;
  type?: 'image' | 'video';
}

export interface Highlight {
  id: string;
  title: string;
  description: string;
  checked: boolean;
}

export interface Benefit {
  id: string;
  description: string;
  checked: boolean;
}

export interface DayItinerary {
  id: string;
  day: number;
  date: string;
  title: string;
  activities: string[];
}

export interface AccommodationDetail {
  id: string;
  title: string;
  description: string;
  capacity?: string;
  checked: boolean;
}

export interface ImportantNote {
  id: string;
  note: string;
  checked: boolean;
}

export interface ContactInfo {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

export interface GalleryStyle {
  backgroundColor?: string;
  shadowEffect?: "none" | "sm" | "md" | "lg" | "xl";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
  hoverEffect?: "none" | "scale" | "lift" | "glow";
  padding?: "none" | "sm" | "md" | "lg";
}

export interface InvestmentStyle {
  backgroundColor?: string;
  textColor?: string;
  shadowEffect?: "none" | "sm" | "md" | "lg" | "xl";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
  padding?: "none" | "sm" | "md" | "lg";
}

export interface NotesStyle {
  backgroundColor?: string;
  textColor?: string;
  shadowEffect?: "none" | "sm" | "md" | "lg" | "xl";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
  padding?: "none" | "sm" | "md" | "lg";
}

// Cabeçalho da empresa conforme documento (linha 332-348)
export interface CompanyHeader {
  logoUrl?: string;
  companyName: string;
  headerColor?: string;
  footerColor?: string;
  footerTextColor?: string;
  footerBackgroundColor?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
    tiktok?: string;
  };
}

// Mantido para compatibilidade com código existente
export interface CompanyInfo {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  cnpj?: string;
  
  // Informações bancárias
  bankInfo?: {
    bank: string;
    agency: string;
    account: string;
    pix?: string;
  };
}

// Interface BudgetTemplate conforme documento (linha 211-259)
export interface BudgetTemplate {
  // Identificação e Categorização
  id: string;
  name: string;
  mainCategory: string; // Adicionado conforme documento
  subCategory: string; // Adicionado conforme documento
  description: string;
  thumbnailUrl?: string; // Adicionado conforme documento
  
  // Informações do Hotel/Local
  maxGuests?: string; // Adicionado conforme documento
  roomCount?: string; // Adicionado conforme documento
  hotelState?: string; // Adicionado conforme documento
  hotelCity?: string; // Adicionado conforme documento
  hotelId?: string; // Adicionado conforme documento
  hotelName?: string; // Adicionado conforme documento
  
  // Cabeçalho da Empresa
  companyHeader?: CompanyHeader; // Adicionado conforme documento
  
  // Conteúdo do Template
  title: string; // Adicionado conforme documento
  templateDescription: string; // Adicionado conforme documento (era apenas 'description')
  photos: Photo[]; // Adicionado conforme documento
  highlights: Highlight[]; // Adicionado conforme documento
  hotelDescription?: string; // Adicionado conforme documento
  hotelLink?: string; // Adicionado conforme documento
  hotelPhotosLink?: string; // Adicionado conforme documento
  apartmentPhotosLink?: string; // Adicionado conforme documento
  itineraryRichText?: string; // Adicionado conforme documento
  detailedItinerary: DayItinerary[]; // Adicionado conforme documento
  benefits: Benefit[]; // Adicionado conforme documento
  accommodationDetails: AccommodationDetail[]; // Adicionado conforme documento
  importantNotes: ImportantNote[]; // Adicionado conforme documento
  investmentDetails?: string; // Adicionado conforme documento
  contacts: ContactInfo; // Adicionado conforme documento
  
  // Itens e Preços
  items: BudgetItem[]; // Adicionado conforme documento (era 'defaultItems')
  discount: number; // Adicionado conforme documento
  discountType: "percentage" | "fixed"; // Adicionado conforme documento
  tax: number; // Adicionado conforme documento
  taxType: "percentage" | "fixed"; // Adicionado conforme documento
  notes?: string; // Adicionado conforme documento
  
  // Metadados (mantidos para compatibilidade)
  category?: string; // Mantido para compatibilidade (mapear para mainCategory)
  type?: BudgetType; // Mantido para compatibilidade
  defaultItems?: Omit<BudgetItem, 'id'>[]; // Mantido para compatibilidade (mapear para items)
  defaultTerms?: string; // Mantido para compatibilidade
  defaultNotes?: string; // Mantido para compatibilidade
  createdAt: string;
  updatedAt: string;
  isActive?: boolean; // Mantido para compatibilidade
  usageCount?: number; // Mantido para compatibilidade
}

// Tipos para filtros e busca
export interface BudgetFilters {
  status?: Budget['status'][];
  type?: Budget['type'][];
  dateRange?: {
    start: string;
    end: string;
  };
  minValue?: number;
  maxValue?: number;
  search?: string;
}

// Tipos para estatísticas
export interface BudgetStats {
  total: number;
  totalValue: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
  
  // Por período
  thisMonth: {
    total: number;
    value: number;
  };
  lastMonth: {
    total: number;
    value: number;
  };
  
  // Por tipo
  byType: Record<Budget['type'], {
    count: number;
    value: number;
  }>;
}

// Tipos para exportação
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeItems: boolean;
  includeNotes: boolean;
  template?: string;
}

// Tipos para configurações
export interface BudgetSettings {
  defaultCurrency: string;
  defaultTaxRate: number;
  defaultExpirationDays: number;
  autoNumbering: boolean;
  numberPrefix: string;
  
  // Configurações de email
  emailSettings: {
    enabled: boolean;
    template: string;
    subject: string;
  };
  
  // Configurações da empresa
  companyInfo: CompanyInfo;
}
