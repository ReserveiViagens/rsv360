import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { eq, or, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { empreendimentos } from '../../../../backend/src/db/schema/empreendimentos';
import { slugify } from '../import/normalizar';
import { parseExcel } from '../import/parse';
import {
  CALDAS_EMPREENDIMENTOS_CATALOGO,
  type EmpreendimentoCatalogoItem,
} from './caldas-empreendimentos-catalog';
import { resolveSafeCsvPath } from './safe-csv-path';

export interface SyncEmpreendimentosResult {
  inseridos: number;
  atualizados: number;
  total: number;
  fonte: 'catalogo' | 'csv' | 'inventario';
}

function normalizarNome(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

function itemFromNome(nomeOficial: string, hotelId?: string): EmpreendimentoCatalogoItem {
  const slug = hotelId ?? slugify(nomeOficial);
  return { nomeOficial: nomeOficial.trim(), slug, hotelId: slug };
}

async function upsertEmpreendimento(item: EmpreendimentoCatalogoItem): Promise<'insert' | 'update'> {
  const nomeNormalizado = normalizarNome(item.nomeOficial);
  const [existente] = await db
    .select()
    .from(empreendimentos)
    .where(
      or(
        eq(empreendimentos.slug, item.slug),
        eq(empreendimentos.hotelId, item.hotelId),
        sql`lower(${empreendimentos.nomeNormalizado}) = ${nomeNormalizado}`,
      ),
    )
    .limit(1);

  const payload = {
    slug: item.slug,
    hotelId: item.hotelId,
    nomeOficial: item.nomeOficial,
    nomeNormalizado,
    websiteContentId: item.websiteContentId ?? null,
    status: 'aprovado' as const,
    ativo: true,
    atualizadoEm: new Date(),
  };

  if (existente) {
    await db.update(empreendimentos).set(payload).where(eq(empreendimentos.id, existente.id));
    return 'update';
  }

  await db.insert(empreendimentos).values({
    ...payload,
    tipo: 'condominio',
    cidade: 'Caldas Novas',
  });
  return 'insert';
}

export async function syncEmpreendimentosLista(
  itens: EmpreendimentoCatalogoItem[],
  fonte: SyncEmpreendimentosResult['fonte'],
): Promise<SyncEmpreendimentosResult> {
  let inseridos = 0;
  let atualizados = 0;

  for (const item of itens) {
    const acao = await upsertEmpreendimento(item);
    if (acao === 'insert') inseridos += 1;
    else atualizados += 1;
  }

  return { inseridos, atualizados, total: itens.length, fonte };
}

export function lerEmpreendimentosDeCsv(csvPath: string): EmpreendimentoCatalogoItem[] {
  const buffer = readFileSync(csvPath);
  const rows = parseExcel(buffer, 'csv');
  const itens: EmpreendimentoCatalogoItem[] = [];
  const vistos = new Set<string>();

  for (const row of rows) {
    const nome =
      String(row.nome_oficial ?? row.empreendimento ?? row.nome ?? row.hotel ?? '').trim();
    if (!nome) continue;
    const key = normalizarNome(nome);
    if (vistos.has(key)) continue;
    vistos.add(key);
    const hotelId = String(row.hotel_id ?? row.slug ?? '').trim() || undefined;
    itens.push(itemFromNome(nome, hotelId || undefined));
  }

  return itens;
}

export function extrairEmpreendimentosInventario(csvPath: string): EmpreendimentoCatalogoItem[] {
  const buffer = readFileSync(csvPath);
  const rows = parseExcel(buffer, 'csv');
  const itens: EmpreendimentoCatalogoItem[] = [];
  const vistos = new Set<string>();

  for (const row of rows) {
    const nome = String(row.empreendimento ?? row.EMPREENDIMENTO ?? '').trim();
    if (!nome) continue;
    const key = normalizarNome(nome);
    if (vistos.has(key)) continue;
    vistos.add(key);
    itens.push(itemFromNome(nome));
  }

  return itens;
}

export function resolverPathInventario(): string | null {
  const candidatos = [
    process.env.INVENTARIO_CALDAS_CSV,
    resolve(process.cwd(), 'data/cotacao/inventario-caldas-436.csv'),
    resolve(process.cwd(), '../data/cotacao/inventario-caldas-436.csv'),
    resolve(process.cwd(), 'data/cotacao/inventario-caldas-fixture.csv'),
  ].filter(Boolean) as string[];

  for (const p of candidatos) {
    if (existsSync(p)) return p;
  }
  return null;
}

export async function syncEmpreendimentosCaldas(options?: {
  csvPath?: string;
  usarCatalogo?: boolean;
}): Promise<SyncEmpreendimentosResult> {
  // User-supplied csvPath is sandboxed (PR-07a). Env/default paths stay server-controlled.
  const csvPath = options?.csvPath
    ? resolveSafeCsvPath(options.csvPath)
    : (process.env.EMPREENDIMENTOS_CALDAS_CSV ??
      resolve(process.cwd(), 'data/cotacao/empreendimentos-caldas.csv'));

  if (existsSync(csvPath)) {
    const itens = lerEmpreendimentosDeCsv(csvPath);
    if (itens.length > 0) {
      return syncEmpreendimentosLista(itens, 'csv');
    }
  }

  const inventarioPath = resolverPathInventario();
  if (inventarioPath) {
    const itens = extrairEmpreendimentosInventario(inventarioPath);
    if (itens.length > 0) {
      return syncEmpreendimentosLista(itens, 'inventario');
    }
  }

  if (options?.usarCatalogo !== false) {
    return syncEmpreendimentosLista(CALDAS_EMPREENDIMENTOS_CATALOGO, 'catalogo');
  }

  return { inseridos: 0, atualizados: 0, total: 0, fonte: 'catalogo' };
}

module.exports = {
  syncEmpreendimentosCaldas,
  syncEmpreendimentosLista,
  lerEmpreendimentosDeCsv,
  CALDAS_EMPREENDIMENTOS_CATALOGO,
};
