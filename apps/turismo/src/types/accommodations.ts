// ===================================================================
// TIPOS E INTERFACES - SISTEMA MULTI-ACOMODAÇÕES
// ===================================================================

// ===================================================================
// TIPOS DE EMPREENDIMENTOS
// ===================================================================

export type EnterpriseType = 
  | 'hotel'
  | 'pousada'
  | 'resort'
  | 'flat'
  | 'chacara'
  | 'hostel'
  | 'apartment_hotel'
  | 'resort_apartment'
  | 'resort_house'
  | 'hotel_house'
  | 'airbnb'
  | 'other';

// ===================================================================
// TIPOS DE PROPRIEDADES
// ===================================================================

export type PropertyType = 
  | 'room'
  | 'apartment'
  | 'house'
  | 'suite'
  | 'villa'
  | 'bungalow'
  | 'chalet'
  | 'cabin'
  | 'studio'
  | 'penthouse'
  | 'other';

// ===================================================================
// TIPOS DE ACOMODAÇÕES
// ===================================================================

export type AccommodationType = 
  | 'single_room'
  | 'double_room'
  | 'twin_room'
  | 'triple_room'
  | 'quad_room'
  | 'family_room'
  | 'suite'
  | 'apartment'
  | 'house'
  | 'other';

// ===================================================================
// STATUS
// ===================================================================

export type EnterpriseStatus = 'active' | 'inactive' | 'maintenance' | 'pending_approval';
export type PropertyStatus = 'active' | 'inactive' | 'maintenance' | 'reserved';
export type AccommodationStatus = 'active' | 'inactive' | 'maintenance' | 'reserved' | 'cleaning';

// ===================================================================
// POLÍTICA DE CANCELAMENTO
// ===================================================================

export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'super_strict';

// ===================================================================
// ENDEREÇO
// ===================================================================

export interface Address {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// ===================================================================
// CONTATO
// ===================================================================

export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}

// ===================================================================
// EMPREENDIMENTO
// ===================================================================

export interface Enterprise {
  id: number;
  ownerId?: number;
  name: string;
  legalName?: string;
  description?: string;
  enterpriseType: EnterpriseType;
  address: Address;
  contact?: Contact;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  cancellationPolicy?: CancellationPolicy;
  status: EnterpriseStatus;
  isFeatured: boolean;
  logoUrl?: string;
  images?: string[];
  amenities?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  
  // Relacionamentos (opcionais, carregados sob demanda)
  properties?: Property[];
  propertiesCount?: number;
}

// ===================================================================
// PROPRIEDADE
// ===================================================================

export interface Property {
  id: number;
  enterpriseId: number;
  name: string;
  description?: string;
  propertyType: PropertyType;
  roomNumber?: string;
  floorNumber?: number;
  buildingName?: string;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  maxGuests: number;
  areaSqm?: number;
  amenities?: string[];
  basePricePerNight?: number;
  currency?: string;
  cleaningFee?: number;
  serviceFeePercentage?: number;
  minStayNights: number;
  maxStayNights?: number;
  status: PropertyStatus;
  isFeatured: boolean;
  isInstantBook: boolean;
  images?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  
  // Relacionamentos (opcionais, carregados sob demanda)
  enterprise?: Enterprise;
  accommodations?: Accommodation[];
  accommodationsCount?: number;
}

// ===================================================================
// ACOMODAÇÃO
// ===================================================================

export interface Accommodation {
  id: number;
  propertyId: number;
  name: string;
  description?: string;
  accommodationType: AccommodationType;
  roomNumber?: string;
  floorNumber?: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  bedType?: 'single' | 'double' | 'queen' | 'king' | 'bunk';
  maxGuests: number;
  areaSqm?: number;
  amenities?: string[];
  basePricePerNight?: number;
  currency?: string;
  cleaningFee?: number;
  minStayNights: number;
  maxStayNights?: number;
  status: AccommodationStatus;
  isFeatured: boolean;
  isInstantBook: boolean;
  images?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  
  // Relacionamentos (opcionais, carregados sob demanda)
  property?: Property;
  enterprise?: Enterprise;
  availability?: AccommodationAvailability[];
  pricingRules?: PricingRule[];
}

// ===================================================================
// DISPONIBILIDADE
// ===================================================================

export interface AccommodationAvailability {
  id: number;
  accommodationId: number;
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  priceOverride?: number;
  minStayOverride?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ===================================================================
// REGRA DE PREÇO
// ===================================================================

export type PricingRuleType = 
  | 'seasonal'
  | 'weekend'
  | 'holiday'
  | 'event'
  | 'last_minute'
  | 'early_bird'
  | 'custom';

export type PriceModifierType = 'fixed' | 'percentage' | 'multiplier';

export interface PricingRule {
  id: number;
  accommodationId?: number;
  propertyId?: number;
  enterpriseId?: number;
  ruleType: PricingRuleType;
  name: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysOfWeek?: number[]; // [1,2,3,4,5,6,7] onde 1=domingo
  minStayNights?: number;
  maxStayNights?: number;
  priceModifierType?: PriceModifierType;
  priceModifierValue?: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===================================================================
// BUSCA E FILTROS
// ===================================================================

export interface AccommodationSearchFilters {
  destination?: string;
  city?: string;
  state?: string;
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  guests?: number;
  enterpriseType?: EnterpriseType[];
  propertyType?: PropertyType[];
  accommodationType?: AccommodationType[];
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  minBedrooms?: number;
  minBathrooms?: number;
  cancellationPolicy?: CancellationPolicy[];
  instantBook?: boolean;
  featured?: boolean;
}

export interface AccommodationSearchResult {
  accommodation: Accommodation;
  property: Property;
  enterprise: Enterprise;
  finalPrice: number;
  isAvailable: boolean;
  availableDates: string[];
}

// ===================================================================
// CÁLCULO DE PREÇO
// ===================================================================

export interface PriceCalculation {
  basePrice: number;
  priceModifiers: {
    rule: PricingRule;
    modifier: number;
    description: string;
  }[];
  finalPrice: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  currency: string;
  breakdown: {
    nights: number;
    pricePerNight: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
  };
}

// ===================================================================
// RESERVA (Atualizada)
// ===================================================================

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  destination: string;
  checkIn: Date;
  checkOut: Date;
  value: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  guests: number;
  notes?: string;
  
  // Novos campos para multi-acomodações
  enterpriseId?: number;
  propertyId?: number;
  accommodationId?: number;
  
  // Relacionamentos (opcionais)
  enterprise?: Enterprise;
  property?: Property;
  accommodation?: Accommodation;
}
