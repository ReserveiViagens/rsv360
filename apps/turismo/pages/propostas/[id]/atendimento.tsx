import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AtendimentoProposta } from '@/components/propostas/AtendimentoProposta';

export default function AtendimentoPropostaPage() {
  const router = useRouter();

  if (!router.isReady) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl text-slate-600">Carregando atendimento...</div>
      </div>
    );
  }

  const id = Number(router.query.id);
  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl text-red-600">Proposta inválida</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Atendimento #{id} | Turismo</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Link href={`/propostas/${id}`} className="text-sm text-blue-600">
            ← Editor
          </Link>
          <div className="mt-4">
            <AtendimentoProposta propostaId={id} />
          </div>
        </div>
      </div>
    </>
  );
}
