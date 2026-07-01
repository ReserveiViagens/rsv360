import { getBehaviorBadge } from '@/components/cotacao/wizard/wizard-behavior';
import type { AvailabilityItem, WizardCatalog, WizardState } from '@/components/cotacao/wizard/wizard-types';
import { countNights } from '@/components/cotacao/wizard/wizard-types';

export type RoteiroMood = 'relaxamento' | 'diversao' | 'natureza' | 'gastronomia';

export interface RoteiroPreviewActivity {
  id: string;
  day: number;
  title: string;
  description: string;
  image?: string;
  videoUrl?: string;
  actionLabel?: string;
  type?: string;
  mood?: RoteiroMood;
  behaviorTag?: string;
}

export interface RoteiroPreviewMeta {
  title: string;
  nights: number;
  guests: number;
  destination: string;
  heroImage?: string;
  activities: RoteiroPreviewActivity[];
}

const FALLBACK_IMAGES = {
  hotel: 'https://images.unsplash.com/photo-1571508601633-63bfea190214?w=600&h=400&fit=crop',
  ticket: 'https://images.unsplash.com/photo-1549887534-f2cb8ff16145?w=600&h=400&fit=crop',
  attraction: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  free: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
};

function findHotel(catalog: WizardCatalog, hotelId: WizardState['hotelId']): AvailabilityItem | undefined {
  return catalog.hotels.find((h) => h.id === hotelId || h.contentId === hotelId);
}

function findTickets(catalog: WizardCatalog, ids: (string | number)[]): AvailabilityItem[] {
  return catalog.tickets.filter((t) =>
    ids.some((id) => id === t.id || id === t.contentId),
  );
}

function findAttractions(catalog: WizardCatalog, ids: (string | number)[]): AvailabilityItem[] {
  return catalog.attractions.filter((a) =>
    ids.some((id) => id === a.id || id === a.contentId),
  );
}

function getImage(item: AvailabilityItem | undefined, fallback: string): string {
  if (!item) return fallback;
  const metaImages = item.metadata?.images;
  if (Array.isArray(metaImages) && metaImages.length) return metaImages[0] as string;
  if (item.images.length) return item.images[0];
  return fallback;
}

function getVideoUrl(item: AvailabilityItem | undefined): string | undefined {
  const url = item?.metadata?.videoUrl;
  return typeof url === 'string' && url.length ? url : undefined;
}

function moodForType(type: string): RoteiroMood {
  if (type === 'hotel' || type === 'free') return 'relaxamento';
  if (type === 'ticket') return 'diversao';
  if (type === 'attraction') return 'natureza';
  return 'relaxamento';
}

function moodLabel(mood: RoteiroMood): string {
  const map: Record<RoteiroMood, string> = {
    relaxamento: 'Relaxamento',
    diversao: 'Diversão',
    natureza: 'Natureza',
    gastronomia: 'Gastronomia',
  };
  return map[mood];
}

function buildActivity(
  day: number,
  item: AvailabilityItem | undefined,
  opts: {
    title: string;
    description: string;
    actionLabel: string;
    type: string;
    profile: WizardState['profile'];
    fallbackImage: string;
  },
): RoteiroPreviewActivity {
  const mood = moodForType(opts.type);
  const behaviorTag =
    (item ? getBehaviorBadge(item, opts.profile) : undefined) ?? moodLabel(mood);

  return {
    id: `${day}-${opts.type}-${item?.id ?? 'default'}`,
    day,
    title: opts.title,
    description: opts.description,
    image: getImage(item, opts.fallbackImage),
    videoUrl: getVideoUrl(item),
    actionLabel: opts.actionLabel,
    type: opts.type,
    mood,
    behaviorTag,
  };
}

export function montarRoteiroPreview(state: WizardState, catalog: WizardCatalog): RoteiroPreviewMeta {
  const nights = countNights(state.checkIn, state.checkOut) || 1;
  const guests = state.adults + state.children;
  const hotel = findHotel(catalog, state.hotelId);
  const tickets = findTickets(catalog, state.ticketIds);
  const attractions = findAttractions(catalog, state.attractionIds);
  const activities: RoteiroPreviewActivity[] = [];

  for (let day = 1; day <= nights; day++) {
    if (day === 1 && hotel) {
      activities.push(
        buildActivity(day, hotel, {
          title: `Chegada & Relaxamento — ${hotel.title}`,
          description: 'Check-in e noite livre nas águas termais',
          actionLabel: 'Ver hotel',
          type: 'hotel',
          profile: state.profile,
          fallbackImage: FALLBACK_IMAGES.hotel,
        }),
      );
    } else if (tickets.length > 0) {
      const ticket = tickets[(day - 2) % tickets.length];
      activities.push(
        buildActivity(day, ticket, {
          title: `Diversão Aquática — ${ticket.title}`,
          description: 'Acesso imediato ao parque',
          actionLabel: 'Explorar atrações',
          type: 'ticket',
          profile: state.profile,
          fallbackImage: FALLBACK_IMAGES.ticket,
        }),
      );
    } else if (attractions.length > 0) {
      const attr = attractions[(day - 2) % attractions.length];
      activities.push(
        buildActivity(day, attr, {
          title: attr.title,
          description: 'Natureza e trilhas',
          actionLabel: 'Ver detalhes',
          type: 'attraction',
          profile: state.profile,
          fallbackImage: FALLBACK_IMAGES.attraction,
        }),
      );
    } else {
      activities.push(
        buildActivity(day, undefined, {
          title: `Dia ${day} — Caldas Novas`,
          description: 'Tempo livre para relaxar',
          actionLabel: 'Ver sugestões',
          type: 'free',
          profile: state.profile,
          fallbackImage: FALLBACK_IMAGES.free,
        }),
      );
    }
  }

  if (attractions.length && activities.length <= nights) {
    const attr = attractions[0];
    const extraDay = activities.length + 1;
    activities.push(
      buildActivity(extraDay, attr, {
        title: attr.title,
        description: 'Natureza e trilhas',
        actionLabel: 'Ver detalhes',
        type: 'attraction',
        profile: state.profile,
        fallbackImage: FALLBACK_IMAGES.attraction,
      }),
    );
  }

  const hotelTitle = hotel?.title ?? 'Caldas Novas Premium';

  return {
    title: hotelTitle.includes('Caldas') ? hotelTitle : `${hotelTitle} — Caldas Novas`,
    nights,
    guests,
    destination: hotel?.location?.split(',')[0] ?? 'Caldas Novas',
    heroImage: getImage(hotel, FALLBACK_IMAGES.hotel),
    activities,
  };
}
