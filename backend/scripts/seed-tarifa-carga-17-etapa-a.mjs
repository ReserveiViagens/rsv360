#!/usr/bin/env node
/**
 * Carga tarifário A′ — 17 unidades Etapa A (motor OFF).
 *
 * - Upsert categorias 1q / 2q / premium
 * - Upsert temporada feriado + períodos 2026–2027
 * - Regras absolutas unidade × temporada (diária base seg–qui)
 * - Política FDS / estadia mín. / taxa parque em configuracoes_sistema
 *   (chave tarifario_politica_etapa_a) — NÃO liga o motor
 *
 * GUARD-RAILS:
 * - Nunca UPDATE acomodacoes.preco_diaria
 * - Nunca set tarifario_dinamico_ativo = true
 * - Escopo fechado nas 17; unidade fora da lista → abort
 *
 * Uso:
 *   $env:DATABASE_URL="postgresql://rsv360:REDACTED_PG_DEV_PASSWORD@localhost:5433/rsv_360_ecosystem"
 *   node scripts/seed-tarifa-carga-17-etapa-a.mjs --dry-run
 *   node scripts/seed-tarifa-carga-17-etapa-a.mjs
 */
import 'dotenv/config';
import { Pool } from 'pg';

const dryRun = process.argv.includes('--dry-run');

const PRECOS = {
  '1q': { baixa: 200, media: 320, alta: 450, feriado: 620, fdsPct: 40 },
  '2q': { baixa: 290, media: 450, alta: 600, feriado: 820, fdsPct: 35 },
  premium: { baixa: 350, media: 540, alta: 720, feriado: 980, fdsPct: 35 },
};

/** @type {Record<string, keyof typeof PRECOS>} */
const MAPA_17 = {
  'AGF-STD': '1q',
  'AGF-FAM': '1q',
  'ATR-DUP': '1q',
  'ATR-FAM': '1q',
  'ALD-DUP': '1q',
  'AQR-CZ': '1q',
  'DRF-1Q': '1q',
  'ATR-SUV': '1q',
  KN39H: '1q',
  'PRT1-2Q': '2q',
  'SDC-2Q': '2q',
  'DAP-2Q': '2q',
  'AQR-FAM': '2q',
  'ALV-LUX': 'premium',
  'ALV-PRE': 'premium',
  'VC-APTO-409-GOLDEN-DOLPHIN-SUPREME': 'premium',
  'ALD-FAM': 'premium',
};

const CATEGORIAS = [
  { slug: '1q', nome: '1 quarto (até 4)' },
  { slug: '2q', nome: '2 quartos (até 6)' },
  { slug: 'premium', nome: 'Premium / varanda' },
];

const TEMPORADAS = [
  { slug: 'baixa', nome: 'Baixa temporada', prioridade: 1, cor: '#94a3b8' },
  { slug: 'media', nome: 'Média temporada', prioridade: 2, cor: '#38bdf8' },
  { slug: 'alta', nome: 'Alta temporada', prioridade: 3, cor: '#f59e0b' },
  { slug: 'feriado', nome: 'Feriado / pico', prioridade: 4, cor: '#ef4444' },
];

/** Períodos 2026–2027 — feriado > alta > média > baixa (catch-all). */
const PERIODOS = [
  // Baixa catch-all (menor prioridade)
  { temporada: 'baixa', inicio: '2026-01-01', fim: '2027-12-31' },
  // Média
  { temporada: 'media', inicio: '2026-06-01', fim: '2026-06-30' },
  { temporada: 'media', inicio: '2026-08-01', fim: '2026-08-31' },
  { temporada: 'media', inicio: '2026-10-01', fim: '2026-10-31' },
  { temporada: 'media', inicio: '2027-06-01', fim: '2027-06-30' },
  { temporada: 'media', inicio: '2027-08-01', fim: '2027-08-31' },
  { temporada: 'media', inicio: '2027-10-01', fim: '2027-10-31' },
  // Alta
  { temporada: 'alta', inicio: '2026-07-01', fim: '2026-07-31' },
  { temporada: 'alta', inicio: '2026-12-01', fim: '2026-12-19' },
  { temporada: 'alta', inicio: '2027-01-06', fim: '2027-01-31' },
  { temporada: 'alta', inicio: '2027-07-01', fim: '2027-07-31' },
  { temporada: 'alta', inicio: '2027-12-01', fim: '2027-12-19' },
  // Feriado / pico
  { temporada: 'feriado', inicio: '2026-02-14', fim: '2026-02-18' }, // Carnaval
  { temporada: 'feriado', inicio: '2026-04-17', fim: '2026-04-21' }, // Páscoa/Tiradentes
  { temporada: 'feriado', inicio: '2026-09-04', fim: '2026-09-07' }, // Independência
  { temporada: 'feriado', inicio: '2026-11-14', fim: '2026-11-16' }, // Proclamação
  { temporada: 'feriado', inicio: '2026-12-20', fim: '2027-01-05' }, // Natal/Ano Novo
  { temporada: 'feriado', inicio: '2027-02-06', fim: '2027-02-10' }, // Carnaval
  { temporada: 'feriado', inicio: '2027-04-01', fim: '2027-04-05' }, // Páscoa
  { temporada: 'feriado', inicio: '2027-09-04', fim: '2027-09-07' },
  { temporada: 'feriado', inicio: '2027-11-14', fim: '2027-11-16' },
  { temporada: 'feriado', inicio: '2027-12-20', fim: '2027-12-31' },
];

