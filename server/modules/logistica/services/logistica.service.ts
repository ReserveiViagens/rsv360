import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { embarques, transportes } from '../../../../backend/src/db/schema/logistica';

export class LogisticaService {
  async listTransportes() {
    return db.select().from(transportes).orderBy(desc(transportes.createdAt));
  }

  async createTransporte(data: Record<string, unknown>) {
    const [created] = await db.insert(transportes).values(data as typeof transportes.$inferInsert).returning();
    return created;
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
}

export const logisticaService = new LogisticaService();
module.exports = { LogisticaService, logisticaService };
