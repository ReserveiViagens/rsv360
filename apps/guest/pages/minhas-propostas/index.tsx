import Head from 'next/head';
import Link from 'next/link';

/** Guest — visualização simplificada de propostas (Fase 3.5). */
export default function MinhasPropostasGuestPage() {
  return (
    <>
      <Head>
        <title>Minhas Propostas | Guest Portal</title>
      </Head>
      <div className="mx-auto max-w-lg p-6">
        <h1 className="text-xl font-bold text-slate-900">Minhas propostas</h1>
        <p className="mt-2 text-sm text-slate-600">
          Links de propostas comerciais são enviados por e-mail. Abra o link recebido ou acesse diretamente:
        </p>
        <p className="mt-4 rounded-lg bg-slate-100 p-4 text-sm">
          Exemplo:{' '}
          <Link href="http://localhost:3000/proposta/1" className="text-blue-600 underline">
            /proposta/[id]
          </Link>{' '}
          no site público
        </p>
      </div>
    </>
  );
}
