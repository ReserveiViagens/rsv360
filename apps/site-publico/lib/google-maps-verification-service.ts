/**
 * Serviço de Validação de Endereço com Google Maps API
 * Valida e normaliza endereços usando Google Maps Geocoding API
 */

import { queryDatabase } from './db';

export interface AddressValidation {
  isValid: boolean;
  normalizedAddress: string;
  components: {
    street?: string;
    streetNumber?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  confidence: number; // 0-1
  placeId?: string;
  formattedAddress: string;
  issues: AddressIssue[];
}

export interface AddressIssue {
  type: 'invalid' | 'incomplete' | 'ambiguous' | 'not_found';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

/**
 * Validar endereço usando Google Maps API
 */
export async function validateAddressWithGoogleMaps(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string
): Promise<AddressValidation> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Maps API key não configurada');
    return createFallbackValidation(address, city, state, zipCode);
  }

  try {
    // Construir query de endereço
    const addressQuery = [address, city, state, zipCode]
      .filter(Boolean)
      .join(', ');

    // Chamar Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}&key=${apiKey}&language=pt-BR&region=br`
    );

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      return {
        isValid: false,
        normalizedAddress: addressQuery,
        components: {
          city: city || '',
          state: state || '',
          country: 'BR',
        },
        coordinates: { latitude: 0, longitude: 0 },
        confidence: 0,
        formattedAddress: addressQuery,
        issues: [{
          type: 'not_found',
          severity: 'high',
          message: 'Endereço não encontrado',
          suggestion: 'Verifique se o endereço está correto e completo',
        }],
      };
    }

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return createFallbackValidation(address, city, state, zipCode);
    }

    // Pegar o primeiro resultado (mais relevante)
    const result = data.results[0];
    const location = result.geometry.location;

    // Extrair componentes do endereço
    const components = extractAddressComponents(result.address_components);

    // Calcular confiança baseado no tipo de localização
    const confidence = calculateConfidence(result.geometry.location_type);

    // Verificar issues
    const issues = checkAddressIssues(result, components);

    // Normalizar endereço
    const normalizedAddress = result.formatted_address;

    // Salvar no cache
    await cacheAddressValidation(addressQuery, {
      isValid: true,
      normalizedAddress,
      components,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng,
      },
      confidence,
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      issues,
    });

    return {
      isValid: issues.length === 0 || issues.every(i => i.severity === 'low'),
      normalizedAddress,
      components,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng,
      },
      confidence,
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      issues,
    };
  } catch (error: any) {
    console.error('Erro ao validar endereço com Google Maps:', error);
    return createFallbackValidation(address, city, state, zipCode);
  }
}

/**
 * Validar e atualizar coordenadas de uma propriedade
 */
export async function validatePropertyAddress(propertyId: number): Promise<AddressValidation> {
  // Buscar propriedade
  const property = await queryDatabase(
    `SELECT * FROM properties WHERE id = $1`,
    [propertyId]
  );

  if (property.length === 0) {
    throw new Error('Propriedade não encontrada');
  }

  const prop = property[0];

  // Validar endereço
  const validation = await validateAddressWithGoogleMaps(
    prop.address || '',
    prop.city || '',
    prop.state || '',
    prop.zip_code || ''
  );

  // Se válido e coordenadas diferentes, atualizar
  if (validation.isValid && validation.coordinates.latitude && validation.coordinates.longitude) {
    const currentLat = parseFloat(prop.latitude || '0');
    const currentLng = parseFloat(prop.longitude || '0');
    const newLat = validation.coordinates.latitude;
    const newLng = validation.coordinates.longitude;

    // Se coordenadas mudaram significativamente (> 100m), atualizar
    const distance = calculateDistance(currentLat, currentLng, newLat, newLng);
    if (distance > 0.1) {
      await queryDatabase(
        `UPDATE properties 
         SET latitude = $1, longitude = $2, address = $3, place_id = $4
         WHERE id = $5`,
        [
          newLat.toString(),
          newLng.toString(),
          validation.normalizedAddress,
          validation.placeId || null,
          propertyId,
        ]
      );
    }
  }

  return validation;
}

/**
 * Extrair componentes do endereço
 */
