'use client';

import { motion } from 'framer-motion';
import { ChevronDown, QrCode, Ticket, Hotel, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildQrImageUrl } from '@/lib/roteiro-offline/qr-exp';

const VOUCHER_ITEMS = [
  {
    id: 'hotel',
    icon: Hotel,
    title: 'Voucher de Hospedagem',
    description: 'Apresente na recepção do hotel. QR válido até o fim da estadia.',
  },
  {
    id: 'ingressos',
    icon: Ticket,
    title: 'Ingressos & Atrações',
    description: 'Acesso digital aos parques e experiências incluídas no pacote.',
  },
  {
    id: 'checkin',
    icon: QrCode,
    title: 'QR Code de Check-in',
    description: 'Código único para validação rápida na chegada.',
  },
] as const;

interface DigitalWalletProps {
  token: string;
  status: string;
  checkOut?: string;
}

function isWalletUnlocked(status: string): boolean {
  return status === 'accepted' || status === 'paid';
}

export function DigitalWallet({ token, status, checkOut }: DigitalWalletProps) {
  const unlocked = isWalletUnlocked(status);

  return (
    <section id="wallet" className="border-t border-white/10 bg-black/40 px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <p className="text-sm uppercase tracking-widest text-amber-400/90">Carteira digital</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Seus vouchers</h2>
          <p className="mt-2 text-sm text-white/60">
            {unlocked
              ? 'Apresente o QR no balcão ou catraca para validação.'
              : 'Documentos disponíveis após confirmação de pagamento.'}
          </p>
        </motion.div>

        <div className="space-y-3">
          {VOUCHER_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const qrSrc = unlocked ? buildQrImageUrl(token, item.id, checkOut ?? null) : null;

            return (
              <motion.details
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group rounded-2xl border border-white/10 bg-white/5 open:bg-white/[0.07]"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4 sm:px-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="truncate text-sm text-white/55">{item.description}</p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-white/40 transition-transform group-open:rotate-180',
                    )}
                  />
                </summary>
                <div className="border-t border-white/10 px-4 pb-5 pt-2 sm:px-5">
                  <div className="flex flex-col items-center gap-3 rounded-xl bg-black/30 p-6">
                    {unlocked && qrSrc ? (
                      <>
                        <img
                          src={qrSrc}
                          alt={`QR Code — ${item.title}`}
                          width={280}
                          height={280}
                          className="rounded-lg bg-white p-2"
                          draggable={false}
                        />
                        <p className="text-center text-xs text-white/50">
                          Escaneie no balcão · válido até o fim da estadia
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5">
                          <Lock className="h-10 w-10 text-white/25" />
                        </div>
                        <p className="text-center text-xs text-white/45">
                          Confirme o pagamento para liberar o QR verificável
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
