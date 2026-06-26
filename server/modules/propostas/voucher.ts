import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { propostas } from '../../../backend/src/db/schema/propostas';

export type VoucherTipo = 'provisorio' | 'definitivo';

export async function emitirVoucherProvisorio(propostaId: number): Promise<void> {
  await db
    .update(propostas)
    .set({ voucherTipo: 'provisorio', updatedAt: new Date() })
    .where(eq(propostas.id, propostaId));
}

export async function emitirVoucherDefinitivo(propostaId: number): Promise<void> {
  await db
    .update(propostas)
    .set({ voucherTipo: 'definitivo', updatedAt: new Date() })
    .where(eq(propostas.id, propostaId));
}
