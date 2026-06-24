import { PropostaPublica } from '@/components/propostas/PropostaPublica';

type PageProps = { params: Promise<{ id: string }> };

export default async function PropostaPublicaPage({ params }: PageProps) {
  const { id } = await params;
  const propostaId = Number(id);

  return (
    <main className="min-h-screen bg-slate-50 py-6">
      <PropostaPublica propostaId={propostaId} />
    </main>
  );
}

export const metadata = {
  title: 'Sua Proposta | Reservei Viagens',
  description: 'Visualize, converse e responda à sua proposta comercial.',
};
