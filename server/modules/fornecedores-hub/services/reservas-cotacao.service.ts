import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { reservasCotacao } from '../../../../backend/src/db/schema/reservas-cotacao';
import type { NovaReservaCotacao, ReservaCotacao } from '../../../../backend/src/db/schema/reservas-cotacao';

export const reservasCotacaoService = {
  async create(data: NovaReservaCotacao): Promise<ReservaCotacao> {
    const [row] = await db.insert(reservasCotacao).values(data).returning();
    return row;
  },

  async findById(id: string): Promise<ReservaCotacao | null> {
    const [row] = await db.select().from(reservasCotacao).where(eq(reservasCotacao.id, id)).limit(1);
    return row ?? null;
  },

  async marcarCancelada(id: string): Promise<ReservaCotacao | null> {
    const [row] = await db
      .update(reservasCotacao)
      .set({ status: 'cancelada', canceladaEm: new Date() })
      .where(eq(reservasCotacao.id, id))
      .returning();
    return row ?? null;
  },

  async marcarConfirmada(id: string): Promise<ReservaCotacao | null> {
    const [row] = await db
      .update(reservasCotacao)
      .set({ status: 'confirmada', confirmadaEm: new Date() })
      .where(eq(reservasCotacao.id, id))
      .returning();
    return row ?? null;
  },
};
