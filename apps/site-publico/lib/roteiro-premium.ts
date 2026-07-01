import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';

export interface PropostaOgData {
  title: string;
  description: string;
  imageUrl: string;
  destination: string;
  clienteNome: string;
  siteName: string;
}

export async function fetchPropostaOg(token: string): Promise<PropostaOgData | null> {
  const backend = getFase1BackendBaseUrl();
  const res = await fetch(`${backend}/api/v1/propostas/${encodeURIComponent(token)}/og`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  return (json?.data as PropostaOgData) ?? null;
}

export interface RoteiroDay {
  id: string;
  day: number;
  title: string;
  description: string;
  image?: string;
  videoUrl?: string;
  actionLabel?: string;
  type?: string;
  mood?: string;
}

export interface RoteiroPremiumData {
  id: number;
  titulo: string;
  clienteNome: string;
  valorTotal: string;
  moeda?: string;
  status: string;
  tokenPublico?: string;
  conteudo?: {
    dailySchedule?: RoteiroDay[];
    inclusions?: {
      nights?: number;
      guests?: number;
      destination?: string;
      previewTitle?: string;
      hotel?: string;
    };
    media?: { heroImage?: string };
    previewTitle?: string;
  };
  metadata?: { checkIn?: string; checkOut?: string; hotelId?: string; adults?: number; children?: number };
}

export type FetchRoteiroResult =
  | { ok: true; data: RoteiroPremiumData }
  | { ok: false; reason: 'not_found' | 'denied' | 'error' };

export async function fetchRoteiroPremium(token: string): Promise<FetchRoteiroResult> {
  const backend = getFase1BackendBaseUrl();
  const res = await fetch(
    `${backend}/api/v1/cotacao-publica/roteiro/${encodeURIComponent(token)}`,
    { cache: 'no-store' },
  );

  if (res.status === 403) return { ok: false, reason: 'denied' };
  if (res.status === 404) return { ok: false, reason: 'not_found' };
  if (!res.ok) return { ok: false, reason: 'error' };

  const json = await res.json().catch(() => ({}));
  if (!json?.data) return { ok: false, reason: 'not_found' };

  return { ok: true, data: json.data as RoteiroPremiumData };
}

export interface LazerAmenidades {
  piscinasTermais?: string[];
  ofuro?: string[];
  amenidades?: string[];
}

export function mapRoteiroPremiumView(data: RoteiroPremiumData, token: string) {
  const schedule = (data.conteudo?.dailySchedule ?? []).map((day, index) => ({
    ...day,
    id: day.id ?? `day-${day.day}-${index}`,
  }));
  const heroImage =
    data.conteudo?.media?.heroImage ??
    schedule[0]?.image ??
    'https://images.unsplash.com/photo-1571508601633-63bfea190214?w=1200&h=800&fit=crop';
  const heroVideo = schedule.find((d) => d.videoUrl)?.videoUrl;
  const title =
    data.conteudo?.inclusions?.previewTitle ??
    data.conteudo?.previewTitle ??
    data.titulo;
  const destination = data.conteudo?.inclusions?.destination ?? 'Caldas Novas, GO';
  const nights = data.conteudo?.inclusions?.nights ?? (schedule.length || 1);
  const guests = data.conteudo?.inclusions?.guests ?? 2;
  const total = parseFloat(data.valorTotal) || 0;
  const moeda = data.moeda ?? 'BRL';

  const whatsappMsg = encodeURIComponent(
    `Olá! Gostaria de confirmar meu roteiro premium "${data.titulo}" (token: ${token})`,
  );

  const meta = (data.metadata ?? {}) as Record<string, unknown>;
  const parseNum = (v: unknown): number | undefined => {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim()) {
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  return {
    token,
    propostaId: data.id,
    clienteNome: data.clienteNome,
    title,
    destination,
    nights,
    guests,
    heroImage,
    heroVideo,
    schedule,
    total,
    moeda,
    checkIn: data.metadata?.checkIn,
    checkOut: data.metadata?.checkOut,
    hotelId: typeof meta.hotelId === 'string' ? meta.hotelId : meta.hotelId != null ? String(meta.hotelId) : undefined,
    adults: parseNum(meta.adults),
    children: parseNum(meta.children),
    whatsappUrl: `https://wa.me/5564999999999?text=${whatsappMsg}`,
    status: data.status,
    lazer: (data.conteudo as { lazer?: LazerAmenidades } | undefined)?.lazer ?? null,
  };
}

export type RoteiroPremiumView = ReturnType<typeof mapRoteiroPremiumView>;

export function formatRoteiroCurrency(value: number, moeda = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(value);
}
