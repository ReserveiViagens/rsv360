'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  images: string[];
  latitude?: number;
  longitude?: number;
}

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function PropertyMap({ properties, onPropertyClick, center, zoom = 13 }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Carregar Google Maps API
  useEffect(() => {
    if (!apiKey || mapLoaded) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Limpar script ao desmontar
    };
  }, [apiKey, mapLoaded]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstance) return;

    const defaultCenter = center || { lat: -17.7444, lng: -48.6278 }; // Caldas Novas, GO

    const map = new (window as any).google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    setMapInstance(map);
  }, [mapLoaded, center, zoom, mapInstance]);

  // Adicionar marcadores
  useEffect(() => {
    if (!mapInstance || !mapLoaded || properties.length === 0) return;

    // Limpar marcadores anteriores
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    // Criar marcadores para cada propriedade
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) {
        // Tentar geocodificar se não tiver coordenadas
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address: property.location }, (results: any[], status: string) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const marker = new (window as any).google.maps.Marker({
              position: location,
              map: mapInstance,
              title: property.name,
              icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              },
            });

            // Info window
            const infoWindow = new (window as any).google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="font-weight: bold; margin-bottom: 4px;">${property.name}</h3>
                  <p style="color: #666; font-size: 12px; margin-bottom: 4px;">${property.location}</p>
                  <p style="color: #2563eb; font-weight: bold;">R$ ${property.price.toFixed(2)}/noite</p>
                  <p style="color: #f59e0b; font-size: 12px;">⭐ ${property.rating.toFixed(1)}</p>
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstance, marker);
              if (onPropertyClick) {
                onPropertyClick(property);
              }
            });

            newMarkers.push(marker);
          }
        });
      } else {
        // Criar marcador com coordenadas existentes
        const marker = new (window as any).google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map: mapInstance,
          title: property.name,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          },
        });

        // Info window
        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${property.name}</h3>
              <p style="color: #666; font-size: 12px; margin-bottom: 4px;">${property.location}</p>
              <p style="color: #2563eb; font-weight: bold;">R$ ${property.price.toFixed(2)}/noite</p>
              <p style="color: #f59e0b; font-size: 12px;">⭐ ${property.rating.toFixed(1)}</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
          if (onPropertyClick) {
            onPropertyClick(property);
          }
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    // Ajustar bounds para mostrar todos os marcadores
    if (newMarkers.length > 0) {
      const bounds = new (window as any).google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      mapInstance.fitBounds(bounds);
    }
  }, [mapInstance, mapLoaded, properties, onPropertyClick]);

  if (!apiKey) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Google Maps API Key não configurada</p>
          <p className="text-sm mt-1">Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no .env.local</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
    </Card>
  );
}

