'use client';

import { motion } from 'framer-motion';
import type { RoteiroDay } from '@/lib/roteiro-premium';
import { cn } from '@/lib/utils';
import { AnticlonagemWatermark } from './AnticlonagemWatermark';

interface StorytellingTimelineProps {
  days: RoteiroDay[];
  destination: string;
}

export function StorytellingTimeline({ days, destination }: StorytellingTimelineProps) {
  if (!days.length) {
    return (
      <section id="timeline" className="px-4 py-16 sm:px-8">
        <p className="text-center text-white/60">Seu roteiro detalhado será disponibilizado em breve.</p>
      </section>
    );
  }

  return (
    <section id="timeline" className="relative select-none px-4 py-16 sm:px-8">
      <AnticlonagemWatermark />
      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-sm uppercase tracking-widest text-amber-400/90">Dia a dia</p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Sua jornada em {destination}</h2>
        </motion.div>

        <ol className="space-y-16 sm:space-y-24">
          {days.map((day, index) => {
            const reverse = index % 2 === 1;
            return (
              <motion.li
                key={day.id ?? `${day.day}-${index}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: index * 0.05 }}
                className={cn(
                  'flex flex-col gap-6 sm:items-center sm:gap-10',
                  reverse ? 'sm:flex-row-reverse' : 'sm:flex-row',
                )}
              >
                <div className="sm:w-1/2">
                  {day.image ? (
                    <img
                      src={day.image}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full rounded-2xl bg-white/5 ring-1 ring-white/10" />
                  )}
                </div>
                <div className="sm:w-1/2">
                  <span className="inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                    Dia {day.day}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">{day.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">{day.description}</p>
                  {day.actionLabel ? (
                    <p className="mt-4 text-sm font-medium text-amber-300/90">{day.actionLabel}</p>
                  ) : null}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
