import { and, eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { auditoriaEstados } from '../../../backend/src/db/schema/auditoria';
import { propostas } from '../../../backend/src/db/schema/propostas';
import { emitirVoucherDefinitivo } from './voucher';

export type StatusAprovacao =
  | 'nao_requer'
  | 'pendente'
  | 'solicitado'
  | 'aprovado'
  | 'negado';

const TRANSICOES: Record<StatusAprovacao, StatusAprovacao[]> = {
  nao_requer: ['solicitado'],
  pendente: ['solicitado'],
  solicitado: ['aprovado', 'negado'],
  aprovado: [],
  negado: ['solicitado'],
};

export class TransicaoInvalidaError extends Error {
  readonly statusCode = 409;
  constructor(de: string, para: string) {
    super(`Transição inválida: ${de} → ${para}`);
    this.name = 'TransicaoInvalidaError';
  }
}

export function transicaoPermitida(de: StatusAprovacao, para: StatusAprovacao): boolean {
  return TRANSICOES[de]?.includes(para) ?? false;
}

async function registrarAuditoria(
  tx: typeof db,
  propostaId: number,
  de: string,
  para: string,
  autor: { id: number; role: string },
  motivo?: string,
) {
  await tx.insert(auditoriaEstados).values({
    entidade: 'proposta',
    entidadeId: propostaId,
    de,
    para,
    autorId: autor.id,
    autorRole: autor.role,
    motivo: motivo ?? null,
  });
}

export async function solicitarAlteracao(
  propostaId: number,
  autor: { id: number; role: string },
) {
  return alterarStatusAprovacao(propostaId, 'solicitado', autor);
}

export async function aprovar(propostaId: number, autor: { id: number; role: string }) {
  const updated = await alterarStatusAprovacao(propostaId, 'aprovado', autor, {
    aprovadoPor: autor.id,
  });
  if (updated) await emitirVoucherDefinitivo(propostaId);
  return updated;
}

export async function negar(
  propostaId: number,
  autor: { id: number; role: string },
  motivo: string,
) {
  if (!motivo?.trim()) throw new Error('Motivo obrigatório para negar');
  return alterarStatusAprovacao(propostaId, 'negado', autor, { motivo });
}

async function alterarStatusAprovacao(
  propostaId: number,
  para: StatusAprovacao,
  autor: { id: number; role: string },
  extra?: { aprovadoPor?: number; motivo?: string },
) {
  const [row] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
  if (!row) throw new Error('Proposta não encontrada');

  const de = (row.statusAprovacao ?? 'nao_requer') as StatusAprovacao;
  if (!transicaoPermitida(de, para)) {
    throw new TransicaoInvalidaError(de, para);
  }

  return db.transaction(async (tx: typeof db) => {
    const [updated] = await tx
      .update(propostas)
      .set({
        statusAprovacao: para,
        solicitadoPor: para === 'solicitado' ? autor.id : row.solicitadoPor,
        aprovadoPor: extra?.aprovadoPor ?? row.aprovadoPor,
        updatedAt: new Date(),
      })
      .where(eq(propostas.id, propostaId))
      .returning();

    await registrarAuditoria(tx, propostaId, de, para, autor, extra?.motivo);
    return updated;
  });
}

export function assertPodeSincronizar(statusAprovacao?: string | null): void {
  const ok = statusAprovacao === 'aprovado' || statusAprovacao === 'nao_requer';
  if (!ok) {
    throw new Error('Sincronização bloqueada até aprovação');
  }
}
