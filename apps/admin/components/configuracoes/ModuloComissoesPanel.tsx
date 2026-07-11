'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Save, Shield, Sparkles, Percent } from 'lucide-react';
import { useSession } from '@/lib/auth/SessionProvider';
import {
  useComissoesConfig,
  useSugerirComissoesIa,
  useUpdateComissoesConfig,
} from '@/src/modules/configuracoes/hooks/useComissoesConfig';
import type {
  ComissoesConfig,
  ComissoesObjetivoIa,
  ComissoesSugestaoIa,
} from '@/src/modules/configuracoes/api/comissoes.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OFICIAL_RESERVEI = {
  taxaPlataformaPct: 20,
  taxaCorretorPct: 5,
  margemProprietarioPct: 75,
  marca: 'Reservei Viagens / RSV360',
};

const OBJETIVOS_IA: { value: ComissoesObjetivoIa; label: string }[] = [
  { value: 'padrao', label: 'Oficial Reservei (20/5/75)' },
  { value: 'captar_corretores', label: 'Captar corretores (18/7/75)' },
  { value: 'max_margem_plataforma', label: 'Máx. margem plataforma (22/5/73)' },
  { value: 'competir_otas', label: 'Competir com OTAs (18/5/77)' },
];

const DEFAULT_FORM: ComissoesConfig = {
  comissoesModuloAtivo: false,
  taxaPlataformaPct: OFICIAL_RESERVEI.taxaPlataformaPct,
  taxaCorretorPct: OFICIAL_RESERVEI.taxaCorretorPct,
  margemProprietarioPct: OFICIAL_RESERVEI.margemProprietarioPct,
};

