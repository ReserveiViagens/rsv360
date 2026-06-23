import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCreateOrcamento } from '@/hooks/useFase1Modules';

export default function NovaOrcamentoPage() {
  const router = useRouter();
  const create = useCreateOrcamento();
  const [form, setForm] = useState({
    titulo: '',
    clienteNome: '',
    clienteEmail: '',
    tipo: 'personalizado',
    status: 'draft',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await create.mutateAsync(form);
    const id = (res as { data: { id: number } }).data.id;
    router.push(`/orcamentos/${id}`);
  };

  return (
    <>
      <Head><title>Novo Orçamento</title></Head>
      <div className="mx-auto max-w-lg p-6">
        <Link href="/orcamentos" className="text-sm text-blue-600">← Orçamentos</Link>
        <h1 className="mt-2 text-xl font-bold">Novo orçamento</h1>
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
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white" disabled={create.isPending}>
            Criar
          </button>
        </form>
      </div>
    </>
  );
}
