'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRoteiroCurrency } from '@/lib/roteiro-premium';
import { CountdownTimer } from './CountdownTimer';

interface ActionFooterProps {
  token: string;
  total: number;
  moeda: string;
  nights: number;
  guests: number;
  whatsappUrl: string;
  checkIn?: string;
  checkOut?: string;
  expirada: boolean;
  restanteMs: number | null;
  validadeLoading?: boolean;
  offline?: boolean;
}

export function ActionFooter({
  token,
  total,
  moeda,
  nights,
  guests,
  whatsappUrl,
  checkIn,
  checkOut,
  expirada,
  restanteMs,
  validadeLoading,
  offline = false,
}: ActionFooterProps) {
  const router = useRouter();
  const [recotando, setRecotando] = useState(false);
  const [recotarErro, setRecotarErro] = useState<string | null>(null);

  const period =
    checkIn && checkOut
      ? `${checkIn} → ${checkOut}`
      : `${nights} noite${nights !== 1 ? 's' : ''} · ${guests} hóspede${guests !== 1 ? 's' : ''}`;

  const handleGerarNovaCotacao = async () => {
    if (offline) return;
    setRecotarErro(null);
    setRecotando(true);
    try {
      const res = await fetch(`/api/propostas/${encodeURIComponent(token)}/recotar`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Não foi possível gerar nova cotação');
      }
      const novoToken = json.data?.novoToken as string | undefined;
      if (!novoToken) throw new Error('Resposta inválida do servidor');
      router.push(`/roteiro/${encodeURIComponent(novoToken)}`);
    } catch (err) {
      setRecotarErro((err as Error).message);
    } finally {
      setRecotando(false);
    }
  };

  return (
    <footer
      id="footer"
      className={cn(
        'border-t border-white/10 bg-gradient-to-t from-black to-zinc-950 px-4 py-10 pb-28 transition-opacity sm:px-8',
        expirada && 'opacity-90',
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl space-y-5"
      >
        <CountdownTimer
          restanteMs={restanteMs}
          expirada={expirada}
          loading={validadeLoading}
          className="justify-center sm:justify-start"
        />

        <div
          className={cn(
            'flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between',
            expirada && 'opacity-75',
          )}
        >
          <div>
            <p className="text-sm text-white/50">{period}</p>
            <p className="mt-1 text-sm text-white/70">Total do pacote</p>
            <p className="text-3xl font-bold text-white">{formatRoteiroCurrency(total, moeda)}</p>
          </div>

          {expirada ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[240px]">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-500"
              >
                <MessageCircle className="h-5 w-5" />
                Falar com consultor
              </a>
              <button
                type="button"
                onClick={() => void handleGerarNovaCotacao()}
                disabled={recotando || offline}
                title={offline ? 'Requer conexão com a internet' : undefined}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-60"
              >
                <RefreshCw className={cn('h-4 w-4', recotando && 'animate-spin')} />
                {recotando ? 'Gerando…' : 'Gerar nova cotação'}
              </button>
            </div>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-500 sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              Falar com consultor
            </a>
          )}
        </div>

        {expirada ? (
          <div className="space-y-1 text-center text-xs text-white/45 sm:text-left">
            <p>
              A tarifa desta cotação não está mais disponível. Solicite uma atualização ao seu consultor.
            </p>
            {recotarErro ? <p className="text-amber-300/90">{recotarErro}</p> : null}
          </div>
        ) : null}
      </motion.div>
    </footer>
  );
}
