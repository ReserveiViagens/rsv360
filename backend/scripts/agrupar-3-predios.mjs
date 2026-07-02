#!/usr/bin/env node
/**
 * Etapa B §11.1 — agrupa unidades dos 3 prédios skipados sob empreendimento existente.
 *
 * Uso (repo root ou backend/):
 *   DATABASE_URL=... node --import tsx backend/scripts/agrupar-3-predios.mjs --dry-run
 *   DATABASE_URL=... node --import tsx backend/scripts/agrupar-3-predios.mjs --commit
 *
 * Whitelist explícita — sem heurística de reatribuição em massa.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import pg from 'pg';

const require = createRequire(import.meta.url);
const { parseArquivo } = require('../../server/modules/acomodacoes/import/parse.ts');
const { normalizarLinha } = require('../../server/modules/acomodacoes/import/normalizar.ts');

const PROPRIETARIO_ID = 35;

/** Whitelist — única fonte de inserts/moves cross-empreendimento. */
const PREDIOS = [
  {
    predio: 'CT-PREDIO-KM02H',
    empreendimentoId: 23,
    hotelId: 'lacqua-diroma',
    csvEmpreendimento: 'Lacqua diRoma',
    insert: ['KN23H'],
    move: [],
    scopeExtras: [],
  },
  {
    predio: 'CT-PREDIO-LA01H',
    empreendimentoId: 29,
    hotelId: 'piazza-diroma',
    csvEmpreendimento: 'Piazza diRoma',
    insert: [],
    move: [],
    scopeExtras: [],
  },
  {
    predio: 'CT-PREDIO-ST01H',
    empreendimentoId: 37,
    hotelId: 'spazzio-diroma',
    csvEmpreendimento: 'Spazzio diRoma',
    insert: [],
    move: ['UE19H'],
    scopeExtras: ['UE19H'],
  },
];

const UE19H_SOURCE_CHECK = {
  codigo: 'UE19H',
  fonte: 'https://www.caldasteam.com.br/pt/apartment/UE19H',
  nota:
    'Página CaldasTeam lista "Solar de Caldas"; pacote ST01H (obs 20 CT + UE19H + UE21H) é autoridade desta tarefa.',
};

const args = process.argv.slice(2);
const commit = args.includes('--commit');
const dryRun = !commit;

if (!process.env.DATABASE_URL) {
  console.error('[agrupar-3-predios] DATABASE_URL obrigatório');
  process.exit(1);
}

const csvPath =
  process.env.INVENTARIO_CALDAS_CSV ||
  resolve(process.cwd(), '../Downloads/inventario_caldas_novas436 acomodação.csv');

const csvLinhas = await parseArquivo(readFileSync(csvPath), csvPath);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function scopeCodigosParaPredio(cfg) {
  const filhas = csvLinhas.filter(
    (l) =>
      String(l.empreendimento ?? '').trim() === cfg.csvEmpreendimento &&
      String(l.tipo ?? '').trim().toLowerCase() !== 'predio',
  );
  const ctApartment = filhas
    .filter((l) => String(l.fonte ?? '').includes('caldasteam.com.br/pt/apartment'))
    .map((l) => String(l.codigo_externo).trim());
  const extras = (cfg.scopeExtras ?? []).filter((c) => !ctApartment.includes(c));
  return [...new Set([...ctApartment, ...extras])];
}

function statusParaInsert(precoDiaria) {
  const preco = precoDiaria != null && String(precoDiaria).trim() !== '' ? Number(precoDiaria) : null;
  if (preco != null && Number.isFinite(preco) && preco > 0) {
    return { statusPublicacao: 'publicado', dadosCompletos: true };
  }
  return { statusPublicacao: 'rascunho', dadosCompletos: false };
}

