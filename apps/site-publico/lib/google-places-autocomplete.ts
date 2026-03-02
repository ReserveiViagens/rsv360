/**
 * Autocomplete de endereço usando Google Places API
 * Requer chave de API do Google Maps configurada
 */

export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  formatted_address: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Buscar sugestões de endereço usando Google Places Autocomplete
 */
export async function searchPlaces(
  input: string,
  apiKey?: string
): Promise<PlacePrediction[]> {
  if (!input || input.length < 3) {
    return [];
  }

  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!key) {
    console.warn('Google Maps API Key não configurada');
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${key}&components=country:br&language=pt-BR`
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar endereços');
    }

    const data = await response.json();

    if (data.status === 'OK' && data.predictions) {
      return data.predictions;
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar lugares:', error);
    return [];
  }
}

/**
 * Obter detalhes completos de um lugar pelo place_id
 */
export async function getPlaceDetails(
  placeId: string,
  apiKey?: string
): Promise<PlaceDetails | null> {
  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!key) {
    console.warn('Google Maps API Key não configurada');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${key}&fields=formatted_address,address_components,geometry&language=pt-BR`
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar detalhes do endereço');
    }

    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return data.result;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar detalhes do lugar:', error);
    return null;
  }
}

/**
 * Converter PlaceDetails para formato Address
 */
export function placeDetailsToAddress(details: PlaceDetails): {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
} {
  const components = details.address_components;
  
  let street = '';
  let number = '';
  let neighborhood = '';
  let city = '';
  let state = '';
  let zipCode = '';

  components.forEach((component) => {
    const types = component.types;
    
    if (types.includes('street_number')) {
      number = component.long_name;
    } else if (types.includes('route')) {
      street = component.long_name;
    } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
      neighborhood = component.long_name;
    } else if (types.includes('administrative_area_level_2')) {
      city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = component.short_name;
    } else if (types.includes('postal_code')) {
      zipCode = component.long_name;
    }
  });

  return {
    street: street || '',
    number: number || '',
    neighborhood: neighborhood || '',
    city: city || '',
    state: state || '',
    zipCode: zipCode || '',
  };
}

