'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Save, Shield, Sparkles, Percent, XCircle } from 'lucide-react';
import { useSession } from '@/lib/auth/SessionProvider';
import {
  useAprovarSugestaoComissoes,
  useComissoesConfig,
  useRejeitarSugestaoComissoes,
  useSolicitarAprovacaoComissoes,
  useSugerirComissoesIa,
  useUpdateComissoesConfig,
} from '@/src/modules/configuracoes/hooks/useComissoesConfig';
import type {
  ComissoesConfig,
  ComissoesObjetivoIa,
  ComissoesSugestaoIa,
} from '@/src/modules/configuracoes/api/comissoes.api';
import { ComissoesDiffTable } from '@/components/configuracoes/ComissoesDiffTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OFICIAL_RESERVEI = {
  taxaPlataformaPct: 20,
  taxaCorretorPct: 5,
  margemProprietarioPct: 75,
  marca: 'Reservei Viagens / RSV360',
};

const CONFIANCA_MINIMA_PADRAO = 0.75;

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

function splitFromForm(form: Pick<ComissoesConfig, 'taxaPlataformaPct' | 'taxaCorretorPct' | 'margemProprietarioPct'>) {
  return {
    plataforma: form.taxaPlataformaPct,
    corretor: form.taxaCorretorPct,
    proprietario: form.margemProprietarioPct,
  };
}

