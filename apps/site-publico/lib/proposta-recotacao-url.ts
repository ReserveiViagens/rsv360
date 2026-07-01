export interface RecotacaoPropostaInput {
  tokenPublico?: string | null;
  metadata?: Record<string, unknown> | null;
  conteudo?: Record<string, unknown> | null;
}

function readString(obj: Record<string, unknown> | null | undefined, key: string): string | null {
  const v = obj?.[key];
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function readNumber(obj: Record<string, unknown> | null | undefined, key: string): number | null {
  const v = obj?.[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function appendCotacaoParams(
  siteUrl: string,
  params: URLSearchParams,
): string {
  const base = siteUrl.replace(/\/$/, '');
  const path = `/cotacao?${params.toString()}`;
  return base ? `${base}${path}` : path;
}

/** Monta deep-link para nova cotação com contexto da proposta expirada. */
export function buildRecotacaoUrlFromProposta(
  input: RecotacaoPropostaInput,
  siteUrl = '',
): string {
  const metadata = (input.metadata ?? {}) as Record<string, unknown>;
  const inclusions = (input.conteudo?.inclusions ?? {}) as Record<string, unknown>;

  const hotelId =
    readString(metadata, 'hotelId') ??
    readString(metadata, 'hotel_id') ??
    readString(inclusions, 'hotelId');

  const checkin = readString(metadata, 'checkIn') ?? readString(metadata, 'checkin');
  const checkout = readString(metadata, 'checkOut') ?? readString(metadata, 'checkout');
  const adults = readNumber(metadata, 'adults');
  const children = readNumber(metadata, 'children');
  const guests = readNumber(inclusions, 'guests');
  const resolvedAdults = adults ?? (guests != null ? Math.max(1, guests - (children ?? 0)) : null);

  const params = new URLSearchParams();
  if (hotelId) params.set('hotel', hotelId);
  if (checkin) params.set('checkin', checkin);
  if (checkout) params.set('checkout', checkout);
  if (resolvedAdults != null) params.set('adults', String(resolvedAdults));
  if (children != null) params.set('children', String(children));
  if (input.tokenPublico) params.set('ref', input.tokenPublico);
  params.set('canal', 'proposta-expirada');

  return appendCotacaoParams(siteUrl, params);
}
