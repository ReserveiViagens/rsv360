import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CinematicItinerary } from '@/components/roteiro/CinematicItinerary';
import {
  fetchPropostaOg,
  fetchRoteiroPremium,
  mapRoteiroPremiumView,
} from '@/lib/roteiro-premium';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const og = await fetchPropostaOg(token);

  if (!og) {
    const result = await fetchRoteiroPremium(token);
    if (!result.ok) {
      return {
        title: 'Roteiro | Reservei Viagens',
        description: 'Experiência premium pós-aceite da sua viagem.',
      };
    }

    const title =
      result.data.conteudo?.inclusions?.previewTitle ??
      result.data.conteudo?.previewTitle ??
      result.data.titulo;

    return {
      title: `${title} | Roteiro Premium`,
      description: `Roteiro cinematográfico personalizado para ${result.data.clienteNome}.`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${og.title} | Roteiro Premium`,
    description: og.description,
    robots: { index: false, follow: false },
    openGraph: {
      title: og.title,
      description: og.description,
      siteName: og.siteName,
      images: [{ url: og.imageUrl, width: 1200, height: 630, alt: og.destination }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: og.title,
      description: og.description,
      images: [og.imageUrl],
    },
  };
}

export default async function RoteiroPremiumPage({ params }: PageProps) {
  const { token } = await params;
  const result = await fetchRoteiroPremium(token);

  if (result.ok === false) {
    if (result.reason === 'denied') {
      redirect(`/proposta/${token}`);
    }
    notFound();
  }

  const view = mapRoteiroPremiumView(result.data, token);

  return <CinematicItinerary view={view} />;
}
