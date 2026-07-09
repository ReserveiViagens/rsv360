'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CALDAS_NOVAS_CENTER, getCoordinatesByHotelName } from '@/lib/caldas-novas-coordinates';
import { formatBRL } from './wizard-pricing';
import type { AvailabilityItem } from './wizard-types';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ points }: { points: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

type Props = {
  hotels: AvailabilityItem[];
  onSelect: (hotel: AvailabilityItem) => void;
  highlightId?: number | string | null;
};

export function WizardHotelMap({ hotels, onSelect, highlightId }: Props) {
  const pins = useMemo(() => {
    return hotels.map((h) => {
      const key = String(h.contentId || h.id);
      const coords = getCoordinatesByHotelName(key) || getCoordinatesByHotelName(h.title);
      return { hotel: h, ...coords };
    });
  }, [hotels]);

  const center = pins[0]
    ? { lat: pins[0].lat, lng: pins[0].lng }
    : CALDAS_NOVAS_CENTER;

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-xl border border-gray-200">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={pins} />
        {pins.map(({ hotel, lat, lng }) => {
          const selected =
            highlightId === hotel.id || highlightId === hotel.contentId;
          return (
            <Marker
              key={String(hotel.id)}
              position={[lat, lng]}
              icon={markerIcon}
              opacity={selected ? 1 : 0.85}
              eventHandlers={{
                click: () => onSelect(hotel),
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{hotel.title}</p>
                  <p>A partir de {formatBRL(hotel.price)}/noite</p>
                  <button
                    type="button"
                    className="mt-1 rounded bg-cyan-600 px-2 py-1 text-xs font-medium text-white"
                    onClick={() => onSelect(hotel)}
                  >
                    Cotar
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
