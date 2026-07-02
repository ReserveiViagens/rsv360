'use client';

import { Waves, Droplets } from 'lucide-react';

export interface LazerAmenidades {
  piscinasTermais?: string[];
  ofuro?: string[];
  amenidades?: string[];
}

interface LazerShowcaseProps {
  lazer?: LazerAmenidades | null;
  /** Roteiro já exige accepted/paid no backend; flag extra para UI. */
  unlocked?: boolean;
}

export function LazerShowcase({ lazer, unlocked = true }: LazerShowcaseProps) {
  if (!unlocked || !lazer) return null;

  const piscinas = lazer.piscinasTermais?.filter(Boolean) ?? [];
  const ofuros = lazer.ofuro?.filter(Boolean) ?? [];
  const extras = lazer.amenidades?.filter(Boolean) ?? [];

  if (piscinas.length === 0 && ofuros.length === 0 && extras.length === 0) {
    return null;
  }

  return (
    <section id="lazer" className="border-t border-white/10 px-4 py-12 md:px-8">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Lazer e bem-estar</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {piscinas.map((item) => (
          <div
            key={`piscina-${item}`}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <Waves className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
            <p className="text-sm text-white/90">{item}</p>
          </div>
        ))}
        {ofuros.map((item) => (
          <div
            key={`ofuro-${item}`}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <Droplets className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm text-white/90">{item}</p>
          </div>
        ))}
        {extras.map((item) => (
          <div
            key={`amen-${item}`}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/90"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
