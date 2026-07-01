import { eq, or, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { empreendimentos } from '../../../../backend/src/db/schema/empreendimentos';
import { CALDAS_EMPREENDIMENTOS_CATALOGO } from '../sync/caldas-empreendimentos-catalog';
import { slugify } from '../import/normalizar';

function normalizarNome(valor: string): string {
  return valor.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

/** Casa título do catálogo/hub com `hotel_id` canônico (ex.: "Piazza" → piazza-diroma). */
export function matchCaldasHotelIdByTitle(title: string): string | null {
  const t = normalizarNome(title);
  if (!t) return null;

  for (const item of CALDAS_EMPREENDIMENTOS_CATALOGO) {
    const oficial = normalizarNome(item.nomeOficial);
    if (t === oficial) return item.hotelId;
  }

  for (const item of CALDAS_EMPREENDIMENTOS_CATALOGO) {
    const oficial = normalizarNome(item.nomeOficial);
    if (oficial.includes(t) || t.includes(oficial)) return item.hotelId;
  }

  const firstWord = t.split(/\s+/)[0];
  if (firstWord.length >= 4) {
    for (const item of CALDAS_EMPREENDIMENTOS_CATALOGO) {
      const oficial = normalizarNome(item.nomeOficial);
      if (oficial.includes(firstWord)) return item.hotelId;
    }
  }

  return null;
}

function parseHubHotelKey(key: string): string | null {
  if (!key.startsWith('hub-hotel-')) return null;
  return key.slice('hub-hotel-'.length).replace(/-/g, ' ');
}

/**
 * Resolve chave da vitrine (contentId CMS, hub-hotel-*, slug) → hotel_id das acomodações.
 */
export async function resolverHotelIdParaAcomodacoes(
  key: string,
  titleHint?: string | null,
): Promise<string> {
  const trimmed = key.trim();
  if (!trimmed) return trimmed;

  const slug = slugify(trimmed);

  try {
    const [row] = await db
      .select({ hotelId: empreendimentos.hotelId })
      .from(empreendimentos)
      .where(
        or(
          eq(empreendimentos.hotelId, trimmed),
          eq(empreendimentos.slug, slug),
          eq(empreendimentos.websiteContentId, trimmed),
          sql`lower(${empreendimentos.nomeOficial}) = lower(${trimmed})`,
        ),
      )
      .limit(1);
    if (row?.hotelId) return row.hotelId;
  } catch {
    /* ambiente de teste sem tabela */
  }

  const hubFragment = parseHubHotelKey(trimmed);
  if (hubFragment) {
    const fromHub = matchCaldasHotelIdByTitle(hubFragment);
    if (fromHub) return fromHub;
  }

  if (titleHint) {
    const fromTitle = matchCaldasHotelIdByTitle(titleHint);
    if (fromTitle) return fromTitle;
  }

  const fromKey = matchCaldasHotelIdByTitle(trimmed);
  if (fromKey) return fromKey;

  const fromSlug = matchCaldasHotelIdByTitle(slug.replace(/-/g, ' '));
  if (fromSlug) return fromSlug;

  return trimmed;
}

module.exports = {
  matchCaldasHotelIdByTitle,
  resolverHotelIdParaAcomodacoes,
};
