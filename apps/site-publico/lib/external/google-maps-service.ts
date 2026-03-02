/**
 * ✅ FASE 3.3-3.4 - FASE 5.2: Google Maps Service
 * 
 * @description Serviço para geocodificação e verificação de endereços
 * - Geocodificação de endereços
 * - Verificação de coordenadas
 * - Cálculo de distância
 * - Validação de endereços
 * 
 * @module external
 * @author RSV 360 Team
 * @created 2025-12-13
 */

import { redisCache } from '../redis-cache';

// ================================
// TYPES
// ================================

interface GeocodeResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  placeId?: string;
  types?: string[];
  accuracy?: 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE';
}

interface AddressVerificationResult {
  isValid: boolean;
  confidence: number; // 0-100
  matchedAddress?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distance?: number; // metros
  issues?: string[];
}

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 86400 * 7; // 7 dias
const CACHE_PREFIX = 'google-maps:';
const GOOGLE_MAPS_API_BASE = 'https://maps.googleapis.com/maps/api';

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Geocodificar endereço para coordenadas
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}geocode:${Buffer.from(address).toString('base64')}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY não configurada');
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `${GOOGLE_MAPS_API_BASE}/geocode/json?address=${encodedAddress}&key=${apiKey}&region=br`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Maps API retornou erro: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;

    const geocodeResult: GeocodeResult = {
      address,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      types: result.types,
      accuracy: result.geometry.location_type,
    };

    // Salvar em cache
    await redisCache.set(cacheKey, JSON.stringify(geocodeResult), CACHE_TTL);

    return geocodeResult;
  } catch (error: any) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
}

/**
 * Verificar se endereço é válido e corresponde às coordenadas
 */
export async function verifyAddress(
  address: string,
  expectedCoordinates?: { lat: number; lng: number }
): Promise<AddressVerificationResult> {
  try {
    const geocodeResult = await geocodeAddress(address);

    if (!geocodeResult) {
      return {
        isValid: false,
        confidence: 0,
        issues: ['Endereço não encontrado no Google Maps'],
      };
    }

    let confidence = 100;
    const issues: string[] = [];

    // Verificar precisão
    if (geocodeResult.accuracy === 'APPROXIMATE') {
      confidence -= 20;
      issues.push('Precisão aproximada');
    } else if (geocodeResult.accuracy === 'GEOMETRIC_CENTER') {
      confidence -= 10;
      issues.push('Coordenadas no centro geométrico');
    }

    // Verificar tipos
    if (!geocodeResult.types?.includes('street_address') && 
        !geocodeResult.types?.includes('premise') &&
        !geocodeResult.types?.includes('subpremise')) {
      confidence -= 15;
      issues.push('Tipo de endereço não específico');
    }

    // Verificar coordenadas esperadas
    let distance: number | undefined;
    if (expectedCoordinates) {
      distance = calculateDistance(
        geocodeResult.coordinates,
        expectedCoordinates
      );

      // Se distância > 100m, pode ser problema
      if (distance > 100) {
        confidence -= 30;
        issues.push(`Coordenadas não correspondem (${Math.round(distance)}m de diferença)`);
      } else if (distance > 50) {
        confidence -= 15;
        issues.push(`Coordenadas próximas mas não exatas (${Math.round(distance)}m)`);
      }
    }

    return {
      isValid: confidence >= 70,
      confidence: Math.max(0, Math.min(100, confidence)),
      matchedAddress: geocodeResult.formattedAddress,
      coordinates: geocodeResult.coordinates,
      distance,
      issues: issues.length > 0 ? issues : undefined,
    };
  } catch (error: any) {
    console.error('Erro ao verificar endereço:', error);
    return {
      isValid: false,
      confidence: 0,
      issues: [error.message || 'Erro ao verificar endereço'],
    };
  }
}

/**
 * Calcular distância entre duas coordenadas (Haversine)
 */
export function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em metros
}

/**
 * Reverse geocoding: coordenadas para endereço
 */
export async function reverseGeocode(
  coordinates: { lat: number; lng: number }
): Promise<string | null> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}reverse:${coordinates.lat},${coordinates.lng}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY não configurada');
      return null;
    }

    const url = `${GOOGLE_MAPS_API_BASE}/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${apiKey}&region=br`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Maps API retornou erro: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }

    const address = data.results[0].formatted_address;

    // Salvar em cache
    await redisCache.set(cacheKey, address, CACHE_TTL);

    return address;
  } catch (error: any) {
    console.error('Erro ao fazer reverse geocoding:', error);
    return null;
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default {
  geocodeAddress,
  verifyAddress,
  calculateDistance,
  reverseGeocode,
};

