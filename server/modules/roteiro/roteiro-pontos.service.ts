import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { empreendimentos } from '../../../backend/src/db/schema/empreendimentos';
import { propostas } from '../../../backend/src/db/schema/propostas';
import { roteiroPontos } from '../../../backend/src/db/schema/roteiro-pontos';
import { resolverHotelIdParaAcomodacoes } from '../acomodacoes/services/resolve-hotel-id';

const STATUS_PERMITIDO = ['accepted', 'paid'] as const;

export type RoteiroPontoDto = {
  id: number;
  tipo: string;
  titulo: string;
  descricao: string | null;
  lat: number;
  lng: number;
  dia: number | null;
  ordem: number | null;
};

export type RoteiroBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type RoteiroPontosPayload = {
  pontos: RoteiroPontoDto[];
  bounds: RoteiroBounds | null;
};

export type GetPontosByTokenResult =
  | { kind: 'ok'; data: RoteiroPontosPayload }
  | { kind: 'not_found' }
  | { kind: 'forbidden'; propostaStatus: string };

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

export function calcularBounds(
  pontos: Pick<RoteiroPontoDto, 'lat' | 'lng'>[],
): RoteiroBounds | null {
  if (pontos.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const ponto of pontos) {
    minLat = Math.min(minLat, ponto.lat);
    maxLat = Math.max(maxLat, ponto.lat);
    minLng = Math.min(minLng, ponto.lng);
    maxLng = Math.max(maxLng, ponto.lng);
  }

  return { minLat, maxLat, minLng, maxLng };
}

export async function listarPontos(hotelId: number): Promise<RoteiroPontoDto[]> {
  const rows = await db
    .select({
      id: roteiroPontos.id,
      tipo: roteiroPontos.tipo,
      titulo: roteiroPontos.titulo,
      descricao: roteiroPontos.descricao,
      lat: roteiroPontos.lat,
      lng: roteiroPontos.lng,
      dia: roteiroPontos.dia,
      ordem: roteiroPontos.ordem,
    })
    .from(roteiroPontos)
    .where(and(eq(roteiroPontos.hotelId, hotelId), eq(roteiroPontos.ativo, true)))
    .orderBy(asc(roteiroPontos.dia), asc(roteiroPontos.ordem));

  return rows.map((row: {
    id: number;
    tipo: string;
    titulo: string;
    descricao: string | null;
    lat: unknown;
    lng: unknown;
    dia: number | null;
    ordem: number | null;
  }) => ({
    id: row.id,
    tipo: row.tipo,
    titulo: row.titulo,
    descricao: row.descricao,
    lat: toNumber(row.lat),
    lng: toNumber(row.lng),
    dia: row.dia,
    ordem: row.ordem,
  }));
}

async function resolverEmpreendimentoId(
  hotelKey: string,
  titleHint?: string | null,
): Promise<number | null> {
  const slug = await resolverHotelIdParaAcomodacoes(hotelKey, titleHint);
  if (!slug) return null;

  const [row] = await db
    .select({ id: empreendimentos.id })
    .from(empreendimentos)
    .where(eq(empreendimentos.hotelId, slug))
    .limit(1);

  return row?.id ?? null;
}

function extrairHotelKey(
  metadata: Record<string, unknown> | null | undefined,
  conteudo: Record<string, unknown> | null | undefined,
): { hotelKey: string | null; titleHint: string | null } {
  const metaHotel =
    typeof metadata?.hotelId === 'string' && metadata.hotelId.trim()
      ? metadata.hotelId.trim()
      : null;

  const inclusions = conteudo?.inclusions as { hotel?: string } | undefined;
  const hotelNome =
    typeof inclusions?.hotel === 'string' && inclusions.hotel.trim()
      ? inclusions.hotel.trim()
      : null;

  return {
    hotelKey: metaHotel,
    titleHint: hotelNome,
  };
}

export async function getPontosByToken(token: string): Promise<GetPontosByTokenResult> {
  const trimmed = token.trim();
  if (!trimmed) return { kind: 'not_found' };

  const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, trimmed));
  if (!row || !row.isPublica) return { kind: 'not_found' };

  if (!STATUS_PERMITIDO.includes(row.status as (typeof STATUS_PERMITIDO)[number])) {
    return { kind: 'forbidden', propostaStatus: row.status };
  }

  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  const conteudo = (row.conteudo ?? {}) as Record<string, unknown>;
  const { hotelKey, titleHint } = extrairHotelKey(metadata, conteudo);

  if (!hotelKey && !titleHint) {
    return { kind: 'ok', data: { pontos: [], bounds: null } };
  }

  const empreendimentoId = await resolverEmpreendimentoId(hotelKey ?? titleHint ?? '', titleHint);
  if (!empreendimentoId) {
    return { kind: 'ok', data: { pontos: [], bounds: null } };
  }

  const pontos = await listarPontos(empreendimentoId);
  return {
    kind: 'ok',
    data: {
      pontos,
      bounds: calcularBounds(pontos),
    },
  };
}

module.exports = {
  calcularBounds,
  listarPontos,
  getPontosByToken,
};
