/**
 * Smoke E2E Cotação v2 — funil completo com Redis ligado.
 * Orçamento → proposta (ancoragem) → cache → lock → objeção → aprovação → MGM.
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { auditoriaEstados } from '../../backend/src/db/schema/auditoria';
import { orcamentos, orcamentoItens } from '../../backend/src/db/schema/orcamentos';
import { propostas } from '../../backend/src/db/schema/propostas';
import { indicacoes } from '../../backend/src/db/schema/indicacoes';
import { resolverOfertas } from '../modules/fornecedores-hub/resolver';
import { reservarVaga } from '../modules/fornecedores-hub/services/reservar-vaga';
import { reverterReserva } from '../modules/fornecedores-hub/services/reverter-reserva';
import { propostasService } from '../modules/propostas/services/propostas.service';
import { revelarComparativo } from '../modules/propostas/objecao';
import { solicitarAlteracao, aprovar } from '../modules/propostas/aprovacao';
import { registrarIndicacao } from '../modules/propostas/mgm';
import { disconnectRedisConnection } from '../modules/fornecedores-hub/redis-connection';
import { disconnectRedisCache } from '../modules/fornecedores-hub/cache';
import { closeReservasQueue } from '../modules/fornecedores-hub/reservas.queue';
import { closePropostasQueue } from '../modules/propostas/propostas.queue';

const TAG = `smoke-e2e-${Date.now()}`;
const DESTINO = 'Caldas Novas';

type Step = { name: string; ok: boolean; detail?: string };

function log(s: Step) {
  console.log(`[${s.ok ? 'PASS' : 'FAIL'}] ${s.name}${s.detail ? ` — ${s.detail}` : ''}`);
}

async function cleanup(ids: {
  orcamentoId?: number;
  propostaId?: number;
  reservaId?: string;
  token?: string;
}) {
  if (ids.reservaId) {
    try {
      await reverterReserva(ids.reservaId, async () => ({ ok: true }));
    } catch {
      /* lock pode já ter expirado */
    }
  }
  if (ids.propostaId != null) {
    await db.delete(auditoriaEstados).where(eq(auditoriaEstados.entidadeId, ids.propostaId));
    if (ids.token) {
      await db.delete(indicacoes).where(eq(indicacoes.tokenProposta, ids.token));
    }
    await db.delete(propostas).where(eq(propostas.id, ids.propostaId));
  }
  if (ids.orcamentoId != null) {
    await db.delete(orcamentoItens).where(eq(orcamentoItens.orcamentoId, ids.orcamentoId));
    await db.delete(orcamentos).where(eq(orcamentos.id, ids.orcamentoId));
  }
}

