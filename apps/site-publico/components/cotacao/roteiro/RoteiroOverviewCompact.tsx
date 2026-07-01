'use client';

import { Clock, MapPin, Users } from 'lucide-react';

interface RoteiroOverviewCompactProps {
  title: string;
  nights: number;
  guests: number;
  destination?: string;
}

export function RoteiroOverviewCompact({
  title,
  nights,
  guests,
  destination = 'Caldas',
}: RoteiroOverviewCompactProps) {
  return (
    <div className="px-2 py-3" data-testid="roteiro-overview-compact">
      <p className="mb-2 truncate text-sm font-semibold text-gray-900">{title}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700 sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 shrink-0 text-accent-lime" aria-hidden />
          {nights} noite{nights !== 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4 shrink-0 text-accent-lime" aria-hidden />
          {guests} pessoa{guests !== 1 ? 's' : ''}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-accent-lime" aria-hidden />
          <span className="truncate">{destination}</span>
        </span>
      </div>
    </div>
  );
}
