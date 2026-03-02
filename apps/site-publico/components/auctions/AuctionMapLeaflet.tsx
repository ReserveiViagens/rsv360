'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrigir ícones do Leaflet no Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export interface AuctionMapMarkerItem {
  id: number;
  title: string;
  lat: number;
  lng: number;
  image?: string;
  price?: number;
  priceFormatted?: string;
  hotelId?: string;
  linkUrl: string;
  status: string;
  rating?: number;
  location?: string;
}

type PriceTagType = 'regular' | 'flash' | 'auction';

interface AuctionMapLeafletProps {
  items: AuctionMapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  onSelectAuction?: (id: number) => void;
  selectedId?: number | null;
  /** Quando true, usa etiquetas de preço (price-tag-bubble) em vez do ícone padrão */
  usePriceTagMarkers?: boolean;
  className?: string;
}

/**
 * Mapa de leilões usando Leaflet nativo (evita "render is not a function" do react-leaflet com Next.js).
 */
function getPriceTagClass(status: string): PriceTagType {
  const s = (status || '').toLowerCase();
  if (s.includes('flash') || s.includes('relâmpago')) return 'flash';
  if (s.includes('leilão') || s.includes('auction')) return 'auction';
  return 'regular';
}

export function AuctionMapLeaflet({
  items,
  center = [-17.7444, -48.6278],
  zoom = 12,
  onSelectAuction,
  selectedId,
  usePriceTagMarkers = false,
  className = '',
}: AuctionMapLeafletProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
    }

    const map = L.map(mapRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & RSV360',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
    };
  }, [center[0], center[1], zoom]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || items.length === 0) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds: L.LatLng[] = [];

    items.forEach((item) => {
      const icon = usePriceTagMarkers
        ? L.divIcon({
            html: `<span class="price-tag-marker"><span class="price-tag-bubble tag-${getPriceTagClass(item.status)}">${item.priceFormatted ?? (item.price != null ? `R$ ${item.price.toLocaleString('pt-BR')}` : 'Ver')}</span></span>`,
            className: 'price-tag-div-icon',
            iconSize: [80, 32],
            iconAnchor: [40, 32],
          })
        : DefaultIcon;
      const marker = L.marker([item.lat, item.lng], { icon });

      const priceText = item.priceFormatted ?? (item.price ? `R$ ${item.price.toLocaleString('pt-BR')}` : 'Ver preço');
      const popupContent = `
        <div class="auction-popup-card min-w-[260px] max-w-[320px]">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" class="w-full h-40 object-cover rounded-t-lg -mt-3 -mx-3 mb-3" onerror="this.style.display='none'" />` : ''}
          <h3 class="font-bold text-lg text-gray-900 mb-1">${item.title}</h3>
          ${item.location ? `<p class="text-sm text-gray-600 mb-2 flex items-center gap-1">📍 ${item.location}</p>` : ''}
          ${item.rating != null ? `<p class="text-sm text-amber-600 font-medium mb-2">⭐ ${item.rating.toFixed(1)}/5</p>` : ''}
          <div class="mb-4">
            <p class="text-xs text-gray-500">Preço por noite</p>
            <p class="text-xl font-bold text-green-600">${priceText}</p>
          </div>
          <a href="${item.linkUrl}" class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors" data-auction-id="${item.id}">
            Participar do Leilão
          </a>
        </div>
      `;

      const tooltipContent = `
        <div class="auction-tooltip overflow-hidden rounded-lg">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" class="w-full h-24 object-cover" onerror="this.style.display='none'" />` : ''}
          <div class="p-2">
            <p class="font-semibold text-gray-900 text-sm truncate">${item.title}</p>
            <p class="text-green-600 font-bold text-base">${priceText}</p>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -35],
        opacity: 1,
        sticky: true,
        className: 'auction-tooltip-leaflet',
      });

      marker.bindPopup(popupContent, { maxWidth: 320, minWidth: 280, className: 'auction-map-popup' });

      marker.on('click', () => onSelectAuction?.(item.id));

      marker.on('popupopen', () => {
        const link = map.getContainer().querySelector(`[data-auction-id="${item.id}"]`);
        if (link) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            onSelectAuction?.(item.id);
            window.location.href = item.linkUrl;
          });
        }
      });

      marker.addTo(map);
      markersRef.current.push(marker);
      bounds.push(L.latLng(item.lat, item.lng));
    });

    if (bounds.length > 1) {
      const b = L.latLngBounds(bounds);
      map.fitBounds(b, { padding: [30, 30], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView([items[0].lat, items[0].lng], 14);
    }
  }, [items, onSelectAuction]);

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <div
        ref={mapRef}
        style={{ height: 'min(70vh, 500px)', width: '100%', zIndex: 0 }}
        className="leaflet-container"
      />
    </div>
  );
}
