#!/usr/bin/env node
/**
 * Smoke Passo 2 — listagem publicada + leak de rascunho (hotéis legado).
 *
 * Requer DATABASE_URL (ex.: Postgres local :5433).
 *
 * Execução local (imports .ts — usar tsx, não node puro):
 *   cd backend && npm run smoke:wizard-passo2
 *   # ou: npx tsx scripts/smoke-wizard-passo2.mjs
 */
import 'dotenv/config';
import { acomodacoesService } from '../../server/modules/acomodacoes/services/acomodacoes.service.ts';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../server/lib/db.ts';
import { acomodacoes } from '../src/db/schema/acomodacoes.ts';

const hotels = ['piazza-diroma', 'lacqua-diroma-iv', 'diroma-fiori'];

for (const hotelId of hotels) {
  const listed = await acomodacoesService.listarDisponiveis({ hotelId, hospedes: 2, pageSize: 50 });
  const leak = await db
    .select({ status: acomodacoes.statusPublicacao })
    .from(acomodacoes)
    .where(
      and(
        eq(acomodacoes.hotelId, hotelId),
        inArray(acomodacoes.statusPublicacao, ['rascunho', 'em_aprovacao']),
      ),
    );
  console.log(
    JSON.stringify({
      hotelId,
      listarDisponiveis_total: listed.total,
      quartos_zero_publicadas: listed.items.filter((i) => i.quartos === 0).length,
      leak_nao_publicado: leak.length,
      sample_quartos0: listed.items
        .filter((i) => i.quartos === 0)
        .slice(0, 2)
        .map((i) => ({ titulo: i.titulo, quartos: i.quartos, configSala: i.configSala })),
    }),
  );
}

const counts = await db.execute(sql`
  SELECT
    count(*) FILTER (WHERE status_publicacao='publicado' AND ativo=true)::int AS publicado,
    count(*) FILTER (WHERE status_publicacao='rascunho')::int AS rascunho
  FROM acomodacoes
  WHERE proprietario_id = 35
`);

console.log('DB_PROPRIETARIO_35', counts.rows?.[0] ?? counts);
