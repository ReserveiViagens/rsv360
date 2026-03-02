'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import type { CoreConfig } from './radial-menu-types';

interface CoreHubProps {
  data: CoreConfig;
  metrics?: { label: string; value: string | number }[];
  isOpen?: boolean;
  onClick?: () => void;
}

export function CoreHub({ data, metrics, isOpen = false }: CoreHubProps) {
  return (
    <motion.div
      animate={isOpen ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ repeat: isOpen ? Infinity : 0, duration: 2, ease: 'easeInOut' }}
      className="absolute left-1/2 top-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0066CC] flex flex-col items-center justify-center text-white z-40 pointer-events-none shadow-2xl border-4 border-white/30"
    >
      <Database className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2} />
      <span className="font-bold text-xs sm:text-sm md:text-base mt-0.5">{data.label}</span>
      {metrics && metrics.length > 0 && (
        <div className="mt-1 text-[9px] sm:text-[10px] opacity-90 space-y-0.5">
          {metrics.slice(0, 3).map((m, i) => (
            <div key={i} className="flex gap-1">
              <span>{m.label}:</span>
              <span className="font-medium">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
