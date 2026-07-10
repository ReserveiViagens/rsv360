import {
  isPropostaExpirada,
  type PropostaExpiradaRow,
} from './proposta-validade';

export const PROPOSTA_STATUS_POS_ACEITE = ['accepted', 'paid', 'converted'] as const;

export type PropostaPublicaRow = PropostaExpiradaRow & {
  id: number;
  titulo: string;
  clienteNome: string | null;
  valorTotal?: string | null;
  moeda?: string | null;
  conteudo?: unknown;
  metadata?: unknown;
  tokenPublico?: string | null;
  comparativoCache?: unknown;
  exibirComparativo?: boolean | null;
};

export function isPropostaPosAceite(status: string | null | undefined): boolean {
  return (
    status != null &&
    (PROPOSTA_STATUS_POS_ACEITE as readonly string[]).includes(status)
  );
}

export function deveRedactarPropostaPublica(row: PropostaPublicaRow): boolean {
  return isPropostaExpirada(row) && !isPropostaPosAceite(row.status);
}

function publicSiteBase(): string {
  return (
    process.env.COTACAO_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
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

export function buildRecotacaoUrlForProposta(row: PropostaPublicaRow): string {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  const conteudo = (row.conteudo ?? {}) as Record<string, unknown>;
  const inclusions = (conteudo.inclusions ?? {}) as Record<string, unknown>;

  const hotelId =
    readString(metadata, 'hotelId') ??
    readString(metadata, 'hotel_id') ??
    readString(inclusions, 'hotelId');
  const checkin = readString(metadata, 'checkIn') ?? readString(metadata, 'checkin');
  const checkout = readString(metadata, 'checkOut') ?? readString(metadata, 'checkout');
  const adults = readNumber(metadata, 'adults');
  const children = readNumber(metadata, 'children');
  const guests = readNumber(inclusions, 'guests');
  const resolvedAdults =
    adults ?? (guests != null ? Math.max(1, guests - (children ?? 0)) : null);

  const params = new URLSearchParams();
  if (hotelId) params.set('hotel', hotelId);
  if (checkin) params.set('checkin', checkin);
  if (checkout) params.set('checkout', checkout);
  if (resolvedAdults != null) params.set('adults', String(resolvedAdults));
  if (children != null) params.set('children', String(children));
  if (row.tokenPublico) params.set('ref', row.tokenPublico);
  params.set('canal', 'proposta-expirada');

  const base = publicSiteBase();
  return `${base}/cotacao?${params.toString()}`;
}

export function buildWhatsappUrlForProposta(row: PropostaPublicaRow): string {
  const numero =
    process.env.CONSULTOR_WHATSAPP_E164?.replace(/\D/g, '') || '5564999999999';
  const token = row.tokenPublico ?? '';
  const texto = `Olá! Minha proposta "${row.titulo}" (${token}) expirou. Gostaria de atualizar as tarifas.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export type PropostaPublicaResponse = Record<string, unknown>;

/** Payload completo ou mínimo (proposta expirada não aceita). */
export function buildPropostaPublicaResponse(row: PropostaPublicaRow): PropostaPublicaResponse {
  if (deveRedactarPropostaPublica(row)) {
    return {
      id: row.id,
      tokenPublico: row.tokenPublico,
      status: 'expired',
      validoAte: row.validoAte,
      tituloResumo: row.titulo,
      titulo: row.titulo,
      clienteNome: row.clienteNome,
      recotacaoUrl: buildRecotacaoUrlForProposta(row),
      whatsappUrl: buildWhatsappUrlForProposta(row),
      payloadReduzido: true,
    };
  }

  return {
    id: row.id,
    titulo: row.titulo,
    clienteNome: row.clienteNome,
    valorTotal: row.valorTotal,
    moeda: row.moeda,
    status: row.status,
    validoAte: row.validoAte,
    conteudo: row.conteudo,
    metadata: row.metadata,
    tokenPublico: row.tokenPublico,
    comparativoCache: row.comparativoCache ?? undefined,
    exibirComparativo: row.exibirComparativo ?? false,
    payloadReduzido: false,
  };
}

module.exports = {
  PROPOSTA_STATUS_POS_ACEITE,
  isPropostaPosAceite,
  deveRedactarPropostaPublica,
  buildPropostaPublicaResponse,
  buildRecotacaoUrlForProposta,
  buildWhatsappUrlForProposta,
};
