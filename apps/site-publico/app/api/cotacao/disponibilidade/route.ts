import { NextRequest, NextResponse } from 'next/server';
import { meetsWizardMinNights, WIZARD_MIN_NIGHTS } from '@rsv360/shared';
import { getWebsiteContent } from '@/lib/db';
import { normalizeImageList, resolvePublicMediaList } from '@/lib/cotacao-image-utils';
import {
  catalogItemFromAttraction,
  catalogItemFromHotel,
  catalogItemFromTicket,
  countNights,
  type AvailabilityItem,
  type CotacaoPanelConfig,
  type TaxaHospedePublicaConfig,
} from '@/components/cotacao/wizard/wizard-types';

const FALLBACK_IMAGES = {
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
  ticket: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop',
  attraction: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
};

interface HubOferta {
  fornecedorId: string;
  titulo: string;
  descricao: string;
  valorTotal: number;
  noites?: number;
  imagens?: string[];
  disponibilidade?: number;
  metadata?: Record<string, unknown>;
}

function enrichImages(item: AvailabilityItem, fallback: string): AvailabilityItem {
  const resolved = resolvePublicMediaList(item.images);
  if (resolved.length) return { ...item, images: resolved };
  const metaImages = resolvePublicMediaList(normalizeImageList(item.metadata?.images));
  if (metaImages.length) return { ...item, images: metaImages };
  return { ...item, images: [fallback] };
}

function checkAvailability(
  item: AvailabilityItem,
  guests: number,
  nights: number,
): AvailabilityItem {
  if (nights <= 0) {
    return { ...item, available: false, unavailableReason: 'Datas inválidas' };
  }
  const maxGuests = item.metadata?.maxGuests as number | undefined;
  if (maxGuests && guests > maxGuests) {
    return {
      ...item,
      available: false,
      unavailableReason: `Capacidade máxima: ${maxGuests} hóspedes`,
    };
  }
  return { ...item, available: true };
}

function slugId(prefix: string, title: string): string {
  return `${prefix}-${title.toLowerCase().replace(/\s+/g, '-').slice(0, 40)}`;
}

function mapHubHotel(o: HubOferta, nights: number, guests: number): AvailabilityItem {
  const n = Math.max(o.noites ?? nights, 1);
  const item: AvailabilityItem = {
    id: slugId('hub-hotel', o.titulo),
    type: 'hotel',
    title: o.titulo,
    description: o.descricao,
    price: o.valorTotal / n,
    location: 'Caldas Novas, GO',
    images: o.imagens ?? [],
    metadata: {
      ...o.metadata,
      hubSource: true,
      fornecedorId: o.fornecedorId,
      scarcity: o.disponibilidade != null ? { unitsLeft: o.disponibilidade } : undefined,
    },
    available: true,
  };
  return enrichImages(checkAvailability(item, guests, nights), FALLBACK_IMAGES.hotel);
}

function mapHubTicket(o: HubOferta, nights: number, guests: number): AvailabilityItem {
  const item: AvailabilityItem = {
    id: slugId('hub-ticket', o.titulo),
    type: 'ticket',
    title: o.titulo,
    description: o.descricao,
    price: guests > 0 ? o.valorTotal / guests : o.valorTotal,
    location: 'Caldas Novas, GO',
    images: o.imagens ?? [],
    metadata: { ...o.metadata, hubSource: true, fornecedorId: o.fornecedorId },
    available: true,
  };
  return enrichImages(checkAvailability(item, guests, nights), FALLBACK_IMAGES.ticket);
}

function parseTaxaHospedePublicaConfig(raw: unknown): TaxaHospedePublicaConfig | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (o.ativa !== true) return null;
  const pct = Number(o.pct);
  const nome = typeof o.nome === 'string' ? o.nome.trim().slice(0, 120) : '';
  const descricao = typeof o.descricao === 'string' ? o.descricao.trim().slice(0, 500) : '';
  if (!Number.isFinite(pct) || pct < 0 || pct > 10 || !nome) return null;
  return { ativa: true, pct, nome, descricao };
}

async function fetchTaxaHospedePublica(): Promise<TaxaHospedePublicaConfig | null> {
  const backendUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3002';
  try {
    const res = await fetch(
      `${backendUrl.replace(/\/$/, '')}/api/v1/cotacao-publica/taxa-hospede-publica`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    return parseTaxaHospedePublicaConfig(json.data);
  } catch {
    return null;
  }
}

async function fetchFromHub(
  checkIn: string,
  checkOut: string,
  guests: number,
): Promise<{ configuracoesPainel?: CotacaoPanelConfig; hubHotels: AvailabilityItem[]; hubTickets: AvailabilityItem[] }> {
  const backendUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3002';
  try {
    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/v1/cotacao-publica/buscar-ofertas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkin: checkIn, checkout: checkOut, hospedes: guests }),
      cache: 'no-store',
    });
    if (!res.ok) return { hubHotels: [], hubTickets: [] };
    const json = await res.json();
    const data = json.data ?? {};
    const nights = countNights(checkIn, checkOut);
    const hubHotels = (data.ofertasHospedagem ?? []).map((o: HubOferta) =>
      mapHubHotel(o, nights, guests),
    );
    const hubTickets = (data.ofertasIngressos ?? []).map((o: HubOferta) =>
      mapHubTicket(o, nights, guests),
    );
    return {
      configuracoesPainel: data.configuracoesPainel,
      hubHotels,
      hubTickets,
    };
  } catch {
    return { hubHotels: [], hubTickets: [] };
  }
}

