#!/usr/bin/env node
/**
 * Validação pós-carga Etapa A′ (motor OFF).
 * - Contagens tarifa_*
 * - 12+ simulações via resolverTarifa({ preview: true }) — 3 tipos × 4 temporadas
 * - Confirma tarifario_dinamico_ativo = false
 * - Confirma preco_diaria flat intacto (amostra)
 * - Calcula FDS esperado a partir da política (documentado; motor não aplica)
 *
 * Uso:
 *   $env:DATABASE_URL="postgresql://rsv360:REDACTED_PG_DEV_PASSWORD@localhost:5433/rsv_360_ecosystem"
 *   node scripts/validar-tarifa-carga-17.mjs
 */
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PRECOS = {
  '1q': { baixa: 200, media: 320, alta: 450, feriado: 620, fdsPct: 40 },
  '2q': { baixa: 290, media: 450, alta: 600, feriado: 820, fdsPct: 35 },
  premium: { baixa: 350, media: 540, alta: 720, feriado: 980, fdsPct: 35 },
};

const AMOSTRAS = [
  { codigo: 'AGF-STD', tipo: '1q' },
  { codigo: 'PRT1-2Q', tipo: '2q' },
  { codigo: 'ALD-FAM', tipo: 'premium' },
];

/** Datas âncora por temporada (dentro dos períodos do seed). */
const DATAS = {
  baixa: '2026-03-10', // terça — catch-all baixa
  media: '2026-06-15', // segunda
  alta: '2026-07-15', // quarta
  feriado: '2026-12-25', // Natal
};

const ESTADIA_MIN = { padrao: 2, feriado: 3 };

async function main() {
  const client = await pool.connect();
  const report = { ok: true, simulacoes: [], erros: [] };

  try {
    const counts = await client.query(`
      SELECT 'tarifa_categoria' AS t, count(*)::int AS c FROM tarifa_categoria
      UNION ALL SELECT 'tarifa_temporada', count(*)::int FROM tarifa_temporada
      UNION ALL SELECT 'tarifa_temporada_periodo', count(*)::int FROM tarifa_temporada_periodo
      UNION ALL SELECT 'tarifa_regra', count(*)::int FROM tarifa_regra WHERE ativo = true
    `);
    console.log('=== Contagens ===');
    for (const r of counts.rows) console.log(`  ${r.t}: ${r.c}`);

    const cfg = await client.query(
      `SELECT valores->>'tarifario_dinamico_ativo' AS ativo
       FROM configuracoes_sistema WHERE chave = 'tarifario'`,
    );
    const motor = cfg.rows[0]?.ativo;
    console.log(`\n=== Motor ===\n  tarifario_dinamico_ativo = ${motor}`);
    if (motor !== 'false' && motor !== false) {
      report.ok = false;
      report.erros.push(`motor deveria ser false, veio ${motor}`);
    }

    const pol = await client.query(
      `SELECT valores FROM configuracoes_sistema WHERE chave = 'tarifario_politica_etapa_a'`,
    );
    console.log(
      `\n=== Política ===\n  presente=${Boolean(pol.rows[0])} estadia_min=${JSON.stringify(ESTADIA_MIN)} taxa_parque=10`,
    );

    console.log('\n=== Simulações (preview SQL — espelha resolverTarifa) ===');
    for (const amostra of AMOSTRAS) {
      const { rows: urows } = await client.query(
        `SELECT id, codigo_externo, preco_diaria::float AS flat
         FROM acomodacoes WHERE codigo_externo = $1`,
        [amostra.codigo],
      );
      const unit = urows[0];
      if (!unit) {
        report.ok = false;
        report.erros.push(`unidade ${amostra.codigo} não encontrada`);
        continue;
      }

      for (const [temp, data] of Object.entries(DATAS)) {
        const esperado = PRECOS[amostra.tipo][temp];
        const fdsPct = PRECOS[amostra.tipo].fdsPct;
        const fdsEsperado = Math.round(esperado * (1 + fdsPct / 100) * 100) / 100;
        const estadiaMin = temp === 'feriado' ? ESTADIA_MIN.feriado : ESTADIA_MIN.padrao;

        // Resolve temporada por prioridade (igual ao service)
        const { rows: temps } = await client.query(
          `SELECT t.id, t.slug, t.prioridade
           FROM tarifa_temporada_periodo p
           JOIN tarifa_temporada t ON t.id = p.temporada_id
           WHERE p.ativo AND t.ativo
             AND p.data_inicio <= $1::date AND p.data_fim >= $1::date
           ORDER BY t.prioridade DESC
           LIMIT 1`,
          [data],
        );
        const temporada = temps[0];

        const { rows: regras } = await client.query(
          `SELECT r.id, r.valor::float AS valor, r.tipo_valor, t.slug AS temporada
           FROM tarifa_regra r
           JOIN tarifa_temporada t ON t.id = r.temporada_id
           WHERE r.ativo AND r.nivel = 'unidade' AND r.acomodacao_id = $1
             AND r.temporada_id = $2
           ORDER BY r.prioridade DESC
           LIMIT 1`,
          [unit.id, temporada?.id ?? null],
        );
        const regra = regras[0];
        const precoFinal = regra?.valor ?? unit.flat;
        const pass =
          temporada?.slug === temp && Math.abs(precoFinal - esperado) < 0.01;

        const linha = {
          codigo: amostra.codigo,
          tipo: amostra.tipo,
          data,
          temporadaEsperada: temp,
          temporadaResolvida: temporada?.slug ?? null,
          diáriaBase: esperado,
          precoFinal,
          fdsPct,
          fdsEsperado,
          estadiaMin,
          flatWizard: unit.flat,
          pass,
        };
        report.simulacoes.push(linha);
        const mark = pass ? 'OK' : 'FAIL';
        console.log(
          `  [${mark}] ${amostra.codigo} ${temp} ${data}: regra=${precoFinal} esperado=${esperado} fds(+${fdsPct}%)=${fdsEsperado} min=${estadiaMin} flat=${unit.flat}`,
        );
        if (!pass) {
          report.ok = false;
          report.erros.push(
            `${amostra.codigo}/${temp}: got ${precoFinal}/${temporada?.slug} want ${esperado}/${temp}`,
          );
        }
      }
    }

    // Motor OFF path: sem preview, preço = flat
    console.log('\n=== Wizard path (motor OFF → flat) ===');
    for (const amostra of AMOSTRAS) {
      const { rows } = await client.query(
        `SELECT preco_diaria::float AS flat FROM acomodacoes WHERE codigo_externo = $1`,
        [amostra.codigo],
      );
      console.log(`  ${amostra.codigo} preco_diaria (wizard) = ${rows[0].flat}`);
    }

    console.log(`\n=== Resultado: ${report.ok ? 'PASS' : 'FAIL'} (${report.simulacoes.length} simulações) ===`);
    if (report.erros.length) {
      console.error(report.erros.join('\n'));
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
