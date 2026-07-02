'use client';

import { useCallback } from 'react';
import type { RoteiroPremiumView } from '@/lib/roteiro-premium';
import { buildRecotacaoUrlFromProposta } from '@/lib/proposta-recotacao-url';
import { usePropostaExpiradaSocket } from '@/hooks/usePropostaExpiradaSocket';
import { useRoteiroEngagement } from '@/hooks/useRoteiroEngagement';
import { trackCarteiraOpen, useRoteiroAnalytics } from '@/hooks/useRoteiroAnalytics';
import { useRoteiroValidade } from '@/hooks/useRoteiroValidade';
import { cn } from '@/lib/utils';
import { RoteiroOfflineMeta, RoteiroPwaProvider, useRoteiroPwa } from './RoteiroPwaShell';
import { ActionFooter } from './ActionFooter';
import { CinematicHero } from './CinematicHero';
import { CountdownTimer } from './CountdownTimer';
import { DigitalWallet } from './DigitalWallet';
import { ExpiradaBanner } from './ExpiradaBanner';
import { StickyNav } from './StickyNav';
import { QrAutenticidade } from './QrAutenticidade';
import { LazerShowcase } from './LazerShowcase';
import { RoteiroMapa } from './RoteiroMapa';
import { StorytellingTimeline } from './StorytellingTimeline';

interface CinematicItineraryProps {
  view: RoteiroPremiumView;
}

function RoteiroContent({ view }: CinematicItineraryProps) {
  const { offline } = useRoteiroPwa();
  const subtitle = `${view.nights} noite${view.nights !== 1 ? 's' : ''} em ${view.destination} · ${view.guests} hóspede${view.guests !== 1 ? 's' : ''}`;

  const { restanteMs, expirada, loading, markExpirada } = useRoteiroValidade(view.token);

  useRoteiroEngagement(view.token);
  useRoteiroAnalytics(view.token);

  const handleExpiradaSocket = useCallback(() => {
    markExpirada();
  }, [markExpirada]);

  usePropostaExpiradaSocket({
    propostaId: view.propostaId,
    token: view.token,
    onExpirada: handleExpiradaSocket,
  });

  const bloqueado = expirada;
  const recotacaoUrl = buildRecotacaoUrlFromProposta({
    tokenPublico: view.token,
    metadata: {
      checkIn: view.checkIn,
      checkOut: view.checkOut,
      hotelId: view.hotelId,
      adults: view.adults,
      children: view.children,
    },
    conteudo: { inclusions: { guests: view.guests } },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {bloqueado ? <ExpiradaBanner recotacaoUrl={recotacaoUrl} /> : null}

      <StickyNav />

      <div className={cn('fixed right-4 top-[4.5rem] z-30 hidden sm:block', bloqueado && 'top-28')}>
        <CountdownTimer
          restanteMs={restanteMs}
          expirada={expirada}
          loading={loading}
          className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md"
        />
      </div>

      <CinematicHero
        title={view.title}
        subtitle={subtitle}
        clienteNome={view.clienteNome}
        poster={view.heroImage}
        videoSrc={bloqueado ? undefined : view.heroVideo}
      />

      <div className={cn(bloqueado && 'pointer-events-none select-none opacity-60')}>
        <StorytellingTimeline days={view.schedule} destination={view.destination} />
        <LazerShowcase lazer={view.lazer} unlocked={!bloqueado} />
        <RoteiroMapa token={view.token} unlocked={!bloqueado} />
        <DigitalWallet
          token={view.token}
          status={view.status}
          checkOut={view.checkOut}
          onCarteiraOpen={trackCarteiraOpen}
        />
      </div>

      <RoteiroOfflineMeta className="px-4 pb-4" />

      <ActionFooter
        token={view.token}
        total={view.total}
        moeda={view.moeda}
        nights={view.nights}
        guests={view.guests}
        whatsappUrl={view.whatsappUrl}
        checkIn={view.checkIn}
        checkOut={view.checkOut}
        expirada={bloqueado}
        restanteMs={restanteMs}
        validadeLoading={loading}
        offline={offline}
      />

      <QrAutenticidade token={view.token} />
    </div>
  );
}

export function CinematicItinerary({ view }: CinematicItineraryProps) {
  return (
    <RoteiroPwaProvider token={view.token} status={view.status} checkOut={view.checkOut}>
      <RoteiroContent view={view} />
    </RoteiroPwaProvider>
  );
}
