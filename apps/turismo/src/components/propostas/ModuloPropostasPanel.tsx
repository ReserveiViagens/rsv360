'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Clock, Loader2, Save, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fase1Api } from '@/lib/fase1-api';

type UrgenciaEstilo = 'countdown' | 'badge' | 'nenhum';

interface ModuloPropostasForm {
  validadeCotacaoHoras: number;
  urgenciaEstilo: UrgenciaEstilo;
  avisoExpiracaoHoras: number;
}

const VALIDADE_OPCOES = [24, 48, 72] as const;

const URGENCIA_OPCOES: { value: UrgenciaEstilo; label: string; descricao: string }[] = [
  { value: 'countdown', label: 'Countdown', descricao: 'Timer regressivo na prévia /proposta/:token' },
  { value: 'badge', label: 'Badge', descricao: 'Selo de urgência com data de validade' },
  { value: 'nenhum', label: 'Nenhum', descricao: 'Sem indicador visual de urgência' },
];

export function ModuloPropostasPanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [form, setForm] = useState<ModuloPropostasForm>({
    validadeCotacaoHoras: 48,
    urgenciaEstilo: 'countdown',
    avisoExpiracaoHoras: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fase1Api.getModuloPropostas();
      setForm({
        validadeCotacaoHoras: res.data.validadeCotacaoHoras ?? 48,
        urgenciaEstilo: res.data.urgenciaEstilo ?? 'countdown',
        avisoExpiracaoHoras: res.data.avisoExpiracaoHoras ?? 2,
      });
    } catch (err) {
      setError((err as Error).message || 'Falha ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await fase1Api.updateModuloPropostas(form);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message || 'Falha ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <Shield className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Acesso restrito a administradores</p>
          <p className="mt-1 text-sm text-amber-800">
            Apenas usuários com perfil <strong>admin</strong> podem alterar as regras do módulo Propostas.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando configurações do módulo Propostas…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Valores persistidos em <code className="rounded bg-gray-100 px-1">configuracoes_sistema</code>{' '}
        (chave <code className="rounded bg-gray-100 px-1">modulo_propostas</code>). Afetam novas propostas,
        o cálculo de <code className="rounded bg-gray-100 px-1">valido_ate</code> e a prévia pública.
      </p>

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          Configurações salvas. Próximas propostas e a prévia pública usarão os novos valores.
        </div>
      ) : null}

      <div className="space-y-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-900">Validade da cotação (horas)</span>
          <span className="mb-2 block text-sm text-gray-600">
            Define o <code>valido_ate</code> de novas propostas (ex.: 48h padrão, 24h Black Friday).
          </span>
          <select
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm"
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

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-900">Estilo de urgência na prévia</legend>
          <p className="mb-3 text-sm text-gray-600">
            Controla o componente <code>UrgenciaValidade</code> em <code>/proposta/:token</code>.
          </p>
          <div className="space-y-2">
            {URGENCIA_OPCOES.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
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
                  <span className="block text-sm font-medium text-gray-900">{opt.label}</span>
                  <span className="block text-sm text-gray-600">{opt.descricao}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-900">
            <Clock className="h-4 w-4" />
            Aviso antes da expiração (horas)
          </span>
          <span className="mb-2 block text-sm text-gray-600">
            Antecedência do job de aviso ao cliente. Use <strong>0</strong> para desligar o aviso proativo.
          </span>
          <input
            type="number"
            min={0}
            max={72}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm"
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

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar módulo Propostas
      </button>
    </div>
  );
}
