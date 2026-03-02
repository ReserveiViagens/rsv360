'use client';

export type MapProvider = 'google' | 'openstreetmap';

/**
 * Provedor de mapas: sempre OpenStreetMap (gratuito, sem API key).
 * Para usar Google Maps, altere o retorno para 'google' e configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 */
export function useMapProvider(): MapProvider {
  return 'openstreetmap';
}
