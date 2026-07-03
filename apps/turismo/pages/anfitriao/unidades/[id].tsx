import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';
import AnfitriaoRoleGuard from '../../../components/AnfitriaoRoleGuard';
import {
  useAnfitriaoUnidade,
  useAtualizarAnfitriaoUnidade,
  useEnviarAprovacaoUnidade,
} from '@/hooks/useAnfitriao';

type UnidadeEdit = {
  titulo?: string;
  precoDiaria?: string | number | null;
  statusPublicacao?: string;
  amenidades?: unknown;
  utensilios?: unknown;
  midia?: unknown;
  eletrodomesticos?: unknown;
};

function jsonPretty(v: unknown) {
  if (v == null) return '[]';
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return '[]';
  }
}

function parseJsonField(raw: string, label: string) {
  try {
    return JSON.parse(raw || '[]');
  } catch {
    throw new Error(`${label}: JSON inválido`);
  }
}

function UnidadeEditForm({
  unidade,
  atualizar,
  enviar,
  unitId,
}: {
  unidade: UnidadeEdit;
  atualizar: ReturnType<typeof useAtualizarAnfitriaoUnidade>;
  enviar: ReturnType<typeof useEnviarAprovacaoUnidade>;
  unitId: number;
}) {
  const [titulo, setTitulo] = useState(() => unidade.titulo ?? '');
  const [preco, setPreco] = useState(() =>
    unidade.precoDiaria != null ? String(unidade.precoDiaria) : '',
  );
  const [amenidades, setAmenidades] = useState(() => jsonPretty(unidade.amenidades));
  const [utensilios, setUtensilios] = useState(() => jsonPretty(unidade.utensilios));
  const [midia, setMidia] = useState(() => jsonPretty(unidade.midia));
  const [eletro, setEletro] = useState(() => jsonPretty(unidade.eletrodomesticos));
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function salvar() {
    setMensagem(null);
    try {
      await atualizar.mutateAsync({
        titulo,
        precoDiaria: preco,
        amenidades: parseJsonField(amenidades, 'Amenidades'),
        utensilios: parseJsonField(utensilios, 'Utensílios'),
        midia: parseJsonField(midia, 'Mídia'),
        eletrodomesticos: parseJsonField(eletro, 'Eletrodomésticos'),
        statusPublicacao: 'completo',
      });
      setMensagem('Salvo. Status: completo.');
    } catch (e) {
      setMensagem((e as Error).message);
    }
  }

  async function enviarAprovacao() {
    setMensagem(null);
    try {
      await enviar.mutateAsync();
      setMensagem('Enviado para aprovação do staff.');
    } catch (e) {
      setMensagem((e as Error).message);
    }
  }

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-500">
        Status atual: <strong>{unidade.statusPublicacao}</strong>
      </p>
      <Link
        href={`/anfitriao/unidades/${unitId}/disponibilidade`}
        className="text-sm text-blue-600 hover:underline"
      >
        Calendário de disponibilidade →
      </Link>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Título</span>
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Preço diária (R$)</span>
        <input
          type="number"
          min={0}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />
      </label>
      {[
        ['Amenidades (JSON)', amenidades, setAmenidades],
        ['Utensílios (JSON)', utensilios, setUtensilios],
        ['Mídia / fotos (JSON)', midia, setMidia],
        ['Eletrodomésticos (JSON)', eletro, setEletro],
      ].map(([label, val, setVal]) => (
        <label key={String(label)} className="block text-sm">
          <span className="font-medium text-slate-700">{label}</span>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
            value={val as string}
            onChange={(e) => (setVal as (s: string) => void)(e.target.value)}
          />
        </label>
      ))}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={salvar}
          disabled={atualizar.isPending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Salvar (completo)
        </button>
        <button
          type="button"
          onClick={enviarAprovacao}
          disabled={enviar.isPending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Enviar para aprovação
        </button>
      </div>
      {mensagem && <p className="text-sm text-slate-700">{mensagem}</p>}
    </div>
  );
}

export default function AnfitriaoUnidadeEditPage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const { data, isLoading } = useAnfitriaoUnidade(id);
  const atualizar = useAtualizarAnfitriaoUnidade(id);
  const enviar = useEnviarAprovacaoUnidade(id);

  const unidade = data?.data as UnidadeEdit | undefined;

  return (
    <AnfitriaoRoleGuard>
      <Head>
        <title>Editar unidade | Anfitrião</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl">
          <Link href="/anfitriao/unidades" className="text-sm text-blue-600 hover:underline">
            ← Minhas unidades
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Editar unidade #{id}</h1>

          {isLoading && <p className="mt-4 text-slate-600">Carregando...</p>}

          {unidade && (
            <UnidadeEditForm
              key={id}
              unitId={id}
              unidade={unidade}
              atualizar={atualizar}
              enviar={enviar}
            />
          )}
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
