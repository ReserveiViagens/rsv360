import {
  mapRoteiroParaAtividades,
  montarRoteiroInteligente,
  type RoteiroAtracao,
} from '@rsv360/shared';
import type { AvailabilityItem, WizardCatalog, WizardState } from '@/components/cotacao/wizard/wizard-types';
import { countNights } from '@/components/cotacao/wizard/wizard-types';
import type { RoteiroPreviewActivity, RoteiroPreviewMeta } from './montar-roteiro-preview';

function findHotel(catalog: WizardCatalog, hotelId: WizardState['hotelId']): AvailabilityItem | undefined {
  return catalog.hotels.find((h) => h.id === hotelId || h.contentId === hotelId);
}

function resolveAmenidades(hotel?: AvailabilityItem): string[] {
  const raw = hotel?.metadata?.amenidades ?? hotel?.metadata?.amenities;
  if (Array.isArray(raw)) return raw.map(String);
  return [];
}

function hasParqueTicket(state: WizardState, catalog: WizardCatalog): boolean {
  if (state.ticketIds.length === 0) return false;
  const tickets = catalog.tickets.filter((t) =>
    state.ticketIds.some((id) => id === t.id || id === t.contentId),
  );
  return tickets.some(
    (t) =>
      /parque|aqu[aá]tico|hot park|acqua/i.test(t.title) ||
      t.metadata?.hubSource === true,
  );
}

export function montarRoteiroPreviewInteligente(
  state: WizardState,
  catalog: WizardCatalog,
  atracoes: RoteiroAtracao[],
): RoteiroPreviewMeta {
  const nights = countNights(state.checkIn, state.checkOut) || 1;
  const guests = state.adults + state.children;
  const hotel = findHotel(catalog, state.hotelId);
  const perfil = state.profile ?? 'casal';

  const roteiro = montarRoteiroInteligente({
    checkIn: state.checkIn,
    checkOut: state.checkOut,
    perfil,
    amenidadesHotel: resolveAmenidades(hotel),
    catalogoAtracoes: atracoes,
    incluirParqueAquatico: perfil === 'familia' && hasParqueTicket(state, catalog),
  });

  const mapped = mapRoteiroParaAtividades(roteiro, atracoes, perfil);
  const activities: RoteiroPreviewActivity[] = mapped.map((a) => ({
    id: a.id,
    day: a.day,
    title: a.title,
    description: a.description,
    image: a.image,
    actionLabel: a.actionLabel,
    type: a.type,
    mood: a.mood,
    behaviorTag: a.behaviorTag,
  }));

  const hotelTitle = hotel?.title ?? 'Caldas Novas Premium';

  return {
    title: hotelTitle.includes('Caldas') ? hotelTitle : `${hotelTitle} — Caldas Novas`,
    nights,
    guests,
    destination: hotel?.location?.split(',')[0] ?? 'Caldas Novas',
    heroImage: hotel?.images?.[0],
    activities,
  };
}
