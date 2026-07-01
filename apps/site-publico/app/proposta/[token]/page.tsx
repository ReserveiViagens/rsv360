import { renderPropostaTokenPage, propostaPublicMetadata } from '@/lib/proposta-public-page';

type PageProps = { params: Promise<{ token: string }> };

export default async function PropostaTokenPage({ params }: PageProps) {
  const { token } = await params;
  return renderPropostaTokenPage(token);
}

export const metadata = propostaPublicMetadata;
