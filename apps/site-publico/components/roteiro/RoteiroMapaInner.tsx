'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { MapContainer, TileLayer, Marker, Popup } from '@/components/map/leaflet-ui';
import type { RoteiroBounds, RoteiroPonto } from '@/lib/roteiro-pontos';

const TIPO_CORES: Record<string, string> = {
  hospedagem: '#f59e0b',
  parque: '#22d3ee',
  restaurante: '#fb923c',
  atracao: '#c084fc',
  ponto_dia: '#34d399',
};

function criarIconePorTipo(tipo: string): L.DivIcon {
  const cor = TIPO_CORES[tipo] ?? '#e5e7eb';
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${cor};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
  });
}

function FitBounds({
  bounds,
  animate,
}: {
  bounds: RoteiroBounds;
  animate: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const leafletBounds = L.latLngBounds(
      [bounds.minLat, bounds.minLng],
      [bounds.maxLat, bounds.maxLng],
    );
    map.fitBounds(leafletBounds, { animate, padding: [48, 48] });
  }, [map, bounds, animate]);

  return null;
}

interface RoteiroMapaInnerProps {
  pontos: RoteiroPonto[];
  bounds: RoteiroBounds | null;
  reducedMotion: boolean;
}

export function RoteiroMapaInner({ pontos, bounds, reducedMotion }: RoteiroMapaInnerProps) {
  const center: [number, number] =
    bounds != null
      ? [(bounds.minLat + bounds.maxLat) / 2, (bounds.minLng + bounds.maxLng) / 2]
      : [pontos[0]?.lat ?? -17.744, pontos[0]?.lng ?? -48.624];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '22rem', width: '100%' }}
      className="z-0 rounded-xl border border-white/10"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {bounds ? <FitBounds bounds={bounds} animate={!reducedMotion} /> : null}
      {pontos.map((ponto) => (
        <Marker
          key={ponto.id}
          position={[ponto.lat, ponto.lng]}
          icon={criarIconePorTipo(ponto.tipo)}
        >
          <Popup>
            <div className="max-w-xs space-y-1 p-1">
              <p className="font-semibold text-zinc-900">{ponto.titulo}</p>
              {ponto.descricao ? (
                <p className="text-sm text-zinc-600">{ponto.descricao}</p>
              ) : null}
              {ponto.dia != null ? (
                <p className="text-xs text-zinc-500">Dia {ponto.dia}</p>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