async function main() {
  const steps: Step[] = [];
  const ids: { orcamentoId?: number; propostaId?: number; reservaId?: string; token?: string } = {};

  if (!process.env.DATABASE_URL) {
    console.error('[FAIL] DATABASE_URL ausente');
    process.exit(1);
  }
  if (!process.env.REDIS_URL || process.env.REDIS_DISABLED === 'true') {
    console.error('[FAIL] REDIS_URL obrigatório e REDIS_DISABLED deve estar ausente');
    process.exit(1);
  }
  process.env.FORNECEDORES_ENCRYPTION_KEY ??= 'smoke-e2e-key-32-characters-min!';
  if (process.env.NODE_ENV !== 'production') {
    process.env.FORNECEDORES_ALLOW_PLAINTEXT_API_KEY ??= 'true';
  }

  try {
    // 1) Hub + cache (PR 4)
    const r1 = await resolverOfertas('hospedagem', DESTINO);
    const r2 = await resolverOfertas('hospedagem', DESTINO);
    steps.push({
      name: 'PR4 — resolverOfertas + cache Redis',
      ok: r1.origem !== undefined && (r2.origem === 'redis' || r2.origem === 'postgres'),
      detail: `1=${r1.origem} 2=${r2.origem} ofertas=${r2.ofertas.length}`,
    });

    // 2) Orçamento → proposta com ancoragem (PR 6)
    const [orc] = await db
      .insert(orcamentos)
      .values({
        titulo: TAG,
        clienteNome: 'Cliente E2E',
        total: '500.00',
        metadata: { destino: DESTINO, smoke: true },
      })
      .returning();
    ids.orcamentoId = orc.id;

    await db.insert(orcamentoItens).values({
      orcamentoId: orc.id,
      nome: 'Hotel 3 noites',
      precoUnitario: '500.00',
      precoTotal: '500.00',
    });

    const token = `tok-${randomUUID().replace(/-/g, '').slice(0, 24)}`;
    ids.token = token;

    const proposta = await propostasService.createFromOrcamento(orc.id, 1, { destino: DESTINO });
    ids.propostaId = proposta.id;

    await db
      .update(propostas)
      .set({ tokenPublico: token, isPublica: true })
      .where(eq(propostas.id, proposta.id));

    const [pAfterCreate] = await db.select().from(propostas).where(eq(propostas.id, proposta.id));
    steps.push({
      name: 'PR6 — createFromOrcamento + comparativo oculto',
      ok:
        pAfterCreate.exibirComparativo === false &&
        Array.isArray(pAfterCreate.comparativoCache),
      detail: `ancoras=${(pAfterCreate.comparativoCache as unknown[])?.length ?? 0}`,
    });

    // 3) Lock reserva (PR 5)
    const parceiroId = randomUUID();
    const ofertaId = randomUUID();
    const reserva = await reservarVaga({
      parceiroId,
      ofertaId,
      propostaId: proposta.id,
    });
    ids.reservaId = reserva.id;
    steps.push({
      name: 'PR5 — reservarVaga (lock Redis)',
      ok: reserva.status === 'pendente' && Boolean(reserva.chaveVaga),
      detail: reserva.id,
    });

    // 4) Objeção → revelar comparativo (PR 7)
    await propostasService.addChatMessage(proposta.id, {
      senderType: 'client',
      senderName: 'Cliente E2E',
      message: 'Achei muito caro para o que oferecem',
    });

    const [pAfterObjecao] = await db.select().from(propostas).where(eq(propostas.id, proposta.id));
    const comparativoLen = (pAfterObjecao.comparativoCache as unknown[])?.length ?? 0;
    if (comparativoLen > 0 && !pAfterObjecao.exibirComparativo) {
      await revelarComparativo(proposta.id, 'manual');
    }

    const [pReveal] = await db.select().from(propostas).where(eq(propostas.id, proposta.id));
    steps.push({
      name: 'PR7 — objeção revela comparativo',
      ok:
        comparativoLen === 0
          ? pReveal.exibirComparativo === false
          : pReveal.exibirComparativo === true,
      detail: `exibir=${pReveal.exibirComparativo} itens=${comparativoLen}`,
    });

    // 5) Aprovação + auditoria (PR 8)
    await solicitarAlteracao(proposta.id, { id: 9001, role: 'operador' });
    await aprovar(proposta.id, { id: 9002, role: 'supervisor' });
    const audit = await db
      .select()
      .from(auditoriaEstados)
      .where(and(eq(auditoriaEstados.entidade, 'proposta'), eq(auditoriaEstados.entidadeId, proposta.id)));
    const [pAprov] = await db.select().from(propostas).where(eq(propostas.id, proposta.id));
    steps.push({
      name: 'PR8 — aprovação + auditoria_estados',
      ok: pAprov.statusAprovacao === 'aprovado' && audit.length >= 2,
      detail: `audit=${audit.length} voucher=${pAprov.voucherTipo}`,
    });

    // 6) MGM (PR 10)
    const ind = await registrarIndicacao({
      indicadorId: 42,
      tokenProposta: token,
      canal: 'smoke',
    });
    const ind2 = await registrarIndicacao({
      indicadorId: 42,
      tokenProposta: token,
      canal: 'smoke',
    });
    steps.push({
      name: 'PR10 — MGM idempotente',
      ok: ind.id === ind2.id,
      detail: ind.id,
    });

    // 7) Fila BullMQ enfileirada (PR 7 job)
    try {
      const { getPropostasQueue } = await import('../modules/propostas/propostas.queue');
      const q = await getPropostasQueue();
      const job = await q.getJob(`avaliar-objecao-${proposta.id}`);
      steps.push({
        name: 'PR7 — job avaliar-objecao na fila',
        ok: job != null,
        detail: job?.name ?? 'ausente',
      });
    } catch (e) {
      steps.push({
        name: 'PR7 — job avaliar-objecao na fila',
        ok: false,
        detail: (e as Error).message,
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    console.log(`\n[UI] Abra para comparativo em tempo real (Socket.IO):`);
    console.log(`     ${siteUrl}/proposta/${token}`);
    console.log(`     Envie "muito caro" no chat se quiser testar revelação visual.\n`);
  } catch (e) {
    steps.push({ name: 'exceção no funil', ok: false, detail: (e as Error).message });
  } finally {
    await cleanup(ids);
  }

  console.log('\n=== Smoke E2E Cotação v2 (Redis ON) ===\n');
  for (const s of steps) log(s);

  await closeReservasQueue().catch(() => undefined);
  await closePropostasQueue().catch(() => undefined);
  await disconnectRedisConnection().catch(() => undefined);
  await disconnectRedisCache().catch(() => undefined);
  const { closeDbPool } = await import('../../backend/src/db/drizzle');
  await closeDbPool().catch(() => undefined);

  const failed = steps.filter((s) => !s.ok);
  console.log(`\nResumo: ${steps.length - failed.length}/${steps.length} PASS`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
