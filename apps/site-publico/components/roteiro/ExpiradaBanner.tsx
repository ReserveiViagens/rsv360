'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { PROPOSTA_EXPIRADA_MSG } from '@/hooks/useRoteiroValidade';

interface ExpiradaBannerProps {
  recotacaoUrl: string;
}

export function ExpiradaBanner({ recotacaoUrl }: ExpiradaBannerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="fixed left-0 right-0 top-14 z-40 border-b border-amber-500/30 bg-amber-950/95 px-4 py-3 backdrop-blur-md sm:top-16"
        role="alert"
      >
        <div className="mx-auto flex max-w-5xl items-start gap-3 sm:items-center">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-100">Proposta expirada</p>
            <p className="text-xs text-amber-200/80 sm:text-sm">{PROPOSTA_EXPIRADA_MSG}</p>
          </div>
          <Link
            href={recotacaoUrl}
            className="shrink-0 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-100 ring-1 ring-amber-400/40 transition hover:bg-amber-500/30"
          >
            Nova cotação
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
