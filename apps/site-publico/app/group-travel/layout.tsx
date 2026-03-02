import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Viagens em Grupo | RSV 360° - Sistema de Reservas',
  description: 'Planeje viagens com amigos e família. Listas de desejos compartilhadas, divisão de pagamentos, convites e chat em grupo.',
  keywords: 'viagens em grupo, listas de desejos compartilhadas, divisão de pagamentos, chat em grupo, planejamento de viagem',
  openGraph: {
    title: 'Viagens em Grupo | RSV 360°',
    description: 'Planeje viagens com amigos e família. Listas de desejos compartilhadas, divisão de pagamentos, convites e chat em grupo.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function GroupTravelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
