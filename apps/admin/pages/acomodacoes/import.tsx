'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('rsv360_access_token') ||
    window.localStorage.getItem('token') ||
    ''
  );
}

async function apiForm(path: string, form: FormData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Erro ${res.status}`);
  return json;
}

type LinhaRelatorio = {
  linha: number;
  status: string;
  acao?: string;
  erros?: string[];
  titulo?: string;
  codigoExterno?: string | null;
};

type Relatorio = {
  dryRun: boolean;
  total: number;
  sucesso: number;
  erros: number;
  linhas: LinhaRelatorio[];
};

export default function ImportAcomodacoesPage() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [proprietarioId, setProprietarioId] = useState('');
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState<'preview' | 'commit' | 'modelo' | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const onDrop = useCallback((files: File[]) => {
    setArquivo(files[0] ?? null);
    setRelatorio(null);
    setErro(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
    },
  });

  async function enviar(modo: 'preview' | 'commit') {
    if (!arquivo) {
      setErro('Selecione um arquivo antes de continuar.');
      return;
    }
    setLoading(modo);
    setErro(null);
    try {
      const form = new FormData();
      form.append('file', arquivo);
      if (proprietarioId.trim()) {
        form.append('proprietarioId', proprietarioId.trim());
      }
      const path =
        modo === 'preview'
          ? '/api/v1/acomodacoes/import/preview'
          : '/api/v1/acomodacoes/import/commit';
      const json = await apiForm(path, form);
      if (!json.success) throw new Error(json.error ?? 'Falha na importação');
      setRelatorio(json.data);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  async function baixarModelo() {
    setLoading('modelo');
    setErro(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/acomodacoes/import/modelo.xlsx`, {
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      });
      if (!res.ok) throw new Error('Não foi possível baixar o modelo');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modelo-importacao-acomodacoes.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Importador de inventário</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload .xlsx/.csv (determinístico) ou .md/.docx/.pdf (LLM + Zod). Preview antes do commit.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={baixarModelo}
          disabled={loading === 'modelo'}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {loading === 'modelo' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Baixar modelo .xlsx
        </button>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span className="font-medium">Proprietário (users.id):</span>
          <input
            type="number"
            min={1}
            placeholder="opcional"
            value={proprietarioId}
            onChange={(e) => setProprietarioId(e.target.value)}
            className="w-32 rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
          isDragActive ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm text-slate-700">
          {arquivo ? arquivo.name : 'Arraste o arquivo ou clique para selecionar'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => enviar('preview')}
          disabled={!arquivo || loading !== null}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading === 'preview' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          Preview (dry-run)
        </button>
        <button
          type="button"
          onClick={() => enviar('commit')}
          disabled={!arquivo || loading !== null}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading === 'commit' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Commit importação
        </button>
      </div>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {relatorio && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap gap-4 text-sm">
            <span>
              <strong>Modo:</strong> {relatorio.dryRun ? 'preview' : 'commit'}
            </span>
            <span>
              <strong>Total:</strong> {relatorio.total}
            </span>
            <span className="text-emerald-700">
              <strong>OK:</strong> {relatorio.sucesso}
            </span>
            <span className="text-red-700">
              <strong>Erros:</strong> {relatorio.erros}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-2">Linha</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Ação</th>
                  <th className="px-3 py-2">Título</th>
                  <th className="px-3 py-2">Erros</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.linhas.map((linha) => (
                  <tr key={`${linha.linha}-${linha.titulo ?? ''}`} className="border-b border-slate-100">
                    <td className="px-3 py-2">{linha.linha}</td>
                    <td className="px-3 py-2">{linha.status}</td>
                    <td className="px-3 py-2">{linha.acao ?? '—'}</td>
                    <td className="px-3 py-2">{linha.titulo ?? '—'}</td>
                    <td className="px-3 py-2 text-red-600">
                      {linha.erros?.join('; ') ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
