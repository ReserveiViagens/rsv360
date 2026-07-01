export interface BreakfastOption {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  behaviorTags?: string[];
}

export interface AccommodationItem {
  id: string;
  title: string;
  price: number;
  unit: string;
}

export interface AccommodationKit {
  id: string;
  title: string;
  description: string;
  price: number;
  items: string[];
  images: string[];
  behaviorTags?: string[];
}

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop';

export const BREAKFAST_OPTIONS: BreakfastOption[] = [
  {
    id: 'continental',
    title: 'Café Continental',
    description: 'Pães, frutas, sucos e café.',
    price: 25,
    images: [DEFAULT_IMG],
    behaviorTags: ['casal'],
  },
  {
    id: 'executivo',
    title: 'Café Executivo',
    description: 'Buffet completo com omelete e frios.',
    price: 45,
    images: [
      'https://images.unsplash.com/photo-1525351484163-752d94143d4f?w=600&h=400&fit=crop',
    ],
    behaviorTags: ['familia', 'casal'],
  },
  {
    id: 'completo',
    title: 'Café Completo',
    description: 'Buffet premium com sobremesas e bebidas especiais.',
    price: 65,
    images: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop',
    ],
    behaviorTags: ['familia'],
  },
];

export const ACCOMMODATION_ITEMS: AccommodationItem[] = [
  { id: 'lencol', title: 'Lençol', price: 10, unit: 'un' },
  { id: 'fronha', title: 'Fronha', price: 5, unit: 'un' },
  { id: 'toalha', title: 'Toalha de banho', price: 8, unit: 'un' },
  { id: 'cobertor', title: 'Cobertor', price: 15, unit: 'un' },
  { id: 'travesseiro', title: 'Travesseiro extra', price: 12, unit: 'un' },
];

export const ACCOMMODATION_KITS: AccommodationKit[] = [
  {
    id: 'kit-casal',
    title: 'Kit Casal',
    description: 'Lençol casal, 2 fronhas, 2 toalhas e cobertor.',
    price: 70,
    items: ['lencol', 'fronha', 'fronha', 'toalha', 'toalha', 'cobertor'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
    ],
    behaviorTags: ['casal'],
  },
  {
    id: 'kit-familia',
    title: 'Kit Família',
    description: 'Lençóis, fronhas e toalhas para até 4 pessoas.',
    price: 120,
    items: ['lencol', 'lencol', 'fronha', 'fronha', 'fronha', 'fronha', 'toalha', 'toalha', 'toalha', 'toalha'],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
    ],
    behaviorTags: ['familia'],
  },
  {
    id: 'kit-individual',
    title: 'Kit Individual',
    description: 'Lençol solteiro, fronha, toalha e travesseiro.',
    price: 40,
    items: ['lencol', 'fronha', 'toalha', 'travesseiro'],
    images: [DEFAULT_IMG],
    behaviorTags: ['aventura'],
  },
];

export function getBreakfastById(id: string | null): BreakfastOption | undefined {
  return BREAKFAST_OPTIONS.find((b) => b.id === id);
}

export function getAccommodationKitById(id: string | null): AccommodationKit | undefined {
  return ACCOMMODATION_KITS.find((k) => k.id === id);
}

export function getAccommodationItemsByIds(ids: string[]): AccommodationItem[] {
  return ACCOMMODATION_ITEMS.filter((i) => ids.includes(i.id));
}
