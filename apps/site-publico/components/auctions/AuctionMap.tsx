'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { useMapProvider } from '@/hooks/use-map-provider';

/** Detecta se o erro é de faturamento/billing ou configuração do Google Maps */
function isGoogleMapsConfigError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /billing|BillingNotEnabled|quota|faturamento|propriet[aá]rio|n[aã]o carregou|Esta p[aá]gina|For development purposes only|You are the owner/i.test(msg);
}

/** Calcula bbox para incluir todos os marcadores */
function computeBbox(auctions: AuctionMapItem[], center: { lat: number; lng: number }): string {
  const pad = 0.05;
  if (auctions.length === 0) {
    return `${center.lng - pad},${center.lat - pad},${center.lng + pad},${center.lat + pad}`;
  }
  let minLat = auctions[0].lat;
  let maxLat = auctions[0].lat;
  let minLng = auctions[0].lng;
  let maxLng = auctions[0].lng;
  for (const a of auctions) {
    minLat = Math.min(minLat, a.lat);
    maxLat = Math.max(maxLat, a.lat);
    minLng = Math.min(minLng, a.lng);
    maxLng = Math.max(maxLng, a.lng);
  }
  const margin = 0.02;
  return `${minLng - margin},${minLat - margin},${maxLng + margin},${maxLat + margin}`;
}

