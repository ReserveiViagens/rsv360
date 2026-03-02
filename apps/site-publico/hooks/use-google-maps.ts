'use client';

import { useState, useEffect } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: string | null;
}

const BILLING_ERROR_MSG = 'Mapa indisponível. Ative o faturamento no Google Cloud e adicione este domínio nas restrições da API Key.';

let optionsSet = false;

export function useGoogleMaps(): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as { gm_authFailure?: () => void }).gm_authFailure = () => {
      setLoadError(BILLING_ERROR_MSG);
    };

    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'DEMO_KEY';

    if (!optionsSet) {
      setOptions({
        key: apiKey,
        v: 'weekly',
        libraries: ['places'],
      });
      optionsSet = true;
    }

    Promise.all([
      importLibrary('maps'),
      importLibrary('places'),
    ])
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        setLoadError(err?.message || 'Erro ao carregar Google Maps API');
      });

    return () => {
      delete (window as { gm_authFailure?: () => void }).gm_authFailure;
    };
  }, []);

  return { isLoaded, loadError };
}