const POLITICA = {
  escopo: 'etapa_a_17',
  fonte: 'Notion Inventário & Tarifário Reservei / modelo-tarifario-reservei.csv',
  carregado_em: new Date().toISOString(),
  motor_ligado: false,
  precos_base_seg_qui: PRECOS,
  fim_de_semana: {
    nota: 'Adicional sobre diária base; motor A′ ainda não aplica por dia da semana — política documentada para camada futura',
    '1q_pct': 40,
    '2q_pct': 35,
    premium_pct: 35,
  },
  estadia_minima_noites: { padrao: 2, feriado: 3 },
  taxa_parque_rs_pessoa_dia: 10,
  nota_taxa_parque: 'À parte — não embutir na diária',
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function upsertCategoria(client, { slug, nome }) {
  await client.query(
    `INSERT INTO tarifa_categoria (slug, nome, desconto_percentual, ativo)
     VALUES ($1, $2, NULL, true)
     ON CONFLICT (slug) DO UPDATE SET
       nome = EXCLUDED.nome,
       ativo = true,
       atualizado_em = now()`,
    [slug, nome],
  );
}

async function upsertTemporada(client, { slug, nome, prioridade, cor }) {
  await client.query(
    `INSERT INTO tarifa_temporada (slug, nome, cor, prioridade, ativo)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (slug) DO UPDATE SET
       nome = EXCLUDED.nome,
       cor = EXCLUDED.cor,
       prioridade = EXCLUDED.prioridade,
       ativo = true,
       atualizado_em = now()`,
    [slug, nome, cor, prioridade],
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL obrigatório');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Guard: motor deve permanecer false
    await client.query(
      `INSERT INTO configuracoes_sistema (chave, valores)
       VALUES ('tarifario', '{"tarifario_dinamico_ativo": false}'::jsonb)
       ON CONFLICT (chave) DO UPDATE SET
         valores = jsonb_set(
           COALESCE(configuracoes_sistema.valores, '{}'::jsonb),
           '{tarifario_dinamico_ativo}',
           'false'::jsonb,
           true
         )`,
    );

    await client.query(
      `INSERT INTO configuracoes_sistema (chave, valores)
       VALUES ('tarifario_politica_etapa_a', $1::jsonb)
       ON CONFLICT (chave) DO UPDATE SET valores = EXCLUDED.valores`,
      [JSON.stringify(POLITICA)],
    );

    for (const c of CATEGORIAS) {
      console.log(`[categoria] ${c.slug} — ${c.nome}`);
      if (!dryRun) await upsertCategoria(client, c);
    }

    for (const t of TEMPORADAS) {
      console.log(`[temporada] ${t.slug} prio=${t.prioridade}`);
      if (!dryRun) await upsertTemporada(client, t);
    }

    const { rows: tempRows } = await client.query(
      `SELECT id, slug FROM tarifa_temporada WHERE slug = ANY($1)`,
      [TEMPORADAS.map((t) => t.slug)],
    );
    const tempBySlug = Object.fromEntries(tempRows.map((r) => [r.slug, r.id]));

    const { rows: catRows } = await client.query(
      `SELECT id, slug FROM tarifa_categoria WHERE slug = ANY($1)`,
      [CATEGORIAS.map((c) => c.slug)],
    );
    const catBySlug = Object.fromEntries(catRows.map((r) => [r.slug, r.id]));

    if (!dryRun) {
      for (const t of TEMPORADAS) {
        if (!tempBySlug[t.slug]) throw new Error(`Temporada ${t.slug} não encontrada após upsert`);
      }
      for (const c of CATEGORIAS) {
        if (!catBySlug[c.slug]) throw new Error(`Categoria ${c.slug} não encontrada após upsert`);
      }
    }

    // Períodos: replace idempotente por temporada (só os da carga)
    if (!dryRun) {
      for (const t of TEMPORADAS) {
        const tid = tempBySlug[t.slug];
        await client.query(`DELETE FROM tarifa_temporada_periodo WHERE temporada_id = $1`, [tid]);
      }
      for (const p of PERIODOS) {
        const tid = tempBySlug[p.temporada];
        await client.query(
          `INSERT INTO tarifa_temporada_periodo (temporada_id, data_inicio, data_fim, ativo)
           VALUES ($1, $2, $3, true)`,
          [tid, p.inicio, p.fim],
        );
      }
      console.log(`[periodos] ${PERIODOS.length} inseridos`);
    } else {
      console.log(`[periodos] dry-run — ${PERIODOS.length} seriam inseridos`);
    }

    // Resolver 17 unidades
    const codigos = Object.keys(MAPA_17);
    const { rows: units } = await client.query(
      `SELECT id, codigo_externo, preco_diaria
       FROM acomodacoes
       WHERE codigo_externo = ANY($1)`,
      [codigos],
    );

    const byCode = Object.fromEntries(units.map((u) => [u.codigo_externo, u]));
    const missing = codigos.filter((c) => !byCode[c]);
    if (missing.length) {
      throw new Error(`Unidades faltando no DB (PARAR): ${missing.join(', ')}`);
    }
    if (units.length !== 17) {
      throw new Error(`Esperado 17 unidades, obtido ${units.length} — PARAR`);
    }

    // Abort se aparecer unidade fora do escopo pedida no argv --assert-only-17 (default)
    const extras = units.filter((u) => !MAPA_17[u.codigo_externo]);
    if (extras.length) {
      throw new Error(`Unidade fora do mapa 17: ${extras.map((e) => e.codigo_externo).join(', ')}`);
    }

    let regras = 0;
    for (const codigo of codigos) {
      const unit = byCode[codigo];
      const tipo = MAPA_17[codigo];
      const precos = PRECOS[tipo];
      const catId = dryRun ? null : catBySlug[tipo];

      for (const temporada of ['baixa', 'media', 'alta', 'feriado']) {
        const valor = precos[temporada];
        const tid = dryRun ? null : tempBySlug[temporada];
        console.log(
          `[regra] ${codigo} id=${unit.id} tipo=${tipo} ${temporada}=${valor} (flat=${unit.preco_diaria})`,
        );
        if (!dryRun) {
          // Idempotente: desativa regras anteriores desta unidade+temporada (carga etapa-a)
          await client.query(
            `UPDATE tarifa_regra SET ativo = false, atualizado_em = now()
             WHERE nivel = 'unidade'
               AND acomodacao_id = $1
               AND temporada_id = $2
               AND ativo = true`,
            [unit.id, tid],
          );
          await client.query(
            `INSERT INTO tarifa_regra
               (nivel, acomodacao_id, temporada_id, categoria_id, tipo_valor, valor, prioridade, ativo)
             VALUES ('unidade', $1, $2, $3, 'absoluto', $4, 10, true)`,
            [unit.id, tid, catId, valor],
          );
          regras += 1;
        }
      }
    }

    // Snapshot preco_diaria — garantir que não mudou nesta transação
    const { rows: afterPrices } = await client.query(
      `SELECT codigo_externo, preco_diaria::text AS preco
       FROM acomodacoes WHERE codigo_externo = ANY($1) ORDER BY id`,
      [codigos],
    );
    for (const row of afterPrices) {
      const before = String(byCode[row.codigo_externo].preco_diaria);
      if (String(row.preco) !== before && String(Number(row.preco)) !== String(Number(before))) {
        throw new Error(
          `GUARD: preco_diaria alterado para ${row.codigo_externo} (${before} → ${row.preco})`,
        );
      }
    }

    const { rows: cfg } = await client.query(
      `SELECT valores->>'tarifario_dinamico_ativo' AS ativo
       FROM configuracoes_sistema WHERE chave = 'tarifario'`,
    );
    if (cfg[0]?.ativo === 'true') {
      throw new Error('GUARD: tarifario_dinamico_ativo ficou true — abort');
    }

    if (dryRun) {
      await client.query('ROLLBACK');
      console.log('[seed-tarifa-carga-17] DRY-RUN OK — rollback');
    } else {
      await client.query('COMMIT');
      console.log(`[seed-tarifa-carga-17] OK — ${regras} regras; motor OFF; preco_diaria intacto`);
    }
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[seed-tarifa-carga-17] falhou:', err.message);
  process.exit(1);
});
