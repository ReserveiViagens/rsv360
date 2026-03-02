// Tipos para o sistema de cotações RSV 360

export interface Budget {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientDocument?: string;
  
  // Informações da cotação
  type: 'hotel' | 'parque' | 'atracao' | 'passeio' | 'personalizado';
  category?: string;
  description?: string;
  notes?: string;
  
  // Valores
  subtotal: number;
  discount: number;
  discountType?: 'percentage' | 'fixed';
  taxes: number;
  taxType?: 'percentage' | 'fixed';
  total: number;
  currency: string;
  
  // Status e datas
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  validUntil?: string;
  
  // Itens da cotação
  items: BudgetItem[];
  
  // Configurações
  template?: string;
  companyInfo?: CompanyInfo;
  terms?: string;
  
  // Campos específicos para hotéis
  hotelState?: string;
  hotelCity?: string;
  hotelId?: string;
  hotelName?: string;
  
  // Conteúdo visual e detalhes
  photos?: Photo[];
  galleryStyle?: GalleryStyle;
  investmentStyle?: InvestmentStyle;
  notesStyle?: NotesStyle;
  highlights?: Highlight[];
  benefits?: Benefit[];
  accommodationDetails?: AccommodationDetail[];
  importantNotes?: ImportantNote[];
  detailedItinerary?: DayItinerary[];
  
  // Links e descrições
  hotelDescription?: string;
  hotelLink?: string;
  hotelPhotosLink?: string;
  apartmentPhotosLink?: string;
  itineraryRichText?: string;
  investmentDetails?: string;
  
  // Informações de contato
  contacts?: ContactInfo;
  
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
    ageGroup?: string;
    
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

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: Budget['type'];
  
  // Template data
  defaultItems: Omit<BudgetItem, 'id'>[];
  defaultTerms: string;
  defaultNotes: string;
  
  // Metadados
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  usageCount: number;
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
