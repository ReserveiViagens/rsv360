'use client';

import { Clock, MapPin, Users } from 'lucide-react';

interface RoteiroOverviewProps {
  title: string;
  nights: number;
  guests: number;
  destination?: string;
}

export function RoteiroOverview({ title, nights, guests, destination = 'Caldas' }: RoteiroOverviewProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{title}</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-100 bg-white p-4 text-center shadow-sm">
          <Clock className="mx-auto mb-2 h-5 w-5 text-accent-lime" />
          <p className="text-xs font-medium text-gray-600">Duração</p>
          <p className="text-sm font-bold text-gray-900">
            {nights} noite{nights !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-4 text-center shadow-sm">
          <Users className="mx-auto mb-2 h-5 w-5 text-accent-lime" />
          <p className="text-xs font-medium text-gray-600">Hóspedes</p>
          <p className="text-sm font-bold text-gray-900">
            {guests} pessoa{guests !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-4 text-center shadow-sm">
          <MapPin className="mx-auto mb-2 h-5 w-5 text-accent-lime" />
          <p className="text-xs font-medium text-gray-600">Destino</p>
          <p className="text-sm font-bold text-gray-900">{destination}</p>
        </div>
      </div>
    </div>
  );
}
