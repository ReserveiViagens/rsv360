'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { CaldasNovasOSMItem } from '@/lib/caldas-novas-osm';
import Link from 'next/link';

// Corrigir ícones do Leaflet no Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapaCaldasNovasLeafletProps {
  items: CaldasNovasOSMItem[];
}

export function MapaCaldasNovasLeaflet({ items }: MapaCaldasNovasLeafletProps) {
  return (
    <MapContainer
      center={[-17.61, -48.62]}
      zoom={11}
      style={{ height: '70vh', width: '100%' }}
      className="rounded-lg shadow-xl z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & RSV360'
      />
      {items.map((item) => (
        <Marker key={item.id} position={[item.lat, item.lng]}>
          <Popup>
            <div className="osm-popup p-4 max-w-sm">
              {item.image && (
                <img
                  src={item.image.startsWith('/') ? item.image : item.image}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-bold text-lg">{item.name}</h3>
              <div className="text-green-600 font-bold text-xl mb-2">{item.price}</div>
              {item.rsv360Verified && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✅ RSV360 Verified
                  </span>
                  {item.brand && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs">
                      {item.brand}
                    </span>
                  )}
                </div>
              )}
              <div className="space-y-1 text-sm mb-4">
                {item.phone && (
                  <a href={`tel:${item.phone}`} className="block hover:text-blue-600">
                    📞 {item.phone}
                  </a>
                )}
                {item.whatsapp && (
                  <a
                    href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}?text=Olá%20RSV360`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-green-600 font-semibold hover:text-green-700"
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
              <Link
                href={item.slug ? `/hoteis/${item.slug}` : `/hoteis?q=${encodeURIComponent(item.name)}`}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-bold text-center block hover:shadow-lg transition-all"
              >
                🏨 Reservar Agora
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
