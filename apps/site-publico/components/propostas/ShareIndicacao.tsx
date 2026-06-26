'use client';

import { useMemo, useState } from 'react';
import { montarUrlIndicacao } from '@/lib/mgm-url';

type ShareIndicacaoProps = {
  tokenProposta: string;
  indicadorId: number;
  siteUrl?: string;
};

export function ShareIndicacao({
  tokenProposta,
  indicadorId,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
}: ShareIndicacaoProps) {
  const [canal, setCanal] = useState('whatsapp');
  const url = useMemo(
    () => montarUrlIndicacao(siteUrl, tokenProposta, indicadorId, canal),
    [siteUrl, tokenProposta, indicadorId, canal],
  );

  const copiar = async () => {
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-900">Indique e ganhe</p>
      <label className="mt-2 block text-xs text-slate-600">
        Canal
        <select
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="email">E-mail</option>
          <option value="link">Link direto</option>
        </select>
      </label>
      <p className="mt-3 break-all rounded bg-slate-50 p-2 text-xs text-slate-700">{url}</p>
      <button
        type="button"
        onClick={copiar}
        className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
      >
        Copiar link
      </button>
    </div>
  );
}
