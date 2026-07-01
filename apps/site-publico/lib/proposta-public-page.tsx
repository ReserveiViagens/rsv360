import { notFound, redirect } from 'next/navigation';
import { PropostaPublica } from '@/components/propostas/PropostaPublica';
import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';

const ROTEIRO_STATUSES = new Set(['accepted', 'paid']);

export async function fetchPropostaByToken(token: string) {
  const backend = getFase1BackendBaseUrl();
  const res = await fetch(
    `${backend}/api/v1/cotacao-publica/proposta/${encodeURIComponent(token)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  return json.data as { id?: number; status?: string; tokenPublico?: string } | null;
}

export async function resolvePropostaId(segment: string): Promise<number | null> {
  if (/^\d+$/.test(segment)) {
    return Number(segment);
  }

  const data = await fetchPropostaByToken(segment);
  return typeof data?.id === 'number' ? data.id : null;
}

export async function renderPropostaTokenPage(token: string) {
  if (!/^\d+$/.test(token)) {
    const meta = await fetchPropostaByToken(token);
    if (meta && meta.status && ROTEIRO_STATUSES.has(meta.status)) {
      redirect(`/roteiro/${token}`);
    }
  }

  const propostaId = await resolvePropostaId(token);

  if (!propostaId) {
    notFound();
  }

  const publicToken = /^\d+$/.test(token) ? undefined : token;

  return (
    <main className="min-h-screen bg-slate-50 py-6">
      <PropostaPublica propostaId={propostaId} publicToken={publicToken} />
    </main>
  );
}

export const propostaPublicMetadata = {
  title: 'Sua Proposta | Reservei Viagens',
  description: 'Visualize, converse e responda à sua proposta comercial.',
};
