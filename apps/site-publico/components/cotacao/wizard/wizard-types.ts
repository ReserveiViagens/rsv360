import { normalizeImageList } from '@/lib/cotacao-image-utils';
import { countWizardNights, WIZARD_MIN_NIGHTS } from '@rsv360/shared';

export { WIZARD_MIN_NIGHTS, countWizardNights as countNights };

export type WizardProfile = 'familia' | 'casal' | 'aventura';
export type PaymentMethod = 'pix' | 'credit';
export type AccommodationMode = 'kit' | 'items';

export interface AvailabilityItem {
  id: number | string;
  contentId?: string;
  type: 'hotel' | 'ticket' | 'attraction';
  title: string;
  description?: string;
  price: number;
  location?: string;
  images: string[];
  metadata?: Record<string, unknown>;
  available: boolean;
  unavailableReason?: string;
}

export interface CotacaoPanelConfig {
  permitirApenasHotel: boolean;
  disparoAutomatizadoCaldasAi: boolean;
  delayDisparoMinutos: number;
}

export interface WizardState {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  hotelId: number | string | null;
  ticketIds: (number | string)[];
  attractionIds: (number | string)[];
  breakfastId: string | null;
  accommodationMode: AccommodationMode;
  accommodationKitId: string | null;
  accommodationItemIds: string[];
  suiteUpgrade: boolean;
  travelInsurance: boolean;
  hotelOnlyFlow: boolean;
  name: string;
  email: string;
  phone: string;
  notes: string;
  paymentMethod: PaymentMethod;
  profile: WizardProfile;
  ref?: string | null;
  canal?: string | null;
  selectedAcomodacaoId: number | null;
  wizardAddonIds: number[];
  /** Upgrade varanda por unidade (ATR-SUV / AQR-FAM). */
  upgradeVaranda: boolean;
  /** Valor R$/noite do upgrade (calibrável via metadata). */
  upgradeVarandaValor: number;
}

export interface WizardCatalog {
  hotels: AvailabilityItem[];
  tickets: AvailabilityItem[];
  attractions: AvailabilityItem[];
  configuracoesPainel?: CotacaoPanelConfig;
}

export const WIZARD_STORAGE_KEY = 'rsv360-cotacao-wizard-v2';
export const WIZARD_STEP_STORAGE_KEY = 'rsv360-cotacao-wizard-v2-step';
export const WIZARD_CATALOG_STORAGE_KEY = 'rsv360-cotacao-wizard-v2-catalog';
export const WIZARD_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const TOTAL_STEPS = 8;

export const initialWizardState: WizardState = {
  checkIn: '',
  checkOut: '',
  adults: 2,
  children: 0,
  hotelId: null,
  ticketIds: [],
  attractionIds: [],
  breakfastId: null,
  accommodationMode: 'kit',
  accommodationKitId: null,
  accommodationItemIds: [],
  suiteUpgrade: false,
  travelInsurance: false,
  hotelOnlyFlow: false,
  name: '',
  email: '',
  phone: '',
  notes: '',
  paymentMethod: 'pix',
  profile: 'casal',
  selectedAcomodacaoId: null,
  wizardAddonIds: [],
  upgradeVaranda: false,
  upgradeVarandaValor: 0,
};

export interface StoredWizardDraft {
  state: WizardState;
  step: number;
  savedAt: number;
}

export function catalogItemFromHotel(h: Hotel, available = true): AvailabilityItem {
  const meta = (h.metadata ?? {}) as Record<string, unknown>;
  const metaImages = normalizeImageList(meta.images);
  return {
    id: h.id,
    contentId: h.content_id,
    type: 'hotel',
    title: h.title,
    description: h.description,
    price: h.price ?? 0,
    location: h.location,
    images: metaImages.length ? metaImages : h.images?.length ? h.images : [],
    metadata: meta,
    available,
  };
}

export function catalogItemFromTicket(t: Ticket, available = true): AvailabilityItem {
  const meta = (t.metadata ?? {}) as Record<string, unknown>;
  const metaImages = normalizeImageList(meta.images);
  return {
    id: t.id,
    contentId: t.content_id,
    type: 'ticket',
    title: t.title,
    description: t.description,
    price: t.price ?? 0,
    location: t.location,
    images: metaImages.length ? metaImages : t.images?.length ? t.images : [],
    metadata: meta,
    available,
  };
}

export function catalogItemFromAttraction(a: Attraction, available = true): AvailabilityItem {
  const meta = (a.metadata ?? {}) as Record<string, unknown>;
  const metaImages = normalizeImageList(meta.images);
  return {
    id: a.id,
    contentId: a.content_id,
    type: 'attraction',
    title: a.title,
    description: a.description,
    price: a.price ?? 0,
    location: a.location,
    images: metaImages.length ? metaImages : a.images?.length ? a.images : [],
    metadata: meta,
    available,
  };
}


export function formatDateBR(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
