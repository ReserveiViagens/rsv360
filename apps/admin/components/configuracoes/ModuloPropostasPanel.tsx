'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock, Loader2, Save, Shield } from 'lucide-react';
import { useSession } from '@/lib/auth/SessionProvider';
import {
  useModuloPropostasConfig,
  useUpdateModuloPropostas,
} from '@/src/modules/configuracoes/hooks/useModuloPropostas';
import type {
  ModuloPropostasConfig,
  UrgenciaEstilo,
} from '@/src/modules/configuracoes/api/modulo-propostas.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const VALIDADE_OPCOES = [24, 48, 72] as const;

const URGENCIA_OPCOES: { value: UrgenciaEstilo; label: string; descricao: string }[] = [
  { value: 'countdown', label: 'Countdown', descricao: 'Timer regressivo na prévia /p/:token' },
  { value: 'badge', label: 'Badge', descricao: 'Selo com data de validade' },
  { value: 'nenhum', label: 'Nenhum', descricao: 'Sem indicador visual de urgência' },
];

const DEFAULT_FORM: ModuloPropostasConfig = {
  validadeCotacaoHoras: 48,
  urgenciaEstilo: 'countdown',
  avisoExpiracaoHoras: 2,
  permitirApenasHotel: true,
  disparoAutomatizadoCaldasAi: true,
  delayDisparoMinutos: 120,
};

export function ModuloPropostasPanel() {
  const { user } = useSession();
  const isAdmin = user?.roles?.includes('admin') ?? false;

  const { data, isLoading, error: loadError } = useModuloPropostasConfig();
  const update = useUpdateModuloPropostas();

  const [form, setForm] = useState<ModuloPropostasConfig>(DEFAULT_FORM);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm({ ...DEFAULT_FORM, ...data });
  }, [data]);

  const handleSave = async () => {
    setSaved(false);
    await update.mutateAsync(form);
    setSaved(true);
  };

  if (!isAdmin) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-start gap-3 p-4 text-amber-900">
          <Shield className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Acesso restrito a administradores</p>
            <p className="mt-1 text-sm text-amber-800">
              Apenas usuários com perfil <strong>admin</strong> podem alterar o módulo Propostas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando configurações…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Persistido em <code className="rounded bg-slate-100 px-1">configuracoes_sistema.modulo_propostas</code>.
        Afeta <code className="rounded bg-slate-100 px-1">valido_ate</code>, urgência na prévia pública e jobs de
        aviso/expiração.
      </p>

      {loadError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {(loadError as Error).message}
        </div>
      ) : null}

      {update.error ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {(update.error as Error).message}
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Configurações salvas. Novas propostas e a prévia pública usarão os novos valores.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-900">Validade da cotação (horas)</span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.validadeCotacaoHoras}
            onChange={(e) => {
              setSaved(false);
              setForm((f) => ({ ...f, validadeCotacaoHoras: Number(e.target.value) }));
            }}
          >
            {VALIDADE_OPCOES.map((h) => (
              <option key={h} value={h}>
                {h} horas
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <Clock className="h-4 w-4" />
            Aviso antes da expiração (horas)
          </span>
          <input
            type="number"
            min={0}
            max={72}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.avisoExpiracaoHoras}
            onChange={(e) => {
              setSaved(false);
              setForm((f) => ({
                ...f,
                avisoExpiracaoHoras: Math.max(0, Number(e.target.value) || 0),
              }));
            }}
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-900">Estilo de urgência na prévia</legend>
        <div className="grid gap-2 md:grid-cols-3">
          {URGENCIA_OPCOES.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="urgenciaEstilo"
                className="mt-1"
                checked={form.urgenciaEstilo === opt.value}
                onChange={() => {
                  setSaved(false);
                  setForm((f) => ({ ...f, urgenciaEstilo: opt.value }));
                }}
              />
              <span>
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="block text-xs text-slate-500">{opt.descricao}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.permitirApenasHotel}
            onChange={(e) => {
              setSaved(false);
              setForm((f) => ({ ...f, permitirApenasHotel: e.target.checked }));
            }}
          />
          Permitir apenas hotel no wizard
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.disparoAutomatizadoCaldasAi}
            onChange={(e) => {
              setSaved(false);
              setForm((f) => ({ ...f, disparoAutomatizadoCaldasAi: e.target.checked }));
            }}
          />
          Disparo automatizado CaldasAI
        </label>
        <label className="block space-y-1 text-sm md:col-span-2">
          <span>Delay do disparo (minutos)</span>
          <input
            type="number"
            min={0}
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2"
            value={form.delayDisparoMinutos}
            onChange={(e) => {
              setSaved(false);
              setForm((f) => ({
                ...f,
                delayDisparoMinutos: Math.max(0, Number(e.target.value) || 0),
              }));
            }}
          />
        </label>
      </div>

      <Button type="button" onClick={() => void handleSave()} disabled={update.isPending}>
        {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Salvar módulo Propostas
      </Button>
    </div>
  );
}