/** Renderiza mapa OpenStreetMap (gratuito, sem API key) */
function OpenStreetMapFallback({
  auctions,
  center,
  className = '',
}: {
  auctions: AuctionMapItem[];
  center: { lat: number; lng: number };
  className?: string;
}) {
  const bbox = computeBbox(auctions, center);
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat},${center.lng}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}&z=12`;

  return (
    <div className={`flex flex-col rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <div className="relative w-full min-h-[400px]">
        <iframe
          title="Mapa - OpenStreetMap"
          src={osmUrl}
          className="w-full h-96 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 rounded-lg p-3 shadow-md text-sm">
          <p className="font-medium text-gray-800 mb-1">OpenStreetMap (gratuito)</p>
          {auctions.length > 0 ? (
            <>
              <p className="text-gray-600 text-xs mb-2">
                {auctions.length} leilão(ões) na região. Clique nos links para ver detalhes.
              </p>
              <div className="flex gap-2 flex-wrap">
                {auctions.slice(0, 5).map((a) => (
                  <a key={a.id} href={`/leiloes/${a.id}`} className="text-blue-600 hover:underline font-medium">
                    {a.title} →
                  </a>
                ))}
                {auctions.length > 5 && <span className="text-gray-500">+{auctions.length - 5} mais</span>}
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline ml-auto">
                  Abrir no Google Maps
                </a>
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-xs">Nenhum leilão com localização.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export interface AuctionMapItem {
  id: number;
  title: string;
  lat: number;
  lng: number;
  status: string;
}

interface AuctionMapProps {
  auctions: AuctionMapItem[];
  onSelectAuction?: (id: number) => void;
  selectedId?: number;
  className?: string;
}

const CALDAS_NOVAS = { lat: -17.7444, lng: -48.6278 };
const DEFAULT_ZOOM = 12;

export function AuctionMap({ auctions, onSelectAuction, selectedId, className = '' }: AuctionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const infoWindowRef = useRef<unknown>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapProvider = useMapProvider();
  const { isLoaded: mapReady, loadError } = useGoogleMaps();

  // Se OpenStreetMap está configurado, usar diretamente
  if (mapProvider === 'openstreetmap') {
    const center =
      auctions.length > 0
        ? { lat: auctions[0].lat, lng: auctions[0].lng }
        : CALDAS_NOVAS;
    return (
      <OpenStreetMapFallback auctions={auctions} center={center} className={className} />
    );
  }

  useEffect(() => {
    if (!mapReady || !mapRef.current || typeof window === 'undefined') return;
    setMapError(null);
    
    const w = window as { google?: { maps: { Map: new (el: HTMLElement, o: object) => { setCenter: (c: object) => void; setZoom: (z: number) => void; fitBounds: (b: unknown, p?: number) => void }; InfoWindow: new (o: object) => { setContent: (c: string) => void; open: (m: unknown, marker: unknown) => void } } } };
    if (!w.google?.maps) return;
    
    const g = w.google.maps;
    if (mapInstanceRef.current) return;
    
    try {
      const map = new g.Map(mapRef.current!, {
        center: CALDAS_NOVAS,
        zoom: DEFAULT_ZOOM,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      mapInstanceRef.current = map;
      infoWindowRef.current = new g.InfoWindow({});
    
    return () => {
      (markersRef.current as { setMap: (n: null) => void }[]).forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
      infoWindowRef.current = null;
    };
    } catch (err) {
      setMapError(isGoogleMapsConfigError(err)
        ? 'Configure a API Key do Google Maps: ative faturamento e adicione este domínio nas restrições.'
        : err instanceof Error ? err.message : 'Erro ao criar mapa');
    }
  }, [mapReady]);

  useEffect(() => {
    const map = mapInstanceRef.current as { setCenter: (c: object) => void; setZoom: (z: number) => void; fitBounds: (b: unknown, p?: number) => void } | null;
    const iw = infoWindowRef.current as { setContent: (c: string) => void; open: (m: unknown, marker: unknown) => void } | null;
    if (!map || !iw || typeof window === 'undefined' || !(window as { google?: { maps: unknown } }).google || !mapReady) return;
    const g = (window as { google: { maps: { Marker: new (o: object) => { setMap: (n: null) => void; addListener: (n: string, f: () => void) => void; setIcon: (icon: object) => void }; LatLngBounds: new () => { extend: (p: object) => void }; SymbolPath: { CIRCLE: unknown }; Point: new (x: number, y: number) => unknown } } }).google.maps;
    (markersRef.current as { setMap: (n: null) => void }[]).forEach((m) => m.setMap(null));
    markersRef.current = [];
    const bounds = new g.LatLngBounds();
    
    auctions.forEach((a) => {
      // Cor do marcador baseado no status
      const markerColor = a.status === 'active' ? '#10b981' : a.status === 'scheduled' ? '#3b82f6' : '#6b7280';
      
      // Criar ícone customizado com círculo colorido
      const markerIcon = {
        path: g.SymbolPath.CIRCLE,
        fillColor: markerColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8,
        anchor: new g.Point(0, 0),
      };
      
      const marker = new g.Marker({
        position: { lat: a.lat, lng: a.lng },
        map,
        title: a.title,
        icon: markerIcon,
      });
      
      marker.addListener('click', () => {
        iw.setContent(
          `<div style="padding:8px;max-width:220px;">
            <strong>${a.title}</strong><br/>
            <span style="color:${markerColor};font-weight:bold;">${a.status === 'active' ? '🟢 Ativo' : a.status === 'scheduled' ? '🔵 Agendado' : '⚪ Finalizado'}</span><br/>
            <a href="/leiloes/${a.id}" style="color:#2563eb;text-decoration:none;">Ver leilão →</a>
          </div>`
        );
        iw.open(map, marker);
        onSelectAuction?.(a.id);
      });
      markersRef.current.push(marker);
      bounds.extend({ lat: a.lat, lng: a.lng });
    });
    
    if (auctions.length > 0) {
      if (auctions.length === 1) {
        map.setCenter({ lat: auctions[0].lat, lng: auctions[0].lng });
        map.setZoom(14);
      } else {
        map.fitBounds(bounds, 40);
      }
    }
  }, [mapReady, auctions, onSelectAuction]);

  // Sem API Key do Google: usar OpenStreetMap (gratuito)
  if (!apiKey) {
    const center =
      auctions.length > 0
        ? { lat: auctions[0].lat, lng: auctions[0].lng }
        : CALDAS_NOVAS;
    return (
      <OpenStreetMapFallback auctions={auctions} center={center} className={className} />
    );
  }

  const displayError = mapError || loadError;
  if (displayError) {
    const showFallbackMap = isGoogleMapsConfigError(displayError);
    const center = auctions.length > 0 
      ? { lat: auctions[0].lat, lng: auctions[0].lng }
      : CALDAS_NOVAS;
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.05}%2C${center.lat - 0.05}%2C${center.lng + 0.05}%2C${center.lat + 0.05}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
    const googleMapsUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}&z=12`;

    return (
      <div className={`flex flex-col rounded-lg overflow-hidden border border-amber-200 ${className}`}>
        {/* Fallback: Mapa OpenStreetMap (gratuito, sem API key) */}
        {showFallbackMap && (
          <div className="relative w-full min-h-[400px]">
            <iframe
              title="Mapa de Caldas Novas - OpenStreetMap"
              src={osmUrl}
              className="w-full h-96 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-white/95 rounded-lg p-3 shadow-md text-sm">
              <p className="font-medium text-amber-800 mb-1">Google Maps indisponível – usando OpenStreetMap</p>
              <p className="text-amber-700 text-xs mb-2">Para usar o Google Maps: ative o faturamento no Google Cloud e adicione este domínio nas restrições da API Key.</p>
              <div className="flex gap-2 flex-wrap">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                  Abrir no Google Maps →
                </a>
                <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
                  Configurar API Key
                </a>
              </div>
            </div>
          </div>
        )}
        {!showFallbackMap && (
          <div className="flex flex-col items-center justify-center bg-red-50 border border-red-200 text-red-800 p-6 min-h-[300px]">
            <svg className="w-12 h-12 mb-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold mb-1">Erro ao carregar mapa</p>
            <p className="text-sm text-center">{displayError}</p>
          </div>
        )}
      </div>
    );
  }

  if (!mapReady) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-lg bg-gray-100 text-gray-600 p-6 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-sm">Carregando mapa…</p>
      </div>
    );
  }

  return <div ref={mapRef} className={`min-h-[400px] w-full rounded-lg ${className}`} />;
}
