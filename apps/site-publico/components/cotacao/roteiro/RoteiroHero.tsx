'use client';

import Image from 'next/image';
import { Clock, MapPin, Users } from 'lucide-react';

interface RoteiroHeroProps {
  title: string;
  heroImage?: string;
  nights: number;
  guests: number;
  destination?: string;
}

export function RoteiroHero({ title, heroImage, nights, guests, destination = 'Caldas Novas' }: RoteiroHeroProps) {
  const img =
    heroImage ??
    'https://images.unsplash.com/photo-1571508601633-63bfea190214?w=1200&h=500&fit=crop';

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl">
      <div className="relative h-56 md:h-72">
        <Image src={img} alt={title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-white/90">Seu roteiro personalizado Reservei</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 bg-white p-4 shadow-sm border border-gray-100 rounded-b-2xl">
        <div className="text-center">
          <Clock className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-xs text-gray-600">Duração</p>
          <p className="text-sm font-bold">{nights} noite{nights !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-center">
          <Users className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-xs text-gray-600">Hóspedes</p>
          <p className="text-sm font-bold">{guests}</p>
        </div>
        <div className="text-center">
          <MapPin className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-xs text-gray-600">Destino</p>
          <p className="text-sm font-bold">{destination}</p>
        </div>
      </div>
    </div>
  );
}
