'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { buildRoteiroAutenticidadeUrl } from '@/lib/roteiro-autenticidade';

interface QrAutenticidadeProps {
  token: string;
  className?: string;
}

export function QrAutenticidade({ token, className = '' }: QrAutenticidadeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const verifyUrl = buildRoteiroAutenticidadeUrl(token);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 160,
      color: { dark: '#ffffff', light: '#00000000' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [verifyUrl]);

  return (
    <footer
      className={`border-t border-white/10 bg-black/40 px-4 py-10 sm:px-8 ${className}`}
      aria-label="Verificação de autenticidade"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code para verificar autenticidade do roteiro"
            width={160}
            height={160}
            className="rounded-lg border border-white/15 bg-zinc-900/80 p-2"
          />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/50 text-xs text-white/40">
            Gerando QR…
          </div>
        )}
        <div className="max-w-xl space-y-2">
          <p className="text-sm font-medium text-white">
            Roteiro exclusivo gerado por RSV360 — verificar autenticidade
          </p>
          <p className="text-xs leading-relaxed text-white/60">
            Escaneie o QR ou acesse o link oficial para confirmar que este roteiro foi emitido pela
            Reservei Viagens. Links fora do domínio oficial podem ser cópias não autorizadas.
          </p>
          <a
            href={verifyUrl}
            className="inline-block break-all text-xs text-amber-300/90 underline-offset-2 hover:underline"
          >
            {verifyUrl}
          </a>
        </div>
      </div>
    </footer>
  );
}
