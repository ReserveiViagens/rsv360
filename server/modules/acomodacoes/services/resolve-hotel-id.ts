import { eq, or, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { empreendimentos } from '../../../../backend/src/db/schema/empreendimentos';
import { CALDAS_EMPREENDIMENTOS_CATALOGO } from '../sync/caldas-empreendimentos-catalog';
import { slugify } from '../import/normalizar';

function normalizarNome(valor: string): string {
  return valor.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

/**
 * Aliases históricos / typos de slug → hotel_id real em `acomodacoes`.
 * Ex.: catálogo antigo usava lacqua-di-roma; DB usa lacqua-diroma.
 */
export const HOTEL_ID_ALIASES: Record<string, string> = {
  'lacqua-di-roma': 'lacqua-diroma',
  'lacqua-diroma': 'lacqua-diroma',
};

export function canonicalizeHotelId(hotelId: string): string {
  const key = hotelId.trim().toLowerCase();
  return HOTEL_ID_ALIASES[key] ?? hotelId.trim();
}

/** Casa título do catálogo/hub com `hotel_id` canônico (ex.: "Piazza" → piazza-diroma). */
export function matchCaldasHotelIdByTitle(title: string): string | null {
  const t = normalizarNome(title);
  if (!t) return null;

  for (const item of CALDAS_EMPREENDIMENTOS_CATALOGO) {
    const oficial = normalizarNome(item.nomeOficial);
    if (t === oficial) return canonicalizeHotelId(item.hotelId);
  }

  for (const item of CALDAS_EMPREENDIMENTOS_CATALOGO) {
    const oficial = normalizarNome(item.nomeOficial);
    if (oficial.includes(t) || t.includes(oficial)) return canonicalizeHotelId(item.hotelId);
  }

  const firstWord = t.split(/\s+/)[0];
  if (firstWord.length >= 4) {
    for (const item of CALDAS_EMPREENDIMENTOS_CATALOGO) {
      const oficial = normalizarNome(item.nomeOficial);
      if (oficial.includes(firstWord)) return canonicalizeHotelId(item.hotelId);
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

  // Atalho: alias conhecido (antes de hit no DB / catálogo)
  const aliased = canonicalizeHotelId(trimmed);
  if (aliased !== trimmed && HOTEL_ID_ALIASES[trimmed.toLowerCase()]) {
    // Se a chave já é um alias puro (ex. lacqua-di-roma), retorna canônico.
    // hub-hotel-* continua pelo fluxo abaixo.
    if (!trimmed.startsWith('hub-hotel-')) {
      return aliased;
    }
  }

  const slug = slugify(trimmed);
  const candidates = Array.from(
    new Set([trimmed, aliased, slug, canonicalizeHotelId(slug)].filter(Boolean)),
  );

  try {
    const [row] = await db
      .select({ hotelId: empreendimentos.hotelId })
      .from(empreendimentos)
      .where(
        or(
          ...candidates.flatMap((c) => [
            eq(empreendimentos.hotelId, c),
            eq(empreendimentos.slug, slugify(c)),
          ]),
          eq(empreendimentos.websiteContentId, trimmed),
          sql`lower(${empreendimentos.nomeOficial}) = lower(${trimmed})`,
        ),
      )
      .limit(1);
    if (row?.hotelId) return canonicalizeHotelId(row.hotelId);
  } catch {
    /* ambiente de teste sem tabela */
  }

  const hubFragment = parseHubHotelKey(trimmed);
  if (hubFragment) {
    const fromHub = matchCaldasHotelIdByTitle(hubFragment);
    if (fromHub) return fromHub;
    // hub-hotel-lacqua-diroma → fragment "lacqua diroma" / slug lacqua-diroma
    const hubSlug = slugify(hubFragment);
    if (
      HOTEL_ID_ALIASES[hubSlug] ||
      CALDAS_EMPREENDIMENTOS_CATALOGO.some((i) => i.hotelId === hubSlug || i.slug === hubSlug)
    ) {
      return canonicalizeHotelId(hubSlug);
    }
  }

  if (titleHint) {
    const fromTitle = matchCaldasHotelIdByTitle(titleHint);
    if (fromTitle) return fromTitle;
  }

  const fromKey = matchCaldasHotelIdByTitle(trimmed);
  if (fromKey) return fromKey;

  const fromSlug = matchCaldasHotelIdByTitle(slug.replace(/-/g, ' '));
  if (fromSlug) return fromSlug;

  return canonicalizeHotelId(trimmed);
}

module.exports = {
  HOTEL_ID_ALIASES,
  canonicalizeHotelId,
  matchCaldasHotelIdByTitle,
  resolverHotelIdParaAcomodacoes,
};
