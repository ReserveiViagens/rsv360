import {
  getAccommodationItemsByIds,
  getAccommodationKitById,
  getBreakfastById,
} from '@/lib/cotacao-catalog';
import type { AvailabilityItem, WizardCatalog, WizardState } from './wizard-types';
import { countNights } from './wizard-types';
import { sumUpgradeVaranda } from '@rsv360/shared';

function findItem(catalog: WizardCatalog, type: string, id: number | string | null): AvailabilityItem | undefined {
  if (id == null) return undefined;
  const list =
    type === 'hotel' ? catalog.hotels : type === 'ticket' ? catalog.tickets : catalog.attractions;
  return list.find((i) => i.id === id || i.contentId === id);
}

export const TRAVEL_INSURANCE_PRICE_PER_GUEST = 15;
/** @deprecated use wizard_addons via API */
export const SUITE_UPGRADE_PRICE_PER_NIGHT = 80;

export interface WizardAddonPricing {
  id: number;
  nome?: string;
  descricao?: string;
  precoTipo: string;
  valor: number;
}

export { sumUpgradeVaranda };

export function sumWizardAddons(
  addons: WizardAddonPricing[],
  selectedIds: number[],
  nights: number,
  guests: number,
): number {
  let total = 0;
  for (const id of selectedIds) {
    const addon = addons.find((a) => a.id === id);
    if (!addon) continue;
    const v = addon.valor;
    switch (addon.precoTipo) {
      case 'por_noite':
        total += v * nights;
        break;
      case 'por_estadia':
        total += v;
        break;
      case 'por_pessoa':
        total += v * guests;
        break;
      case 'por_pessoa_noite':
        total += v * guests * nights;
        break;
      default:
        total += v;
    }
  }
  return total;
}

export function calculateWizardTotal(
  state: WizardState,
  catalog: WizardCatalog,
  addons: WizardAddonPricing[] = [],
): number {
  let total = 0;
  const nights = countNights(state.checkIn, state.checkOut);
  const guests = state.adults + state.children;

  const hotel = findItem(catalog, 'hotel', state.hotelId);
  if (hotel) {
    let hotelTotal = hotel.price * Math.max(nights, 1);
    if (state.wizardAddonIds.length > 0 && addons.length > 0) {
      hotelTotal += sumWizardAddons(addons, state.wizardAddonIds, Math.max(nights, 1), guests);
    } else if (state.suiteUpgrade) {
      hotelTotal += SUITE_UPGRADE_PRICE_PER_NIGHT * Math.max(nights, 1);
    }
    hotelTotal += sumUpgradeVaranda(
      state.upgradeVaranda,
      state.upgradeVarandaValor,
      Math.max(nights, 1),
    );
    total += hotelTotal;
  }

  for (const ticketId of state.ticketIds) {
    const ticket = findItem(catalog, 'ticket', ticketId);
    if (ticket) total += ticket.price * guests;
  }

  for (const attrId of state.attractionIds) {
    const attr = findItem(catalog, 'attraction', attrId);
    if (attr) total += attr.price * guests;
  }

  const breakfast = getBreakfastById(state.breakfastId);
  if (breakfast) total += breakfast.price * guests * Math.max(nights, 1);

  if (state.accommodationMode === 'kit' && state.accommodationKitId) {
    const kit = getAccommodationKitById(state.accommodationKitId);
    if (kit) total += kit.price;
  } else if (state.accommodationMode === 'items') {
    const items = getAccommodationItemsByIds(state.accommodationItemIds);
    total += items.reduce((sum, i) => sum + i.price, 0);
  }

  if (state.travelInsurance) {
    total += TRAVEL_INSURANCE_PRICE_PER_GUEST * guests;
  }

  return total;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
