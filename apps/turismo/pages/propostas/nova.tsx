import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCreateProposta } from '@/hooks/useFase1Modules';
import { useState } from 'react';

export default function NovaPropostaPage() {
  const router = useRouter();
  const create = useCreateProposta();
  const [form, setForm] = useState({
    titulo: '',
    clienteNome: '',
    clienteEmail: '',
    valorTotal: '0',
    status: 'draft',
    isPublica: false,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await create.mutateAsync(form);
    router.push(`/propostas/${res.data.id}`);
  };

  return (
    <>
      <Head>
        <title>Nova Proposta | Turismo</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <Link href="/propostas" className="text-sm text-blue-600">
            ← Voltar
          </Link>
          <h1 className="mt-2 text-xl font-bold">Nova proposta</h1>
          <form onSubmit={submit} className="mt-4 space-y-3">
            {(['titulo', 'clienteNome', 'clienteEmail'] as const).map((f) => (
              <label key={f} className="block text-sm">
                {f}
                <input
                  required={f !== 'clienteEmail'}
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                />
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublica}
                onChange={(e) => setForm({ ...form, isPublica: e.target.checked })}
              />
              Gerar link público
            </label>
            <button type="submit" disabled={create.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
              Criar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
