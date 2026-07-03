import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import AnfitriaoRoleGuard from '../../components/AnfitriaoRoleGuard';
import { fase1Api } from '@/lib/fase1-api';

export default function AnfitriaoImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<unknown>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fase1Api.importPreview(file);
      setPreview(res.data);
      setMsg('Preview OK — revise antes de commitar (máx. 50 linhas).');
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCommit() {
    if (!file) return;
    setLoading(true);
    setMsg(null);
    try {
      await fase1Api.importCommit(file);
      setMsg('Import concluído com sucesso.');
      setPreview(null);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnfitriaoRoleGuard>
      <Head>
        <title>Importar unidades | Anfitrião</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/anfitriao" className="text-sm text-blue-600 hover:underline">
            ← Painel
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Importar planilha (≤50 linhas)</h1>
          <p className="mt-2 text-sm text-slate-600">
            O proprietário é vinculado automaticamente à sua conta.{' '}
            <a
              href="/api/v1/acomodacoes/import/modelo.xlsx"
              className="text-blue-600 underline"
              download
            >
              Baixar modelo
            </a>
          </p>

          <div className="mt-6 rounded-xl border bg-white p-6">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={!file || loading}
                onClick={handlePreview}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Preview
              </button>
              <button
                type="button"
                disabled={!file || loading || !preview}
                onClick={handleCommit}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Commit
              </button>
            </div>
            {msg && <p className="mt-4 text-sm text-slate-700">{msg}</p>}
            {preview != null && (
              <pre className="mt-4 max-h-96 overflow-auto rounded bg-slate-100 p-3 text-xs">
                {JSON.stringify(preview, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
