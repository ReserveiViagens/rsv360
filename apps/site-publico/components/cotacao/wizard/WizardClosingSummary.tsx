'use client';

import { useState } from 'react';
import { Check, FileText, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import {
  getAccommodationItemsByIds,
  getAccommodationKitById,
  getBreakfastById,
  type AccommodationItem,
  type AccommodationKit,
  type BreakfastOption,
} from '@/lib/cotacao-catalog';
import { getBehaviorBadge } from './wizard-behavior';
import {
  getClosingHeadline,
  getItemPersuasiveLine,
  getScarcityHint,
} from './wizard-closing-copy';
import { formatBRL } from './wizard-pricing';
import type { AvailabilityItem, WizardCatalog, WizardState } from './wizard-types';
import { countNights } from './wizard-types';
import { RoteiroOverview } from '@/components/cotacao/roteiro/RoteiroOverview';
import { SelectionDetailModal } from './SelectionDetailModal';
import {
  buildAttractionVoucher,
  buildBreakfastVoucher,
  buildHotelVoucher,
  buildInsuranceVoucher,
  buildItemsVoucher,
  buildKitVoucher,
  buildTicketVoucher,
  type SelectionVoucherDetails,
} from './wizard-selection-voucher';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop';

function itemImage(item: AvailabilityItem | undefined, fallback = FALLBACK_IMG): string {
  if (!item) return fallback;
  const metaImages = item.metadata?.images;
  if (Array.isArray(metaImages) && metaImages.length) return String(metaImages[0]);
  if (item.images.length) return item.images[0];
  return fallback;
}

interface SelectionRowProps {
  image: string;
  title: string;
  persuasiveLine: string;
  priceLabel: string;
  badge?: string;
  details?: SelectionVoucherDetails;
  onViewDetails?: () => void;
}

function SelectionRow({
  image,
  title,
  persuasiveLine,
  priceLabel,
  badge,
  onViewDetails,
}: SelectionRowProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
        <ImageWithFallback
          src={image}
          alt={title}
          className="h-full w-full"
          fallbackSrc={FALLBACK_IMG}
          objectFit="cover"
        />
        <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-lime">
          <Check className="h-3 w-3 text-gray-900" strokeWidth={3} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-2">
          <p className="font-semibold text-gray-900">{title}</p>
          {badge && (
            <span className="rounded-full bg-accent-lime/30 px-2 py-0.5 text-[10px] font-semibold text-gray-800">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{persuasiveLine}</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-bold text-primary">{priceLabel}</p>
          {onViewDetails && (
            <button
              type="button"
              onClick={onViewDetails}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <FileText className="h-3.5 w-3.5" />
              Ver detalhes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function buildCatalogRows(
  state: WizardState,
  catalog: WizardCatalog,
  nights: number,
  guests: number,
): SelectionRowProps[] {
  const rows: SelectionRowProps[] = [];
  const profile = state.profile;

  const hotel = catalog.hotels.find(
    (h) => h.id === state.hotelId || h.contentId === state.hotelId,
  );
  if (hotel) {
    let hotelTotal = hotel.price * nights;
    if (state.suiteUpgrade) hotelTotal += 80 * nights;
    if (state.upgradeVaranda && state.upgradeVarandaValor > 0) {
      hotelTotal += state.upgradeVarandaValor * nights;
    }
    const titleParts = [hotel.title];
    if (state.suiteUpgrade) titleParts.push('Suíte Master');
    if (state.upgradeVaranda) titleParts.push('Varanda/vista');
    rows.push({
      image: itemImage(hotel),
      title: titleParts.join(' + '),
      persuasiveLine: getItemPersuasiveLine('hotel', profile),
      priceLabel: `${formatBRL(hotelTotal)} · ${nights} noite${nights !== 1 ? 's' : ''}`,
      badge: getBehaviorBadge(hotel, profile),
      details: buildHotelVoucher(hotel, state, nights, guests),
    });
  }

  for (const ticketId of state.ticketIds) {
    const ticket = catalog.tickets.find(
      (t) => t.id === ticketId || t.contentId === ticketId,
    );
    if (ticket) {
      rows.push({
        image: itemImage(ticket),
        title: ticket.title,
        persuasiveLine: getItemPersuasiveLine('ticket', profile),
        priceLabel: `${formatBRL(ticket.price * guests)} · ${guests} ingresso${guests !== 1 ? 's' : ''}`,
        badge: getBehaviorBadge(ticket, profile),
        details: buildTicketVoucher(ticket, state, guests),
      });
    }
  }

  for (const attrId of state.attractionIds) {
    const attr = catalog.attractions.find(
      (a) => a.id === attrId || a.contentId === attrId,
    );
    if (attr) {
      rows.push({
        image: itemImage(attr),
        title: attr.title,
        persuasiveLine: getItemPersuasiveLine('attraction', profile),
        priceLabel: `${formatBRL(attr.price * guests)} · ${guests} pessoa${guests !== 1 ? 's' : ''}`,
        badge: getBehaviorBadge(attr, profile),
        details: buildAttractionVoucher(attr, guests),
      });
    }
  }

  const breakfast = getBreakfastById(state.breakfastId);
  if (breakfast) {
    rows.push(buildBreakfastRow(breakfast, profile, nights, guests, state));
  }

  if (state.accommodationMode === 'kit' && state.accommodationKitId) {
    const kit = getAccommodationKitById(state.accommodationKitId);
    if (kit) rows.push(buildKitRow(kit, profile, guests));
  } else if (state.accommodationMode === 'items' && state.accommodationItemIds.length) {
    const items = getAccommodationItemsByIds(state.accommodationItemIds);
    rows.push(buildItemsRow(items, profile));
  }

  if (state.travelInsurance) {
    rows.push({
      image: FALLBACK_IMG,
      title: 'Seguro Assistência Local',
      persuasiveLine: 'Proteção para emergências e acidentes leves em parques aquáticos.',
      priceLabel: `${formatBRL(15 * guests)} · ${guests} pessoa${guests !== 1 ? 's' : ''}`,
      details: buildInsuranceVoucher(guests),
    });
  }

  return rows;
}

function buildBreakfastRow(
  breakfast: BreakfastOption,
  profile: WizardState['profile'],
  nights: number,
  guests: number,
  state: WizardState,
): SelectionRowProps {
  const total = breakfast.price * guests * nights;
  return {
    image: breakfast.images[0] ?? FALLBACK_IMG,
    title: breakfast.title,
    persuasiveLine: getItemPersuasiveLine('breakfast', profile),
    priceLabel: `${formatBRL(total)} · ${guests} pessoa${guests !== 1 ? 's' : ''}/dia`,
    details: buildBreakfastVoucher(breakfast, state, nights, guests),
  };
}

function buildKitRow(
  kit: AccommodationKit,
  profile: WizardState['profile'],
  guests: number,
): SelectionRowProps {
  return {
    image: kit.images[0] ?? FALLBACK_IMG,
    title: kit.title,
    persuasiveLine: getItemPersuasiveLine('kit', profile),
    priceLabel: `${formatBRL(kit.price)} · por estadia`,
    details: buildKitVoucher(kit, guests),
  };
}

function buildItemsRow(
  items: AccommodationItem[],
  profile: WizardState['profile'],
): SelectionRowProps {
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return {
    image: FALLBACK_IMG,
    title: items.map((i) => i.title).join(', '),
    persuasiveLine: getItemPersuasiveLine('items', profile),
    priceLabel: formatBRL(total),
    details: buildItemsVoucher(items),
  };
}

interface WizardClosingSummaryProps {
  state: WizardState;
  catalog: WizardCatalog;
  runningTotal: number;
  loading?: boolean;
}

export function WizardClosingSummary({ state, catalog, runningTotal, loading }: WizardClosingSummaryProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeDetails, setActiveDetails] = useState<SelectionVoucherDetails | null>(null);

  const nights = countNights(state.checkIn, state.checkOut);
  const guests = state.adults + state.children;
  const headline = getClosingHeadline(state.profile, nights, guests);
  const rows = buildCatalogRows(state, catalog, nights, guests);

  const hotel = catalog.hotels.find(
    (h) => h.id === state.hotelId || h.contentId === state.hotelId,
  );
  const scarcityMeta = hotel?.metadata?.scarcity as { unitsLeft?: number } | undefined;
  const socialMeta = hotel?.metadata?.socialProof as { bookings24h?: number } | undefined;
  const scarcity = getScarcityHint(scarcityMeta?.unitsLeft, socialMeta?.bookings24h);

  const previewTitle = hotel?.title
    ? `${hotel.title} — Caldas Novas`
    : 'Caldas Novas Premium';

  const openDetails = (details: SelectionVoucherDetails) => {
    setActiveDetails(details);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent-lime/20 to-primary/5 p-5 text-center">
        <div className="mb-2 flex justify-center">
          <Sparkles className="h-6 w-6 text-accent-lime" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{headline.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{headline.subtitle}</p>
        {scarcity && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            {scarcity}
          </p>
        )}
      </div>

      <RoteiroOverview
        title={previewTitle}
        nights={nights}
        guests={guests}
        destination="Caldas Novas, GO"
      />

      {rows.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            O que você escolheu
          </h3>
          <div className="space-y-2">
            {rows.map((row, i) => (
              <SelectionRow
                key={`${row.title}-${i}`}
                {...row}
                onViewDetails={row.details ? () => openDetails(row.details!) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {loading && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-muted-foreground">
          Carregando suas escolhas...
        </div>
      )}

      {!loading && rows.length === 0 && (state.hotelId || state.breakfastId) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900">
          Não foi possível carregar os detalhes do catálogo. Clique em &quot;Reiniciar cotação&quot; e
          percorra os passos novamente.
        </div>
      )}

      <div className="rounded-xl border-2 border-accent-lime/40 bg-accent-lime/10 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Investimento total estimado</p>
            <p className="text-2xl font-bold text-gray-900" suppressHydrationWarning>
              {formatBRL(runningTotal)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{headline.ctaHint}</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent-lime px-3 py-1 text-xs font-bold text-gray-900">
            Roteiro aprovado ✓
          </span>
        </div>
      </div>

      <SelectionDetailModal
        details={activeDetails}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
