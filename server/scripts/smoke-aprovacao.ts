/**
 * Smoke PR 8 — trilha de aprovação + insert em auditoria_estados.
 * Uso: DATABASE_URL + postgres/redis (opcional) no Docker.
 */
import 'dotenv/config';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { auditoriaEstados } from '../../backend/src/db/schema/auditoria';
import { propostas } from '../../backend/src/db/schema/propostas';
import {
  aprovar,
  negar,
  solicitarAlteracao,
} from '../modules/propostas/aprovacao';

const SMOKE_TAG = `smoke-aprovacao-${Date.now()}`;

type StepResult = { name: string; ok: boolean; detail?: string };

function log(step: StepResult) {
  const icon = step.ok ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${step.name}${step.detail ? ` — ${step.detail}` : ''}`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('[FAIL] DATABASE_URL ausente');
    process.exit(1);
  }

  const steps: StepResult[] = [];
  let propostaId: number | null = null;

  try {
    const [created] = await db
      .insert(propostas)
      .values({
        titulo: SMOKE_TAG,
        clienteNome: 'Smoke PR8',
        valorTotal: '1000.00',
        statusAprovacao: 'nao_requer',
        metadata: { smoke: true, tag: SMOKE_TAG },
      })
      .returning();

    propostaId = created.id;
    const idType = typeof created.id;
    steps.push({
      name: 'propostas.id tipo',
      ok: idType === 'number' && Number.isInteger(created.id),
      detail: `${idType} (${created.id}) — esperado: integer serial`,
    });

    const operador = { id: 9001, role: 'operador' };
    const supervisor = { id: 9002, role: 'supervisor' };

    const solicitado = await solicitarAlteracao(propostaId, operador);
    steps.push({
      name: 'solicitarAlteracao → solicitado',
      ok: solicitado?.statusAprovacao === 'solicitado',
      detail: String(solicitado?.statusAprovacao),
    });

    const aprovada = await aprovar(propostaId, supervisor);
    const [afterAprovar] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
    steps.push({
      name: 'aprovar → aprovado + voucher definitivo',
      ok:
        aprovada?.statusAprovacao === 'aprovado' && afterAprovar?.voucherTipo === 'definitivo',
      detail: `status=${aprovada?.statusAprovacao} voucher=${afterAprovar?.voucherTipo}`,
    });

    const auditRows = await db
      .select()
      .from(auditoriaEstados)
      .where(and(eq(auditoriaEstados.entidade, 'proposta'), eq(auditoriaEstados.entidadeId, propostaId)))
      .orderBy(desc(auditoriaEstados.criadoEm));

    steps.push({
      name: 'auditoria_estados — 2 registros',
      ok: auditRows.length >= 2,
      detail: `count=${auditRows.length}`,
    });

    const entidadeIdTypes = [...new Set(auditRows.map((r) => typeof r.entidadeId))];
    const idsMatch = auditRows.every((r) => r.entidadeId === propostaId);
    steps.push({
      name: 'entidade_id === propostas.id',
      ok: idsMatch && entidadeIdTypes.length === 1 && entidadeIdTypes[0] === 'number',
      detail: `entidadeId types=${entidadeIdTypes.join(',')} match=${idsMatch}`,
    });

    const transicoes = auditRows.map((r) => `${r.de}→${r.para}`).join(', ');
    steps.push({
      name: 'transições auditadas',
      ok: transicoes.includes('nao_requer→solicitado') && transicoes.includes('solicitado→aprovado'),
      detail: transicoes,
    });

    // Proposta nova para trilha negar
    const [negTest] = await db
      .insert(propostas)
      .values({
        titulo: `${SMOKE_TAG}-negar`,
        clienteNome: 'Smoke PR8 Negar',
        valorTotal: '500.00',
        statusAprovacao: 'nao_requer',
      })
      .returning();

    await solicitarAlteracao(negTest.id, operador);
    const negada = await negar(negTest.id, supervisor, 'Teste smoke PR8');
    steps.push({
      name: 'negar com motivo',
      ok: negada?.statusAprovacao === 'negado',
      detail: negada?.statusAprovacao,
    });

    await db.delete(auditoriaEstados).where(eq(auditoriaEstados.entidadeId, negTest.id));
    await db.delete(propostas).where(eq(propostas.id, negTest.id));
  } catch (error) {
    steps.push({ name: 'exceção inesperada', ok: false, detail: (error as Error).message });
  } finally {
    if (propostaId != null) {
      await db.delete(auditoriaEstados).where(eq(auditoriaEstados.entidadeId, propostaId));
      await db.delete(propostas).where(eq(propostas.id, propostaId));
    }
  }

  console.log('\n=== Smoke PR 8 — auditoria_estados ===\n');
  for (const s of steps) log(s);

  const failed = steps.filter((s) => !s.ok);
  console.log(`\nResumo: ${steps.length - failed.length}/${steps.length} PASS`);
  if (failed.length) {
    process.exit(1);
  }
  console.log('\nConclusão: propostas.id é integer (serial); compatível com auditoria_estados.entidade_id.');
}

main()
  .then(async () => {
    const { closeDbPool } = await import('../../backend/src/db/drizzle');
    await closeDbPool();
  })
  .catch(async (err) => {
    console.error(err);
    const { closeDbPool } = await import('../../backend/src/db/drizzle');
    await closeDbPool().catch(() => undefined);
    process.exit(1);
  });
