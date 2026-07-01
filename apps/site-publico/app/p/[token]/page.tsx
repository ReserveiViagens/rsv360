import { renderPropostaTokenPage, propostaPublicMetadata } from '@/lib/proposta-public-page';

type PageProps = { params: Promise<{ token: string }> };

/** Alias curto `/p/:token` → mesmo conteúdo público de `/proposta/:token` (PR 17). */
export default async function PropostaShortLinkPage({ params }: PageProps) {
  const { token } = await params;
  return renderPropostaTokenPage(token);
}

export const metadata = {
  ...propostaPublicMetadata,
  robots: { index: false, follow: false },
};
