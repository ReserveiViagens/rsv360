'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProposta, useUpdateProposta } from '@/hooks/useFase1Modules';
import type { Proposta } from '@rsv360/shared';

function formatCurrency(value: string | number, moeda = 'BRL') {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(num || 0);
}

function buildFormFromProposta(proposta: Proposta): Partial<Proposta> {
  return {
    titulo: proposta.titulo,
    clienteNome: proposta.clienteNome,
    clienteEmail: proposta.clienteEmail ?? '',
    clienteTelefone: proposta.clienteTelefone ?? '',
    valorTotal: proposta.valorTotal,
    status: proposta.status,
    isPublica: proposta.isPublica ?? false,
  };
}

function PropostaEditorForm({ proposta, propostaId }: { proposta: Proposta; propostaId: number }) {
  const update = useUpdateProposta();
  const [form, setForm] = useState(() => buildFormFromProposta(proposta));

  const preview = { ...proposta, ...form };

  const save = async () => {
    await update.mutateAsync({
      id: propostaId,
      body: {
        titulo: form.titulo,
        clienteNome: form.clienteNome,
        clienteEmail: form.clienteEmail,
        clienteTelefone: form.clienteTelefone,
        valorTotal: form.valorTotal,
        status: form.status,
        isPublica: form.isPublica,
      },
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Editar proposta #{propostaId}</h2>
        <div className="space-y-3">
          {(['titulo', 'clienteNome', 'clienteEmail', 'clienteTelefone'] as const).map((field) => (
            <label key={field} className="block text-sm">
              <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={String(form[field] ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="font-medium">Valor total</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={String(form.valorTotal ?? '')}
              onChange={(e) => setForm((f) => ({ ...f, valorTotal: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(form.isPublica)}
              onChange={(e) => setForm((f) => ({ ...f, isPublica: e.target.checked }))}
            />
            Link público ativo
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={save}
              disabled={update.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Salvar
            </button>
            <Link
              href={`/propostas/${propostaId}/atendimento`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              Atendimento HITL
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Preview em tempo real</p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">{preview.titulo}</h3>
        <p className="mt-1 text-slate-600">{preview.clienteNome}</p>
        <p className="mt-4 text-2xl font-bold text-emerald-700">{formatCurrency(preview.valorTotal ?? 0, preview.moeda)}</p>
        <p className="mt-2 text-sm text-slate-500">Status: {preview.status}</p>
        {preview.isPublica && preview.tokenPublico && (
          <p className="mt-4 text-sm text-blue-700">
            Link público:{' '}
            <a
              href={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/proposta/${preview.tokenPublico}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              /proposta/{preview.tokenPublico}
            </a>
          </p>
        )}
      </section>
    </div>
  );
}

export function PropostaEditor({ propostaId }: { propostaId: number }) {
  const { data, isLoading, isError } = useProposta(propostaId);
  const proposta = data?.data;

  if (isLoading) {
    return <div className="p-6 text-slate-600">Carregando editor...</div>;
  }

  if (isError || !proposta) {
    return (
      <div className="p-6 text-red-600">
        Não foi possível carregar a proposta #{propostaId}. Verifique sua sessão e tente novamente.
      </div>
    );
  }

  return <PropostaEditorForm key={proposta.id} proposta={proposta} propostaId={propostaId} />;
}