async function buildInsertPayload(codigo, targetHotelId) {
  const linha = csvLinhas.find((l) => String(l.codigo_externo).trim() === codigo);
  if (!linha) throw new Error(`CSV sem linha para codigo_externo=${codigo}`);

  const norm = await normalizarLinha(linha, 0, { criarTipoSeAusente: false });
  if (!norm.ok || norm.skip) {
    throw new Error(`Falha ao normalizar ${codigo}: ${norm.erros?.join('; ')}`);
  }

  const { statusPublicacao, dadosCompletos } = statusParaInsert(linha.preco_diaria);
  const metadata = {
    fonte: linha.fonte ?? null,
    obs: linha.obs ?? null,
    agruparPredio: { script: 'agrupar-3-predios', insert: true },
  };

  return {
    hotelId: targetHotelId,
    proprietarioId: PROPRIETARIO_ID,
    tipoId: norm.dto.tipoId,
    titulo: norm.dto.titulo,
    quartos: norm.dto.quartos,
    configSala: norm.dto.configSala,
    configBanheiro: norm.dto.configBanheiro,
    capacidadeMax: norm.dto.capacidadeMax,
    capacidadeBase: norm.dto.capacidadeBase ?? null,
    precoDiaria: norm.dto.precoDiaria != null ? String(norm.dto.precoDiaria) : null,
    utensilios: norm.dto.utensilios?.length ? JSON.stringify(norm.dto.utensilios) : null,
    eletrodomesticos: norm.dto.eletrodomesticos?.length ? JSON.stringify(norm.dto.eletrodomesticos) : null,
    amenidades: norm.dto.amenidades?.length ? JSON.stringify(norm.dto.amenidades) : null,
    codigoExterno: codigo,
    statusPublicacao,
    dadosCompletos,
    metadata: JSON.stringify(metadata),
    ativo: true,
  };
}

const report = {
  mode: dryRun ? 'dry-run' : 'commit',
  csvPath,
  precheck: {},
  predios: [],
  ue19hSourceCheck: UE19H_SOURCE_CHECK,
  totals: { inserts: 0, moves: 0, normalized: 0, skipped: 0 },
};

// Pré-check UE19H / UE21H / KN23H
const pre = await pool.query(
  `SELECT id, codigo_externo, hotel_id, titulo, preco_diaria, status_publicacao, proprietario_id
   FROM acomodacoes WHERE codigo_externo = ANY($1) ORDER BY codigo_externo`,
  [['UE19H', 'UE21H', 'KN23H']],
);
report.precheck = {
  rows: pre.rows,
  kn23h_ausente: !pre.rows.some((r) => r.codigo_externo === 'KN23H'),
  ue21h_hotel: pre.rows.find((r) => r.codigo_externo === 'UE21H')?.hotel_id ?? null,
  ue19h_hotel: pre.rows.find((r) => r.codigo_externo === 'UE19H')?.hotel_id ?? null,
};

const client = dryRun ? null : await pool.connect();

