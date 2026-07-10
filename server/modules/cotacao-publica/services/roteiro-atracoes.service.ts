import { sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import type { RoteiroAtracao } from '@rsv360/shared';

export type ListRoteiroAtracoesFilters = {
  turno?: string;
  publico?: string;
};

function parseJsonbArray<T>(value: unknown): T[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: Record<string, unknown>): RoteiroAtracao {
  return {
    slug: String(row.slug),
    nome: String(row.nome),
    tipo: String(row.tipo),
    turnos: parseJsonbArray(row.turnos),
    dias_funcionamento: parseJsonbArray(row.dias_funcionamento),
    publico: String(row.publico ?? 'todos'),
    faixa_preco: row.faixa_preco != null ? String(row.faixa_preco) : null,
    descricao: row.descricao != null ? String(row.descricao) : null,
    dica: row.dica != null ? String(row.dica) : null,
    endereco: row.endereco != null ? String(row.endereco) : null,
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    imagem_url: row.imagem_url != null ? String(row.imagem_url) : null,
    ordem: row.ordem != null ? Number(row.ordem) : 0,
    ativo: row.ativo !== false,
    metadata:
      row.metadata && typeof row.metadata === 'object'
        ? (row.metadata as Record<string, unknown>)
        : {},
  };
}

export async function listRoteiroAtracoes(
  filters: ListRoteiroAtracoesFilters = {},
): Promise<RoteiroAtracao[]> {
  const result = await db.execute(sql`
    SELECT
      slug, nome, tipo, turnos, dias_funcionamento, publico,
      faixa_preco, descricao, dica, endereco, lat, lng, imagem_url,
      ordem, ativo, metadata
    FROM roteiro_atracoes
    WHERE ativo = true
    ORDER BY ordem ASC, nome ASC
  `);

  const rows = (result.rows ?? result) as Record<string, unknown>[];
  let items = rows.map(mapRow);

  if (filters.turno) {
    const turno = filters.turno;
    items = items.filter((a) => a.turnos.includes(turno as RoteiroAtracao['turnos'][number]));
  }

  if (filters.publico) {
    const publico = filters.publico;
    items = items.filter((a) => a.publico === 'todos' || a.publico === publico);
  }

  return items;
}
