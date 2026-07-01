import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { fetchRoteiroVerificacao } from '@/lib/roteiro-verificar';

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: 'Verificar autenticidade | Reservei Viagens',
  description: 'Confirme que este roteiro foi emitido oficialmente pela Reservei Viagens.',
  robots: { index: false, follow: false },
};

export default async function RoteiroVerificarPage({ params }: PageProps) {
  const { token } = await params;
  const data = await fetchRoteiroVerificacao(token);

  if (!data?.autentico) {
    notFound();
  }

  const podeAcessarRoteiro = ['accepted', 'paid'].includes(data.status);
  const emitidoEm = data.emitidoEm
    ? new Date(data.emitidoEm).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl">
        <div className="flex items-center gap-3 text-emerald-400">
          <ShieldCheck className="h-8 w-8" />
          <h1 className="text-xl font-semibold">Verificação de autenticidade</h1>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
          <div>
            <p className="font-medium text-emerald-100">Roteiro autêntico RSV360</p>
            <p className="mt-1 text-sm text-emerald-200/80">
              Este token foi emitido oficialmente pela Reservei Viagens.
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="text-white/50">Título</dt>
            <dd className="font-medium">{data.titulo}</dd>
          </div>
          <div>
            <dt className="text-white/50">Destino</dt>
            <dd>{data.destino}</dd>
          </div>
          {emitidoEm ? (
            <div>
              <dt className="text-white/50">Emitido em</dt>
              <dd>{emitidoEm}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-white/50">Status</dt>
            <dd className="capitalize">{data.status}</dd>
          </div>
        </dl>

        {podeAcessarRoteiro ? (
          <Link
            href={data.roteiroUrl}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
          >
            Abrir roteiro premium
          </Link>
        ) : (
          <div className="mt-8 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-950/30 p-4 text-sm text-amber-100">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              O roteiro cinematográfico completo fica disponível após a confirmação da proposta.
              Consulte seu link de proposta ou fale com seu consultor.
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-white/40">
          Token: <span className="font-mono text-white/60">{token}</span>
        </p>
      </div>
    </main>
  );
}
