import { eq, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { tiposAcomodacao } from '../../../../backend/src/db/schema/tipos-acomodacao';
import {
  acomodacaoImportSchema,
  type AcomodacaoImportDTO,
  type AcomodacaoImportResolved,
} from './acomodacao-import.types';

function removerAcentos(valor: string): string {
  return valor.normalize('NFD').replace(/\p{M}/gu, '');
}

export function normalizarChaveCabecalho(chave: string): string {
  return removerAcentos(chave)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/** Mapa cabeçalhos PT/variantes → campo canônico (§19.1.C). */
export const MAPA_CABECALHOS: Record<string, string> = {
  codigo_externo: 'codigoExterno',
  codigo: 'codigoExterno',
  sku: 'codigoExterno',
  empreendimento: 'empreendimento',
  hotel: 'empreendimento',
  propriedade: 'empreendimento',
  tipo: 'tipo',
  tipologia: 'tipo',
  titulo: 'titulo',
  nome: 'titulo',
  quartos: 'quartos',
  qtd_quartos: 'quartos',
  capacidade_max: 'capacidadeMax',
  capacidade: 'capacidadeMax',
  hospedes: 'capacidadeMax',
  capacidade_base: 'capacidadeBase',
  config_sala: 'configSala',
  sala: 'configSala',
  config_banheiro: 'configBanheiro',
  banheiro: 'configBanheiro',
  preco_diaria: 'precoDiaria',
  preco: 'precoDiaria',
  diaria: 'precoDiaria',
  utensilios: 'utensilios',
  eletrodomesticos: 'eletrodomesticos',
  amenidades: 'amenidades',
  midia: 'midia',
};

const MAPA_CONFIG_SALA: Record<string, AcomodacaoImportDTO['configSala']> = {
  nenhum: 'nenhum',
  sem_sala: 'nenhum',
  sofa_cama: 'sofa_cama',
  sofa: 'sofa_cama',
  sofacama: 'sofa_cama',
  cama_na_sala: 'cama_na_sala',
  camasala: 'cama_na_sala',
};

const MAPA_CONFIG_BANHEIRO: Record<string, AcomodacaoImportDTO['configBanheiro']> = {
  so_wc_social: 'so_wc_social',
  wc_social: 'so_wc_social',
  so_suite: 'so_suite',
  suite: 'so_suite',
  suite_wc_social: 'suite_wc_social',
  suite_com_wc_social: 'suite_wc_social',
};

export function slugify(valor: string): string {
  return removerAcentos(valor)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function splitLista(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof valor === 'string') {
    return valor
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizarEnumSala(valor: unknown): AcomodacaoImportDTO['configSala'] {
  const chave = slugify(String(valor ?? 'nenhum')).replace(/-/g, '_');
  return MAPA_CONFIG_SALA[chave] ?? 'nenhum';
}

export function normalizarEnumBanheiro(
  valor: unknown,
): AcomodacaoImportDTO['configBanheiro'] {
  const chave = slugify(String(valor ?? 'so_wc_social')).replace(/-/g, '_');
  return MAPA_CONFIG_BANHEIRO[chave] ?? 'so_wc_social';
}

export function normalizarLinhaBruta(
  linha: Record<string, unknown>,
): Record<string, unknown> {
  const saida: Record<string, unknown> = {};

  for (const [chave, valor] of Object.entries(linha)) {
    const canon = MAPA_CABECALHOS[normalizarChaveCabecalho(chave)];
    if (!canon) continue;

    if (['utensilios', 'eletrodomesticos', 'amenidades', 'midia'].includes(canon)) {
      saida[canon] = splitLista(valor);
      continue;
    }
    if (canon === 'configSala') {
      saida[canon] = normalizarEnumSala(valor);
      continue;
    }
    if (canon === 'configBanheiro') {
      saida[canon] = normalizarEnumBanheiro(valor);
      continue;
    }
    saida[canon] = valor;
  }

  return saida;
}

export async function resolverHotel(empreendimento: string): Promise<string | null> {
  const trimmed = empreendimento.trim();
  if (!trimmed) return null;

  try {
    const result = await db.execute<{ content_id: string }>(sql`
      SELECT content_id
      FROM website_content
      WHERE page_type IN ('hotels', 'hotel')
        AND (
          content_id = ${trimmed}
          OR lower(trim(title)) = lower(${trimmed})
        )
      LIMIT 1
    `);
    const row = result.rows?.[0];
    if (row?.content_id) return row.content_id;
  } catch {
    /* tabela opcional em ambientes de teste */
  }

  return slugify(trimmed) || null;
}

export async function resolverOuCriarTipo(
  tipo: string,
  criarSeAusente = true,
): Promise<number | null> {
  const slug = slugify(tipo);
  if (!slug) return null;

  const [existente] = await db
    .select()
    .from(tiposAcomodacao)
    .where(eq(tiposAcomodacao.slug, slug))
    .limit(1);

  if (existente) return existente.id;
  if (!criarSeAusente) return null;

  const [criado] = await db
    .insert(tiposAcomodacao)
    .values({ slug, nome: tipo.trim(), ordem: 99 })
    .returning();

  return criado?.id ?? null;
}

export async function normalizarLinha(
  linha: Record<string, unknown>,
  indice: number,
  options?: { criarTipoSeAusente?: boolean },
): Promise<{ ok: true; dto: AcomodacaoImportResolved } | { ok: false; erros: string[]; indice: number }> {
  const normalizada = normalizarLinhaBruta(linha);
  const parsed = acomodacaoImportSchema.safeParse(normalizada);

  if (!parsed.success) {
    return {
      ok: false,
      indice,
      erros: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    };
  }

  const hotelId = await resolverHotel(parsed.data.empreendimento);
  if (!hotelId) {
    return { ok: false, indice, erros: ['empreendimento não resolvido para hotel_id'] };
  }

  const tipoId = await resolverOuCriarTipo(
    parsed.data.tipo,
    options?.criarTipoSeAusente !== false,
  );
  if (!tipoId) {
    return { ok: false, indice, erros: [`tipo não encontrado: ${parsed.data.tipo}`] };
  }

  return {
    ok: true,
    dto: {
      ...parsed.data,
      hotelId,
      tipoId,
    },
  };
}

export async function normalizarLote(
  linhas: Record<string, unknown>[],
  options?: { criarTipoSeAusente?: boolean },
): Promise<{
  validos: AcomodacaoImportResolved[];
  erros: Array<{ linha: number; erros: string[] }>;
}> {
  const validos: AcomodacaoImportResolved[] = [];
  const erros: Array<{ linha: number; erros: string[] }> = [];

  for (let i = 0; i < linhas.length; i++) {
    const row = linhas[i];
    if (!row || Object.values(row).every((v) => v === '' || v == null)) continue;

    const result = await normalizarLinha(row, i + 2, options);
    if (result.ok) {
      validos.push(result.dto);
    } else {
      erros.push({ linha: result.indice, erros: result.erros });
    }
  }

  return { validos, erros };
}

module.exports = {
  MAPA_CABECALHOS,
  normalizarChaveCabecalho,
  normalizarLinhaBruta,
  normalizarEnumSala,
  normalizarEnumBanheiro,
  splitLista,
  slugify,
  resolverHotel,
  resolverOuCriarTipo,
  normalizarLinha,
  normalizarLote,
};
