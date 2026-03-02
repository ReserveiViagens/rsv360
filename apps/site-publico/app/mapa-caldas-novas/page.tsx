'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { getCaldasNovasOSMData } from '@/lib/caldas-novas-osm';

const MapaCaldasNovasLeaflet = dynamic(
  () => import('@/components/map/MapaCaldasNovasLeaflet').then((mod) => mod.MapaCaldasNovasLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="h-[70vh] w-full rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
        <span className="text-gray-600">Carregando mapa...</span>
      </div>
    ),
  }
);

export default function MapaCaldasNovasPage() {
  const items = useMemo(() => getCaldasNovasOSMData(), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
          Mapa Caldas Novas + Rio Quente - RSV360
        </h1>
        <p className="text-center text-gray-600 mb-8">
          45 hotéis em Caldas Novas + 15 atrações em Rio Quente • Preços atualizados do site
        </p>
        <MapaCaldasNovasLeaflet items={items} />
        <p className="text-center text-sm text-gray-500 mt-4">
          Dados OpenStreetMap • Preços atualizados do site •{' '}
          <a href="/api/caldas-novas-osm" download="caldas-novas-osm.csv" className="text-blue-600 hover:underline">
            Baixar CSV para iD Editor
          </a>
        </p>
      </div>
    </div>
  );
}
