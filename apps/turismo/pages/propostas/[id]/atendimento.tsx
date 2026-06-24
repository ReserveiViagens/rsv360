import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AtendimentoProposta } from '@/components/propostas/AtendimentoProposta';

export default function AtendimentoPropostaPage() {
  const router = useRouter();
  const id = Number(router.query.id);

  if (!id) return null;

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