export function ModuloComissoesPanel({ compact = false }: { compact?: boolean }) {
  const { user } = useSession();
  const isAdmin = user?.roles?.includes('admin') ?? false;
  const userId = Number(user?.id) || 0;

  const { data, isLoading, error: loadError } = useComissoesConfig();
  const update = useUpdateComissoesConfig();
  const sugerir = useSugerirComissoesIa();
  const solicitar = useSolicitarAprovacaoComissoes();
  const aprovar = useAprovarSugestaoComissoes();
  const rejeitar = useRejeitarSugestaoComissoes();

  const [form, setForm] = useState<ComissoesConfig>(DEFAULT_FORM);
  const [objetivoIa, setObjetivoIa] = useState<ComissoesObjetivoIa>('padrao');
  const [contextoIa, setContextoIa] = useState('');
  const [sugestao, setSugestao] = useState<ComissoesSugestaoIa | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmouDiffPreview, setConfirmouDiffPreview] = useState(false);
  const [confirmouDiffPendente, setConfirmouDiffPendente] = useState(false);
  const [overrideBaixaConfianca, setOverrideBaixaConfianca] = useState(false);

  const confiancaMinima = data?.governanca?.confiancaMinima ?? CONFIANCA_MINIMA_PADRAO;
  const pendente = data?.sugestaoPendente;

  useEffect(() => {
    if (data) setForm({ ...DEFAULT_FORM, ...data });
  }, [data]);

  useEffect(() => {
    setConfirmouDiffPreview(false);
  }, [sugestao]);

  useEffect(() => {
    setConfirmouDiffPendente(false);
    setOverrideBaixaConfianca(false);
  }, [pendente?.solicitadoEm]);

  const margemPreview = Math.max(0, 100 - form.taxaPlataformaPct - form.taxaCorretorPct);
  const somaInvalida = form.taxaPlataformaPct + form.taxaCorretorPct > 100;

  const splitAtual = useMemo(
    () => ({
      plataforma: form.taxaPlataformaPct,
      corretor: form.taxaCorretorPct,
      proprietario: margemPreview,
    }),
    [form.taxaPlataformaPct, form.taxaCorretorPct, margemPreview],
  );

  const baixaConfiancaPreview = sugestao != null && sugestao.confianca < confiancaMinima;
  const baixaConfiancaPendente = pendente != null && pendente.confianca < confiancaMinima;
  const podeAprovarPendente = pendente != null && pendente.solicitadoPorUserId !== userId;

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
    setConfirmouDiffPreview(false);
  };

  const handleSugerirIa = async () => {
    const result = await sugerir.mutateAsync({
      objetivo: objetivoIa,
      contexto: contextoIa.trim() || undefined,
    });
    setSugestao(result);
  };

  const handleSolicitarAprovacao = async () => {
    if (!sugestao || !confirmouDiffPreview) return;
    setSaved(false);
    await solicitar.mutateAsync({
      ...sugestao,
      objetivo: objetivoIa,
      contexto: contextoIa.trim() || undefined,
    });
    setSugestao(null);
    setConfirmouDiffPreview(false);
  };

  const handleAprovarPendente = async () => {
    if (!pendente || !confirmouDiffPendente) return;
    if (baixaConfiancaPendente && !overrideBaixaConfianca) return;
    setSaved(false);
    await aprovar.mutateAsync({
      confirmouDiff: true,
      overrideBaixaConfianca: baixaConfiancaPendente ? overrideBaixaConfianca : undefined,
    });
    setSaved(true);
    setConfirmouDiffPendente(false);
    setOverrideBaixaConfianca(false);
  };

  const handleRejeitarPendente = async () => {
    await rejeitar.mutateAsync({});
    setConfirmouDiffPendente(false);
    setOverrideBaixaConfianca(false);
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

  const mutationError =
    update.error ?? sugerir.error ?? solicitar.error ?? aprovar.error ?? rejeitar.error;

  return (
    <div className="space-y-6">
      {!compact ? (
        <p className="text-sm text-slate-600">
          Split oficial <strong>{OFICIAL_RESERVEI.marca}</strong>: plataforma RSV360{' '}
          <strong>{OFICIAL_RESERVEI.taxaPlataformaPct}%</strong> · corretor Reservei{' '}
          <strong>{OFICIAL_RESERVEI.taxaCorretorPct}%</strong> · anfitrião residual{' '}
          <strong>{OFICIAL_RESERVEI.margemProprietarioPct}%</strong>. Alterações via IA exigem{' '}
          <strong>aprovação em duas etapas</strong> por outro administrador (confiança mínima{' '}
          {Math.round(confiancaMinima * 100)}%).
        </p>
      ) : null}

      {loadError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {(loadError as Error).message}
        </div>
      ) : null}

      {mutationError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {(mutationError as Error).message}
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Percentuais salvos. Novos lançamentos (quando o módulo estiver ativo) usarão estes valores.
        </div>
      ) : null}

      {pendente ? (
        <div className="space-y-4 rounded-xl border border-amber-300 bg-amber-50/80 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertCircle className="h-4 w-4" />
            Sugestão pendente de aprovação
          </p>
          <p className="text-xs text-amber-800">
            Solicitada em {new Date(pendente.solicitadoEm).toLocaleString('pt-BR')} · usuário #{pendente.solicitadoPorUserId} ·
            confiança {Math.round(pendente.confianca * 100)}%
          </p>
          <ComissoesDiffTable
            atual={splitAtual}
            sugestao={{
              plataforma: pendente.taxaPlataformaPct,
              corretor: pendente.taxaCorretorPct,
              proprietario: pendente.margemProprietarioPct,
            }}
          />
          <p className="text-sm text-slate-700">{pendente.motivo}</p>

          {!podeAprovarPendente ? (
            <p className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900">
              Você solicitou esta alteração. Aguarde outro administrador aprovar (governança em duas etapas).
            </p>
          ) : (
            <>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={confirmouDiffPendente}
                  onChange={(e) => setConfirmouDiffPendente(e.target.checked)}
                />
                <span>
                  Li o diff acima e confirmo que os percentuais sugeridos estão corretos para aplicar em produção.
                </span>
              </label>
              {baixaConfiancaPendente ? (
                <label className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={overrideBaixaConfianca}
                    onChange={(e) => setOverrideBaixaConfianca(e.target.checked)}
                  />
                  <span>
                    <strong>Override:</strong> confiança {Math.round(pendente.confianca * 100)}% está abaixo do mínimo{' '}
                    {Math.round(confiancaMinima * 100)}%. Aceito o risco e autorizo a aplicação manualmente.
                  </span>
                </label>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void handleAprovarPendente()}
                  disabled={
                    aprovar.isPending ||
                    !confirmouDiffPendente ||
                    (baixaConfiancaPendente && !overrideBaixaConfianca)
                  }
                >
                  {aprovar.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Aprovar e aplicar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleRejeitarPendente()}
                  disabled={rejeitar.isPending}
                >
                  {rejeitar.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Rejeitar
                </Button>
              </div>
            </>
          )}
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
          Sugestão por IA (etapa 1 — solicitar aprovação)
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
        </div>
        {sugestao ? (
          <div className="space-y-3 rounded-lg border border-violet-200 bg-white p-3 text-sm text-slate-700">
            <p>
              <strong>Fonte:</strong> {sugestao.fonte} · <strong>Confiança:</strong>{' '}
              {Math.round(sugestao.confianca * 100)}%
              {baixaConfiancaPreview ? (
                <span className="ml-2 font-medium text-amber-700">
                  (abaixo do mínimo — aprovador precisará de override)
                </span>
              ) : null}
            </p>
            <p>{sugestao.motivo}</p>
            <ComissoesDiffTable
              atual={splitAtual}
              sugestao={splitFromForm({
                taxaPlataformaPct: sugestao.taxaPlataformaPct,
                taxaCorretorPct: sugestao.taxaCorretorPct,
                margemProprietarioPct: sugestao.margemProprietarioPct,
              })}
            />
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={confirmouDiffPreview}
                onChange={(e) => setConfirmouDiffPreview(e.target.checked)}
              />
              <span>
                Revisei o diff atual vs sugestão e desejo enviar para aprovação de outro administrador.
              </span>
            </label>
            <Button
              type="button"
              onClick={() => void handleSolicitarAprovacao()}
              disabled={solicitar.isPending || !confirmouDiffPreview || !!pendente}
            >
              {solicitar.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enviar para aprovação
            </Button>
            {pendente ? (
              <p className="text-xs text-amber-700">
                Já existe uma sugestão pendente. Aprove ou rejeite antes de enviar outra.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