function mergeByTitle(cms: AvailabilityItem[], hub: AvailabilityItem[]): AvailabilityItem[] {
  const seen = new Set(cms.map((i) => i.title.toLowerCase()));
  const extra = hub.filter((h) => !seen.has(h.title.toLowerCase()));
  return [...cms, ...extra];
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const checkIn = sp.get('checkIn') ?? '';
    const checkOut = sp.get('checkOut') ?? '';
    const adults = parseInt(sp.get('adults') ?? '1', 10) || 1;
    const children = parseInt(sp.get('children') ?? '0', 10) || 0;
    const guests = adults + children;
    const nights = countNights(checkIn, checkOut);

    if (checkIn && checkOut && !meetsWizardMinNights(checkIn, checkOut)) {
      return NextResponse.json(
        {
          success: false,
          error: `Estadia mínima de ${WIZARD_MIN_NIGHTS} noites para reservar.`,
        },
        { status: 400 },
      );
    }

    const hubData = await fetchFromHub(checkIn, checkOut, guests);
    const taxaHospedePublica = await fetchTaxaHospedePublica();

    const [hotelsRaw, ticketsRaw, attractionsRaw] = await Promise.all([
      getWebsiteContent('hotels').catch(() => []),
      getWebsiteContent('tickets').catch(() => []),
      getWebsiteContent('attractions').catch(() => []),
    ]);

    const mapHotel = (h: Record<string, unknown>) => {
      const metadata = (h.metadata ?? {}) as Record<string, unknown>;
      const item = catalogItemFromHotel(
        {
          id: h.id as number,
          content_id: h.content_id as string,
          title: h.title as string,
          description: (h.description as string) ?? '',
          price: (metadata.price as number) ?? 0,
          location: (metadata.location as string) ?? '',
          status: (h.status as 'active') ?? 'active',
          images: normalizeImageList(h.images ?? metadata.images),
          metadata,
          video_url: (h.video_url as string | null | undefined) ?? null,
          amenidades: h.amenidades,
        },
        true,
      );
      return enrichImages(checkAvailability(item, guests, nights), FALLBACK_IMAGES.hotel);
    };

    const mapTicket = (t: Record<string, unknown>) => {
      const metadata = (t.metadata ?? {}) as Record<string, unknown>;
      const item = catalogItemFromTicket(
        {
          id: t.id as number,
          content_id: t.content_id as string,
          title: t.title as string,
          description: (t.description as string) ?? '',
          price: (metadata.price as number) ?? 0,
          location: (metadata.location as string) ?? '',
          status: (t.status as 'active') ?? 'active',
          images: normalizeImageList(t.images ?? metadata.images),
          metadata,
          duration: '',
          ageGroup: '',
          category: '',
          rating: 0,
          is_featured: false,
          is_active: true,
          features: [],
        },
        true,
      );
      return enrichImages(checkAvailability(item, guests, nights), FALLBACK_IMAGES.ticket);
    };

    const mapAttraction = (a: Record<string, unknown>) => {
      const metadata = (a.metadata ?? {}) as Record<string, unknown>;
      const item = catalogItemFromAttraction(
        {
          id: a.id as number,
          content_id: a.content_id as string,
          title: a.title as string,
          description: (a.description as string) ?? '',
          price: (metadata.price as number) ?? 0,
          location: (metadata.location as string) ?? '',
          status: (a.status as 'active') ?? 'active',
          images: normalizeImageList(a.images ?? metadata.images),
          metadata,
        },
        true,
      );
      return enrichImages(checkAvailability(item, guests, nights), FALLBACK_IMAGES.attraction);
    };

    const cmsHotels = (Array.isArray(hotelsRaw) ? hotelsRaw : [])
      .filter((h: Record<string, unknown>) => h.status === 'active')
      .map(mapHotel);
    const cmsTickets = (Array.isArray(ticketsRaw) ? ticketsRaw : [])
      .filter((t: Record<string, unknown>) => t.status === 'active')
      .map(mapTicket);
    const attractions = (Array.isArray(attractionsRaw) ? attractionsRaw : [])
      .filter((a: Record<string, unknown>) => a.status === 'active')
      .map(mapAttraction);

    const hotels = mergeByTitle(cmsHotels, hubData.hubHotels);
    const tickets = mergeByTitle(cmsTickets, hubData.hubTickets);

    return NextResponse.json({
      success: true,
      data: {
        hotels,
        tickets,
        attractions,
        configuracoesPainel: hubData.configuracoesPainel ?? {
          permitirApenasHotel: true,
          disparoAutomatizadoCaldasAi: true,
          delayDisparoMinutos: 120,
        },
        taxaHospedePublica,
      },
      meta: { checkIn, checkOut, guests, nights },
    });
  } catch (error) {
    console.error('[disponibilidade]', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Erro ao verificar disponibilidade' },
      { status: 500 },
    );
  }
}
