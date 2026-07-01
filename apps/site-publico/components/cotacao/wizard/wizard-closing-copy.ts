import type { WizardProfile } from './wizard-types';

export interface ClosingHeadline {
  title: string;
  subtitle: string;
  ctaHint: string;
}

export function getClosingHeadline(
  profile: WizardProfile,
  nights: number,
  guests: number,
): ClosingHeadline {
  const period =
    nights === 1 ? '1 noite inesquecível' : `${nights} noites de experiências únicas`;
  const people = guests === 1 ? '1 pessoa' : `${guests} pessoas`;

  if (profile === 'familia') {
    return {
      title: 'Quase lá! A viagem da família está montada',
      subtitle: `${period} em Caldas Novas para ${people} — diversão, relaxamento e memórias juntos.`,
      ctaHint: 'Confirme agora e receba seu roteiro personalizado no WhatsApp em segundos.',
    };
  }
  if (profile === 'casal') {
    return {
      title: 'Seu refúgio a dois está pronto',
      subtitle: `${period} de romance e águas termais — tudo pensado para vocês.`,
      ctaHint: 'Último passo: confirme seus dados e garanta este roteiro exclusivo.',
    };
  }
  return {
    title: 'Sua aventura em Caldas Novas te espera',
    subtitle: `${period} com parques, natureza e adrenalina — feito sob medida para ${people}.`,
    ctaHint: 'Finalize agora e tenha seu roteiro completo na palma da mão.',
  };
}

type ClosingItemKind = 'hotel' | 'ticket' | 'attraction' | 'breakfast' | 'kit' | 'items';

export function getItemPersuasiveLine(kind: ClosingItemKind, profile: WizardProfile): string {
  const lines: Record<ClosingItemKind, Record<WizardProfile, string>> = {
    hotel: {
      familia: 'Conforto total para a família relaxar nas águas termais desde o check-in.',
      casal: 'Suíte aconchegante e noites revigorantes — o cenário perfeito a dois.',
      aventura: 'Base ideal para explorar Caldas Novas com praticidade e descanso.',
    },
    ticket: {
      familia: 'Diversão garantida para todas as idades — acesso imediato ao parque.',
      casal: 'Momentos de diversão e descontração em um dos melhores parques da região.',
      aventura: 'Adrenalina e águas quentes — experiência que você não vai esquecer.',
    },
    attraction: {
      familia: 'Natureza e trilhas leves para completar o roteiro em família.',
      casal: 'Paisagens incríveis para registrar momentos especiais juntos.',
      aventura: 'Explore trilhas e cenários únicos da região de Caldas Novas.',
    },
    breakfast: {
      familia: 'Comece cada dia com energia — buffet pensado para toda a família.',
      casal: 'Manhãs especiais com café reforçado antes das aventuras do dia.',
      aventura: 'Combustível para aproveitar cada minuto da sua viagem.',
    },
    kit: {
      familia: 'Kit completo de acomodação — praticidade do check-in ao check-out.',
      casal: 'Conforto premium com itens selecionados para sua estadia.',
      aventura: 'Tudo que você precisa para uma estadia sem preocupações.',
    },
    items: {
      familia: 'Itens avulsos escolhidos para máximo conforto da família.',
      casal: 'Detalhes que fazem diferença na sua experiência de hospedagem.',
      aventura: 'Personalize sua estadia com exatamente o que precisa.',
    },
  };
  return lines[kind][profile];
}

export function getScarcityHint(
  availableUnits?: number,
  recentBookings?: number,
): string | undefined {
  if (typeof availableUnits === 'number' && availableUnits > 0 && availableUnits <= 5) {
    return `Restam poucas unidades para estas datas — garanta agora.`;
  }
  if (typeof recentBookings === 'number' && recentBookings >= 3) {
    return `${recentBookings} reservas recentes neste hotel — alta procura no período.`;
  }
  return undefined;
}