try {
  if (!dryRun) await client.query('BEGIN');

  for (const cfg of PREDIOS) {
    const predioReport = {
      predio: cfg.predio,
      empreendimentoId: cfg.empreendimentoId,
      hotelId: cfg.hotelId,
      scopeCount: scopeCodigosParaPredio(cfg).length,
      inserts: [],
      moves: [],
      normalized: [],
      skipped: [],
    };

    // INSERT whitelist
    for (const codigo of cfg.insert) {
      const exists = await pool.query(
        `SELECT id, codigo_externo FROM acomodacoes WHERE codigo_externo = $1`,
        [codigo],
      );
      if (exists.rows.length > 0) {
        predioReport.skipped.push({ codigo, reason: 'já existe', id: exists.rows[0].id });
        report.totals.skipped += 1;
        continue;
      }

      const payload = await buildInsertPayload(codigo, cfg.hotelId);
      predioReport.inserts.push({
        codigo,
        status_publicacao: payload.statusPublicacao,
        preco_diaria: payload.precoDiaria,
      });
      report.totals.inserts += 1;

      if (!dryRun) {
        await client.query(
          `INSERT INTO acomodacoes (
            hotel_id, proprietario_id, tipo_id, titulo, quartos, config_sala, config_banheiro,
            capacidade_max, capacidade_base, preco_diaria, utensilios, eletrodomesticos, amenidades,
            codigo_externo, dados_completos, status_publicacao, metadata, ativo, atualizado_em
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14,$15,$16,$17::jsonb,$18,now())`,
          [
            payload.hotelId,
            payload.proprietarioId,
            payload.tipoId,
            payload.titulo,
            payload.quartos,
            payload.configSala,
            payload.configBanheiro,
            payload.capacidadeMax,
            payload.capacidadeBase,
            payload.precoDiaria,
            payload.utensilios,
            payload.eletrodomesticos,
            payload.amenidades,
            payload.codigoExterno,
            payload.dadosCompletos,
            payload.statusPublicacao,
            payload.metadata,
            payload.ativo,
          ],
        );
      }
    }

    // MOVE whitelist (cross-empreendimento)
    for (const codigo of cfg.move) {
      const cur = await pool.query(
        `SELECT id, codigo_externo, hotel_id, status_publicacao, metadata
         FROM acomodacoes WHERE codigo_externo = $1`,
        [codigo],
      );
      if (cur.rows.length === 0) {
        predioReport.skipped.push({ codigo, reason: 'não encontrado para move' });
        report.totals.skipped += 1;
        continue;
      }
      const row = cur.rows[0];
      if (row.hotel_id === cfg.hotelId) {
        predioReport.skipped.push({ codigo, reason: 'já no hotel destino', hotel_id: row.hotel_id });
        report.totals.skipped += 1;
        continue;
      }

      const moveLog = {
        codigo,
        id: row.id,
        before: row.hotel_id,
        after: cfg.hotelId,
        status_publicacao: row.status_publicacao,
        reversible: `UPDATE acomodacoes SET hotel_id='${row.hotel_id}', atualizado_em=now() WHERE id=${row.id}`,
      };
      predioReport.moves.push(moveLog);
      report.totals.moves += 1;

      if (!dryRun) {
        const meta = typeof row.metadata === 'object' && row.metadata ? { ...row.metadata } : {};
        meta.agruparPredio = {
          predio: cfg.predio,
          moveFrom: row.hotel_id,
          moveTo: cfg.hotelId,
          movedAt: new Date().toISOString(),
          fonteCheck: UE19H_SOURCE_CHECK.fonte,
        };
        await client.query(
          `UPDATE acomodacoes SET hotel_id = $1, metadata = $2::jsonb, atualizado_em = now() WHERE id = $3`,
          [cfg.hotelId, JSON.stringify(meta), row.id],
        );
      }
    }

    // NORMALIZE proprietario_id no escopo do prédio
    const scope = scopeCodigosParaPredio(cfg);
    if (scope.length > 0) {
      const placeholders = scope.map((_, i) => `$${i + 2}`).join(',');
      const normQuery = `
        SELECT id, codigo_externo, proprietario_id FROM acomodacoes
        WHERE codigo_externo IN (${placeholders})
          AND proprietario_id IS DISTINCT FROM $1`;
      const normRows = await pool.query(normQuery, [PROPRIETARIO_ID, ...scope]);

      for (const r of normRows.rows) {
        predioReport.normalized.push({
          codigo: r.codigo_externo,
          id: r.id,
          before: r.proprietario_id,
          after: PROPRIETARIO_ID,
        });
        report.totals.normalized += 1;
        if (!dryRun) {
          await client.query(
            `UPDATE acomodacoes SET proprietario_id = $1, atualizado_em = now() WHERE id = $2`,
            [PROPRIETARIO_ID, r.id],
          );
        }
      }
    }

    report.predios.push(predioReport);
  }

  if (!dryRun) await client.query('COMMIT');
} catch (error) {
  if (client) await client.query('ROLLBACK');
  console.error('[agrupar-3-predios] ERRO:', error);
  process.exit(1);
} finally {
  if (client) client.release();
  await pool.end();
}

console.log(JSON.stringify(report, null, 2));