export function ModuloComissoesPanel({ compact = false }: { compact?: boolean }) {
  const { user } = useSession();
  const isAdmin = user?.roles?.includes('admin') ?? false;

  const { data, isLoading, error: loadError } = useComissoesConfig();
  const update = useUpdateComissoesConfig();
  const sugerir = useSugerirComissoesIa();

  const [form, setForm] = useState<ComissoesConfig>(DEFAULT_FORM);
  const [objetivoIa, setObjetivoIa] = useState<ComissoesObjetivoIa>('padrao');
  const [contextoIa, setContextoIa] = useState('');
  const [sugestao, setSugestao] = useState<ComissoesSugestaoIa | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm({ ...DEFAULT_FORM, ...data });
  }, [data]);

  const margemPreview = Math.max(0, 100 - form.taxaPlataformaPct - form.taxaCorretorPct);
  const somaInvalida = form.taxaPlataformaPct + form.taxaCorretorPct > 100;

  const handleSaveManual = async () => {
    setSaved(false);
    await update.mutateAsync({
      comissoesModuloAtivo: form.comissoesModuloAtivo,
      taxaPlataformaPct: form.taxaPlataformaPct,
      taxaCorretorPct: form.taxaCorretorPct,
      fonte: 'manual',
    });
    setSaved(true);
    setSugestao(null);
  };

  const handleSugerirIa = async () => {
    const result = await sugerir.mutateAsync({
      objetivo: objetivoIa,
      contexto: contextoIa.trim() || undefined,
    });
    setSugestao(result);
  };

  const handleAplicarSugestao = async () => {
    if (!sugestao) return;
    setSaved(false);
    setForm((f) => ({
      ...f,
      taxaPlataformaPct: sugestao.taxaPlataformaPct,
      taxaCorretorPct: sugestao.taxaCorretorPct,
      margemProprietarioPct: sugestao.margemProprietarioPct,
    }));
    await update.mutateAsync({
      comissoesModuloAtivo: form.comissoesModuloAtivo,
      taxaPlataformaPct: sugestao.taxaPlataformaPct,
      taxaCorretorPct: sugestao.taxaCorretorPct,
      fonte: 'ia',
      motivoIa: sugestao.motivo,
    });
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
              Apenas usuários com perfil <strong>admin</strong> podem alterar percentuais de comissão.
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
        Carregando percentuais…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!compact ? (
        <p className="text-sm text-slate-600">
          Split oficial <strong>{OFICIAL_RESERVEI.marca}</strong>: plataforma RSV360{' '}
          <strong>{OFICIAL_RESERVEI.taxaPlataformaPct}%</strong> · corretor Reservei{' '}
          <strong>{OFICIAL_RESERVEI.taxaCorretorPct}%</strong> · anfitrião residual{' '}
          <strong>{OFICIAL_RESERVEI.margemProprietarioPct}%</strong>. Persistido em{' '}
          <code className="rounded bg-slate-100 px-1">configuracoes_sistema.comissoes</code> com snapshot{' '}
          <code className="rounded bg-slate-100 px-1">regra_aplicada</code>.
        </p>
      ) : null}

      {loadError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {(loadError as Error).message}
        </div>
      ) : null}

      {(update.error || sugerir.error) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {((update.error ?? sugerir.error) as Error).message}
        </div>
      )}

      {saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Percentuais salvos. Novos lançamentos (quando o módulo estiver ativo) usarão estes valores.
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.comissoesModuloAtivo}
          onChange={(e) => {
            setSaved(false);
            setForm((f) => ({ ...f, comissoesModuloAtivo: e.target.checked }));
          }}
        />
        Módulo de comissões ativo (geração em pagamento confirmado — MVP-B)
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <Percent className="h-4 w-4" />
            Plataforma RSV360 (%)
          </span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.taxaPlataformaPct}
            onChange={(e) => {
              setSaved(false);
              setForm((f) => ({ ...f, taxaPlataformaPct: Number(e.target.value) || 0 }));
            }}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-900">Corretor Reservei (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.taxaCorretorPct}
            onChange={(e) => {
              setSaved(false);
              setForm((f) => ({ ...f, taxaCorretorPct: Number(e.target.value) || 0 }));
            }}
          />
        </label>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase text-slate-500">Anfitrião (residual)</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{margemPreview}%</p>
        </div>
      </div>

      {somaInvalida ? (
        <p className="text-sm text-red-600">Plataforma + corretor não pode exceder 100%.</p>
      ) : null}

      {form.regraAplicada ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Última alteração: <strong>{form.regraAplicada.fonte}</strong> em{' '}
          {new Date(form.regraAplicada.atualizadoEm).toLocaleString('pt-BR')}
          {form.regraAplicada.motivoIa ? ` — ${form.regraAplicada.motivoIa}` : ''}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void handleSaveManual()} disabled={update.isPending || somaInvalida}>
          {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar manualmente
        </Button>
      </div>

      <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-violet-900">
          <Sparkles className="h-4 w-4" />
          Sugestão por IA
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span>Objetivo</span>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={objetivoIa}
              onChange={(e) => setObjetivoIa(e.target.value as ComissoesObjetivoIa)}
            >
              {OBJETIVOS_IA.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm md:col-span-2">
            <span>Contexto (opcional)</span>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Ex.: alta temporada Caldas, foco em corretores da rede Reservei…"
              value={contextoIa}
              onChange={(e) => setContextoIa(e.target.value)}
              maxLength={500}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void handleSugerirIa()} disabled={sugerir.isPending}>
            {sugerir.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Gerar sugestão
          </Button>
          {sugestao ? (
            <Button type="button" onClick={() => void handleAplicarSugestao()} disabled={update.isPending}>
              Aplicar sugestão ({sugestao.taxaPlataformaPct}/{sugestao.taxaCorretorPct}/{sugestao.margemProprietarioPct})
            </Button>
          ) : null}
        </div>
        {sugestao ? (
          <div className="rounded-lg border border-violet-200 bg-white p-3 text-sm text-slate-700">
            <p>
              <strong>Fonte:</strong> {sugestao.fonte} · <strong>Confiança:</strong>{' '}
              {Math.round(sugestao.confianca * 100)}%
            </p>
            <p className="mt-2">{sugestao.motivo}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
