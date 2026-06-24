import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { fornecedores, reservasLogistica, vouchers } from '../../../../backend/src/db/schema/fase1-ext';
import { embarques, transportes } from '../../../../backend/src/db/schema/logistica';

export class LogisticaService {
  async listSummary() {
    const [t, e, f, r, v] = await Promise.all([
      this.listTransportes(),
      this.listEmbarques(),
      this.listFornecedores(),
      this.listReservas(),
      this.listVouchers(),
    ]);
    return {
      transportes: t.length,
      embarques: e.length,
      fornecedores: f.length,
      reservas: r.length,
      vouchers: v.length,
    };
  }

  async listTransportes() {
    return db.select().from(transportes).orderBy(desc(transportes.createdAt));
  }

  async getTransporte(id: number) {
    const [row] = await db.select().from(transportes).where(eq(transportes.id, id));
    return row ?? null;
  }

  async createTransporte(data: Record<string, unknown>) {
    const [created] = await db.insert(transportes).values(data as typeof transportes.$inferInsert).returning();
    return created;
  }

  async updateTransporte(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(transportes)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof transportes.$inferInsert>)
      .where(eq(transportes.id, id))
      .returning();
    return updated ?? null;
  }

  async listEmbarques(travelPackageId?: number) {
    if (travelPackageId) {
      return db.select().from(embarques).where(eq(embarques.travelPackageId, travelPackageId));
    }
    return db.select().from(embarques).orderBy(desc(embarques.dataHora));
  }

  async createEmbarque(data: Record<string, unknown>) {
    const [created] = await db.insert(embarques).values(data as typeof embarques.$inferInsert).returning();
    return created;
  }

  async listFornecedores() {
    return db.select().from(fornecedores).orderBy(desc(fornecedores.createdAt));
  }

  async createFornecedor(data: Record<string, unknown>) {
    const [created] = await db.insert(fornecedores).values(data as typeof fornecedores.$inferInsert).returning();
    return created;
  }

  async updateFornecedor(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(fornecedores)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof fornecedores.$inferInsert>)
      .where(eq(fornecedores.id, id))
      .returning();
    return updated ?? null;
  }

  async listReservas() {
    return db.select().from(reservasLogistica).orderBy(desc(reservasLogistica.createdAt));
  }

  async createReserva(data: Record<string, unknown>) {
    const [created] = await db
      .insert(reservasLogistica)
      .values(data as typeof reservasLogistica.$inferInsert)
      .returning();
    return created;
  }

  async updateReserva(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(reservasLogistica)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof reservasLogistica.$inferInsert>)
      .where(eq(reservasLogistica.id, id))
      .returning();
    return updated ?? null;
  }

  async listVouchers() {
    return db.select().from(vouchers).orderBy(desc(vouchers.createdAt));
  }

  async createVoucher(data: Record<string, unknown>) {
    const codigo = (data.codigo as string) || `VCH-${Date.now().toString(36).toUpperCase()}`;
    const [created] = await db
      .insert(vouchers)
      .values({ ...data, codigo } as typeof vouchers.$inferInsert)
      .returning();
    return created;
  }

  async updateVoucher(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(vouchers)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof vouchers.$inferInsert>)
      .where(eq(vouchers.id, id))
      .returning();
    return updated ?? null;
  }
}

export const logisticaService = new LogisticaService();
module.exports = { LogisticaService, logisticaService };
