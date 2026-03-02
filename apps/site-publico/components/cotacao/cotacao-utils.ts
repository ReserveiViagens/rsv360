import type { Hotel } from '@/hooks/useWebsiteData';

const CAFE_TERMS = ['café da manhã', 'cafe da manha', 'breakfast', 'café', 'cafe'];
const ROUPA_TERMS = ['roupa de cama', 'roupas de cama', 'cama', 'bed', 'linen'];
const ALMOCO_TERMS = ['almoço', 'almoco', 'lunch', 'meia pensão', 'meia pensao', 'half board', 'refeição', 'refeicao'];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function getHotelEligibleAddOns(hotel: Hotel): { cafeDaManha: boolean; roupaDeCama: boolean; almoco: boolean } {
  const features = hotel.features ?? hotel.metadata?.features ?? hotel.metadata?.amenities ?? [];
  const normalized = features.map((f) => normalize(String(f)));
  return {
    cafeDaManha: CAFE_TERMS.some((term) => normalized.some((f) => f.includes(normalize(term)))),
    roupaDeCama: ROUPA_TERMS.some((term) => normalized.some((f) => f.includes(normalize(term)))),
    almoco: ALMOCO_TERMS.some((term) => normalized.some((f) => f.includes(normalize(term)))),
  };
}

export interface CotacaoState {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  hotelIds: (number | string)[];
  ticketIds: (number | string)[];
  attractionIds: (number | string)[];
  addOns: Record<string, { cafeDaManha?: boolean; roupaDeCama?: boolean; almoco?: boolean }>;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export const COTACAO_DRAFT_KEY = 'rsv360-cotacao-draft';

export const initialCotacaoState: CotacaoState = {
  checkIn: '',
  checkOut: '',
  adults: 1,
  children: 0,
  hotelIds: [],
  ticketIds: [],
  attractionIds: [],
  addOns: {},
  name: '',
  email: '',
  phone: '',
  notes: '',
};
