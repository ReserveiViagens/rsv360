'use client';

import { motion } from 'framer-motion';
import { SmartVideo } from '@/components/media/SmartVideo';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { AnticlonagemWatermark } from './AnticlonagemWatermark';

interface CinematicHeroProps {
  title: string;
  subtitle: string;
  clienteNome: string;
  poster: string;
  videoSrc?: string;
}

export function CinematicHero({ title, subtitle, clienteNome, poster, videoSrc }: CinematicHeroProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const motionProps = (y: number, delay = 0) =>
    prefersReducedMotion
      ? { initial: false as const, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y },
          transition: { duration: delay === 0 ? 0.5 : 0.6, delay },
        };

  return (
    <section id="hero" className="relative min-h-[88vh] overflow-hidden bg-black select-none">
      <AnticlonagemWatermark />
      <img
        src={poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />

      {videoSrc ? (
        <SmartVideo
          className="absolute inset-0"
          srcMp4={videoSrc}
          poster={poster}
          background
          loop
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/90" />

      <div className="relative z-10 flex min-h-[88vh] flex-col justify-end px-4 pb-16 pt-24 sm:px-8">
        <motion.p
          {...motionProps(12, 0)}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-amber-300/90"
        >
          Experiência Premium
        </motion.p>
        <motion.h1
          {...motionProps(20, 0.1)}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
        >
          {title}
        </motion.h1>
        <motion.p
          {...motionProps(16, 0.2)}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 max-w-xl text-base text-white/80 sm:text-lg"
        >
          {subtitle}
        </motion.p>
        <motion.p
          {...(prefersReducedMotion
            ? { initial: false as const, transition: { duration: 0 } }
            : { initial: { opacity: 0 }, transition: { duration: 0.6, delay: 0.35 } })}
          animate={{ opacity: 1 }}
          className="mt-6 text-sm text-white/60"
        >
          Preparado exclusivamente para {clienteNome}
        </motion.p>
      </div>
    </section>
  );
}
