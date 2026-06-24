import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PropostaEditor } from '@/components/propostas/PropostaEditor';

export default function PropostaEditorPage() {
  const router = useRouter();
  const id = Number(router.query.id);

  if (!id) return null;

  return (
    <>
      <Head>
        <title>Editor Proposta #{id} | Turismo</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/propostas" className="text-sm text-blue-600">
            ← Propostas
          </Link>
          <h1 className="mt-2 mb-6 text-2xl font-bold">Editor de proposta</h1>
          <PropostaEditor propostaId={id} />
        </div>
      </div>
    </>
  );
}