function extractAddressComponents(addressComponents: any[]): AddressValidation['components'] {
  const components: AddressValidation['components'] = {
    city: '',
    state: '',
    country: 'BR',
  };

  for (const component of addressComponents) {
    const types = component.types;

    if (types.includes('street_number')) {
      components.streetNumber = component.long_name;
    } else if (types.includes('route')) {
      components.street = component.long_name;
    } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
      components.neighborhood = component.long_name;
    } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
      components.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      components.state = component.short_name;
    } else if (types.includes('postal_code')) {
      components.zipCode = component.long_name;
    } else if (types.includes('country')) {
      components.country = component.short_name;
    }
  }

  return components;
}

/**
 * Calcular confiança baseado no tipo de localização
 */
function calculateConfidence(locationType: string): number {
  const confidenceMap: Record<string, number> = {
    'ROOFTOP': 0.95,
    'RANGE_INTERPOLATED': 0.85,
    'GEOMETRIC_CENTER': 0.70,
    'APPROXIMATE': 0.50,
  };

  return confidenceMap[locationType] || 0.50;
}

/**
 * Verificar issues no endereço
 */
function checkAddressIssues(result: any, components: AddressValidation['components']): AddressIssue[] {
  const issues: AddressIssue[] = [];

  // Verificar se endereço está completo
  if (!components.street) {
    issues.push({
      type: 'incomplete',
      severity: 'high',
      message: 'Nome da rua não encontrado',
      suggestion: 'Forneça o nome completo da rua',
    });
  }

  if (!components.streetNumber) {
    issues.push({
      type: 'incomplete',
      severity: 'medium',
      message: 'Número do endereço não encontrado',
      suggestion: 'Inclua o número do endereço para maior precisão',
    });
  }

  if (!components.zipCode) {
    issues.push({
      type: 'incomplete',
      severity: 'low',
      message: 'CEP não encontrado',
      suggestion: 'Inclua o CEP para melhor localização',
    });
  }

  // Verificar precisão da localização
  if (result.geometry.location_type === 'APPROXIMATE') {
    issues.push({
      type: 'ambiguous',
      severity: 'medium',
      message: 'Localização aproximada',
      suggestion: 'Forneça um endereço mais específico para melhor precisão',
    });
  }

  return issues;
}

/**
 * Criar validação fallback (sem API)
 */
function createFallbackValidation(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string
): AddressValidation {
  return {
    isValid: !!(address && city && state),
    normalizedAddress: [address, city, state, zipCode].filter(Boolean).join(', '),
    components: {
      city: city || '',
      state: state || '',
      country: 'BR',
    },
    coordinates: { latitude: 0, longitude: 0 },
    confidence: 0.3,
    formattedAddress: [address, city, state, zipCode].filter(Boolean).join(', '),
    issues: !address || !city || !state
      ? [{
          type: 'incomplete',
          severity: 'high',
          message: 'Endereço incompleto',
          suggestion: 'Forneça endereço, cidade e estado',
        }]
      : [],
  };
}

/**
 * Calcular distância entre duas coordenadas (em km)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Cache de validação de endereço
 */
async function cacheAddressValidation(
  address: string,
  validation: AddressValidation
): Promise<void> {
  try {
    await queryDatabase(
      `INSERT INTO address_validations 
       (address, normalized_address, components, coordinates, confidence, place_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (address)
       DO UPDATE SET
         normalized_address = $2,
         components = $3,
         coordinates = $4,
         confidence = $5,
         place_id = $6,
         updated_at = CURRENT_TIMESTAMP`,
      [
        address,
        validation.normalizedAddress,
        JSON.stringify(validation.components),
        JSON.stringify(validation.coordinates),
        validation.confidence,
        validation.placeId || null,
      ]
    );
  } catch (error) {
    // Ignorar erros de cache (tabela pode não existir)
    console.warn('Erro ao cachear validação de endereço:', error);
  }
}

/**
 * Obter validação em cache
 */
export async function getCachedAddressValidation(
  address: string
): Promise<AddressValidation | null> {
  try {
    const result = await queryDatabase(
      `SELECT * FROM address_validations 
       WHERE address = $1 
       AND updated_at > CURRENT_TIMESTAMP - INTERVAL '30 days'`,
      [address]
    );

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      isValid: true,
      normalizedAddress: row.normalized_address,
      components: JSON.parse(row.components),
      coordinates: JSON.parse(row.coordinates),
      confidence: parseFloat(row.confidence),
      placeId: row.place_id,
      formattedAddress: row.normalized_address,
      issues: [],
    };
  } catch (error) {
    return null;
  }
}

