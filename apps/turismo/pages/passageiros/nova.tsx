import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCreatePassageiro } from '@/hooks/useFase1Modules';

export default function NovaPassageiroPage() {
  const router = useRouter();
  const create = useCreatePassageiro();
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', telefone: '' });

  return (
    <>
      <Head><title>Novo Passageiro</title></Head>
      <div className="mx-auto max-w-lg p-6">
        <Link href="/passageiros" className="text-sm text-blue-600">← Passageiros</Link>
        <h1 className="mt-2 text-xl font-bold">Novo passageiro</h1>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await create.mutateAsync(form);
            router.push(`/passageiros/${(res as { data: { id: number } }).data.id}`);
          }}
        >
          {(['nome', 'email', 'cpf', 'telefone'] as const).map((f) => (
            <label key={f} className="block text-sm">
              {f}
              <input required={f === 'nome'} className="mt-1 w-full rounded border px-3 py-2" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
            </label>
          ))}
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white">Salvar</button>
        </form>
      </div>
    </>
  );
}
