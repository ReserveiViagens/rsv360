'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { fetchRoteiroPontos, type RoteiroBounds, type RoteiroPonto } from '@/lib/roteiro-pontos';

const RoteiroMapaInner = dynamic(
  () => import('./RoteiroMapaInner').then((m) => ({ default: m.RoteiroMapaInner })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[22rem] w-full animate-pulse rounded-xl border border-white/10 bg-white/5"
        aria-hidden
      />
    ),
  },
);

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

interface RoteiroMapaProps {
  token: string;
  unlocked?: boolean;
}

export function RoteiroMapa({ token, unlocked = true }: RoteiroMapaProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [pontos, setPontos] = useState<RoteiroPonto[] | null>(null);
  const [bounds, setBounds] = useState<RoteiroBounds | null>(null);
  const [loaded, setLoaded] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !unlocked) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [unlocked]);

  useEffect(() => {
    if (!visible || !unlocked || loaded) return;

    let cancelled = false;

    (async () => {
      const result = await fetchRoteiroPontos(token);
      if (cancelled) return;

      if (result.ok && result.data.pontos.length > 0) {
        setPontos(result.data.pontos);
        setBounds(result.data.bounds);
      } else {
        setPontos([]);
      }
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, unlocked, loaded, token]);

  if (!unlocked) return null;
  if (loaded && (pontos == null || pontos.length === 0)) return null;

  return (
    <section
      ref={containerRef}
      id="mapa"
      className="border-t border-white/10 px-4 py-12 md:px-8"
    >
      <h2 className="mb-2 text-2xl font-bold tracking-tight">Mapa do roteiro</h2>
      <p className="mb-6 text-sm text-white/60">
        Pontos da sua estadia e experiências em Caldas Novas.
      </p>

      {visible && pontos && pontos.length > 0 ? (
        <RoteiroMapaInner pontos={pontos} bounds={bounds} reducedMotion={reducedMotion} />
      ) : (
        <div
          className="h-[22rem] w-full animate-pulse rounded-xl border border-white/10 bg-white/5"
          aria-hidden
        />
      )}
    </section>
  );
}
