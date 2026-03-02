/**
 * Tipos unificados para Leilões e Hotéis
 */

import { Hotel } from '@/hooks/useWebsiteData';
import { Auction, Bid } from '@/hooks/useAuctions';

export interface AuctionWithHotel extends Auction {
  hotel?: Hotel;
  hotel_images?: string[];
  hotel_stars?: number;
  hotel_rating?: number;
  hotel_reviews?: number;
  hotel_amenities?: string[];
  hotel_location?: string;
}

export interface ExtendedAuction extends Auction {
  // Dados adicionais do hotel
  images?: string[];
  stars?: number;
  rating?: number;
  reviewCount?: number;
  amenities?: string[];
  location?: string;
  propertyType?: 'hotel' | 'resort' | 'flat' | 'house';
  
  // Dados de leilão estendidos
  participants?: number;
  timeRemaining?: number;
  isActive?: boolean;
}

export interface AuctionFilters {
  status?: 'scheduled' | 'active' | 'finished' | 'cancelled';
  location?: string;
  propertyType?: ('hotel' | 'resort' | 'flat' | 'house')[];
  minPrice?: number;
  maxPrice?: number;
  dateRange?: {
    checkIn?: Date;
    checkOut?: Date;
  };
  amenities?: string[];
  stars?: number;
  search?: string;
  sortBy?: 'price' | 'date' | 'participants' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyType {
  id: 'hotel' | 'resort' | 'flat' | 'house';
  label: string;
  icon?: string;
}

export const PROPERTY_TYPES: PropertyType[] = [
  { id: 'hotel', label: 'Hotels' },
  { id: 'resort', label: 'Resorts' },
  { id: 'flat', label: 'Flats' },
  { id: 'house', label: 'Houses' },
];

export interface DateRange {
  checkIn: Date | null;
  checkOut: Date | null;
}

export interface PriceRange {
  min: number;
  max: number;
}
