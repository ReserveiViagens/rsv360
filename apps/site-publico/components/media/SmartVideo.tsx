'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  buildVideoSourceOrder,
  deriveWebmFromMp4,
  shouldPreferPosterOnly,
} from '@/lib/media/smart-video';

export interface SmartVideoProps {
  srcMp4: string;
  srcWebm?: string;
  poster: string;
  loop?: boolean;
  background?: boolean;
  className?: string;
  controls?: boolean;
  /** Quando false, não tenta autoplay ao entrar no viewport (ex.: fundo hero). */
  playOnView?: boolean;
}

export function SmartVideo({
  srcMp4,
  srcWebm,
  poster,
  loop = false,
  background = false,
  className,
  controls = false,
  playOnView,
}: SmartVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterOnly, setPosterOnly] = useState(false);

  const webm = srcWebm ?? deriveWebmFromMp4(srcMp4);
  const shouldPlay = playOnView ?? !background;

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; downlink?: number } })
      .connection;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPosterOnly(shouldPreferPosterOnly(connection ?? null, reduced));
  }, []);

  useEffect(() => {
    if (posterOnly || failed) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '80px', threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [posterOnly, failed]);

  const tryPlay = useCallback(() => {
    const el = videoRef.current;
    if (!el || !shouldPlay) return;
    void el.play().catch(() => undefined);
  }, [shouldPlay]);

  useEffect(() => {
    if (inView && !posterOnly && !failed) tryPlay();
  }, [inView, posterOnly, failed, tryPlay]);

  if (posterOnly || failed) {
    return (
      <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
        {poster ? (
          <img src={poster} alt="" className="h-full w-full object-cover" decoding="async" />
        ) : (
          <div className="h-full w-full bg-zinc-900" aria-hidden />
        )}
      </div>
    );
  }

  const sources = inView ? buildVideoSourceOrder(webm, srcMp4) : [];

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster={poster || undefined}
        playsInline
        preload="none"
        muted={background}
        loop={loop}
        controls={controls && !background}
        autoPlay={false}
        aria-hidden={background ? true : undefined}
        onError={() => setFailed(true)}
      >
        {sources.map(({ src, type }) => (
          <source key={src} src={src} type={type} />
        ))}
      </video>
    </div>
  );
}
