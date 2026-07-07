import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PropostaEditor } from '@/components/propostas/PropostaEditor';

export default function PropostaEditorPage() {
  const router = useRouter();

  if (!router.isReady) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl text-slate-600">Carregando editor...</div>
      </div>
    );
  }

  const id = Number(router.query.id);
  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl text-red-600">Proposta inválida</div>
      </div>
    );
  }

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
