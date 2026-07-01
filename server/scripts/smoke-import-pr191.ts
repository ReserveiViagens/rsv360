/**
 * Smoke-test PR 19.1 importador contra schema 0021 (sem dados reais de produção).
 * Uso: DATABASE_URL=... npx tsx server/scripts/smoke-import-pr191.ts
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import express from 'express';
import request from 'supertest';
import * as XLSX from 'xlsx';
import { Pool } from 'pg';
import { registerAcomodacoesModule } from '../modules/acomodacoes';
import { COLUNAS_MODELO } from '../modules/acomodacoes/import/modelo';

const { signJwt } = require('../../backend/src/api/v1/auth/jwt-verify');

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://rsv360:rsv360_dev_2024@127.0.0.1:5433/rsv_360_ecosystem';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const SAMPLE_ROWS = [
  {
    codigo_externo: 'SMOKE-APT-01',
    empreendimento: 'hotel-demo-1',
    tipo: 'apto',
    titulo: 'Smoke Apto 2Q',
    quartos: 2,
    capacidade_max: 7,
    config_sala: 'nenhum',
    config_banheiro: 'so_wc_social',
    preco_diaria: 299,
    utensilios: 'panela;copos',
    eletrodomesticos: 'geladeira',
    amenidades: 'wifi',
  },
  {
    codigo_externo: 'SMOKE-CASA-01',
    empreendimento: 'Hotel Rio Quente Resorts',
    tipo: 'casa',
    titulo: 'Smoke Casa Família',
    quartos: 3,
    capacidade_max: 5,
    config_sala: 'sofa_cama',
    config_banheiro: 'so_suite',
    preco_diaria: 450,
    utensilios: 'panela',
    eletrodomesticos: 'micro-ondas',
    amenidades: 'ar_condicionado',
  },
];

function fail(msg: string): never {
  console.error(`SMOKE_FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string) {
  if (!cond) fail(msg);
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const app = express();
  registerAcomodacoesModule(app);

  const token = signJwt(
    { userId: 1, email: 'admin@rsv360.com.br', name: 'Admin', role: 'admin' },
    JWT_SECRET,
    3600,
  );
  const auth = { Authorization: `Bearer ${token}` };

  // 1) GET modelo.xlsx
  const modeloRes = await request(app)
    .get('/api/v1/acomodacoes/import/modelo.xlsx')
    .set(auth)
    .buffer(true)
    .parse((res, cb) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => cb(null, Buffer.concat(chunks)));
    });
  assert(modeloRes.status === 200, `modelo.xlsx status ${modeloRes.status}`);
  assert(
    modeloRes.headers['content-type']?.includes('spreadsheetml'),
    'content-type xlsx',
  );

  const modeloWb = XLSX.read(modeloRes.body, { type: 'buffer' });
  const modeloSheet = modeloWb.Sheets[modeloWb.SheetNames[0]];
  const modeloHeaders = XLSX.utils.sheet_to_json<Record<string, unknown>>(modeloSheet, {
    header: 1,
  })[0] as string[];
  for (const col of COLUNAS_MODELO) {
    assert(modeloHeaders.includes(col), `modelo sem coluna ${col}`);
  }
  console.log('STEP1_OK: modelo.xlsx com colunas canônicas');

  // 2) Montar xlsx de amostra
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-import-'));
  const samplePath = path.join(tmpDir, 'smoke-amostra.xlsx');
  const sampleSheet = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: [...COLUNAS_MODELO] });
  const sampleWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(sampleWb, sampleSheet, 'acomodacoes');
  XLSX.writeFile(sampleWb, samplePath);
  console.log('STEP2_OK: amostra 2 linhas montada');

  // 3) POST preview
  const previewRes = await request(app)
    .post('/api/v1/acomodacoes/import/preview')
    .set(auth)
    .attach('file', samplePath);
  assert(previewRes.status === 200, `preview status ${previewRes.status}: ${JSON.stringify(previewRes.body)}`);
  const preview = previewRes.body.data;
  assert(preview.erros === 0, `preview erros=${preview.erros}`);
  assert(preview.sucesso === 2, `preview sucesso=${preview.sucesso}`);
  assert(preview.dryRun === true, 'preview deve ser dry-run');
  console.log('STEP3_OK: preview 0 erros, 2 linhas OK');
  console.log('PREVIEW_RELATORIO:', JSON.stringify(preview.linhas, null, 2));

  // 4) POST commit (1ª vez)
  const commit1 = await request(app)
    .post('/api/v1/acomodacoes/import/commit')
    .set(auth)
    .attach('file', samplePath);
  assert(commit1.status === 200, `commit1 status ${commit1.status}`);
  assert(commit1.body.data.erros === 0, `commit1 erros=${commit1.body.data.erros}`);
  const acoes1 = commit1.body.data.linhas.map((l: { acao?: string }) => l.acao);
  assert(acoes1.every((a: string) => a === 'insert'), `commit1 acoes=${acoes1.join(',')}`);
  console.log('STEP4a_OK: commit insert x2');

  // 4) POST commit (2ª vez — idempotente)
  const commit2 = await request(app)
    .post('/api/v1/acomodacoes/import/commit')
    .set(auth)
    .attach('file', samplePath);
  assert(commit2.status === 200, `commit2 status ${commit2.status}`);
  const acoes2 = commit2.body.data.linhas.map((l: { acao?: string }) => l.acao);
  assert(acoes2.every((a: string) => a === 'update'), `commit2 acoes=${acoes2.join(',')} (esperado update)`);
  console.log('STEP4b_OK: commit idempotente update x2');

  // 5) Validar banco
  const { rows } = await pool.query<{
    codigo_externo: string;
    hotel_id: string;
    titulo: string;
    dados_completos: boolean;
    ativo: boolean;
    capacidade_max: number;
  }>(
    `SELECT codigo_externo, hotel_id, titulo, dados_completos, ativo, capacidade_max
     FROM acomodacoes
     WHERE codigo_externo IN ('SMOKE-APT-01', 'SMOKE-CASA-01')
     ORDER BY codigo_externo`,
  );
  assert(rows.length === 2, `esperado 2 linhas no banco, got ${rows.length}`);
  for (const row of rows) {
    assert(row.dados_completos === false, `${row.codigo_externo} dados_completos`);
    assert(row.ativo === true, `${row.codigo_externo} ativo`);
    assert(row.hotel_id === 'hotel-demo-1', `${row.codigo_externo} hotel_id=${row.hotel_id}`);
  }

  const preview2 = await request(app)
    .post('/api/v1/acomodacoes/import/preview')
    .set(auth)
    .attach('file', samplePath);
  assert(preview2.body.data.erros === 0, 'preview2 erros');
  console.log('STEP5_OK: banco validado + preview2 sem erros');
  console.log('DB_ROWS:', JSON.stringify(rows, null, 2));

  // 6) Limpar amostra
  const del = await pool.query(
    `DELETE FROM acomodacoes WHERE codigo_externo IN ('SMOKE-APT-01', 'SMOKE-CASA-01') RETURNING id`,
  );
  assert(del.rowCount === 2, `delete rowCount=${del.rowCount}`);

  const { rows: countRows } = await pool.query<{ c: string }>(
    'SELECT COUNT(*)::text AS c FROM acomodacoes',
  );
  assert(countRows[0].c === '0', `acomodacoes count=${countRows[0].c}`);
  console.log('STEP6_OK: amostra removida, acomodacoes=0');

  await pool.end();
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log('\nSMOKE_TEST_OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
