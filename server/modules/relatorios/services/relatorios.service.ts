import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { relatoriosSnapshots, relatoriosViews } from '../../../../backend/src/db/schema/relatorios';

export class RelatoriosService {
  async listViews(userId?: number) {
    if (userId) {
      return db.select().from(relatoriosViews).where(eq(relatoriosViews.userId, userId));
    }
    return db.select().from(relatoriosViews).orderBy(desc(relatoriosViews.createdAt));
  }

  async createView(data: Record<string, unknown>) {
    const [created] = await db
      .insert(relatoriosViews)
      .values(data as typeof relatoriosViews.$inferInsert)
      .returning();
    return created;
  }

  async createSnapshot(data: Record<string, unknown>) {
    const [created] = await db
      .insert(relatoriosSnapshots)
      .values(data as typeof relatoriosSnapshots.$inferInsert)
      .returning();
    return created;
  }

  async listSnapshots(viewId?: number) {
    if (viewId) {
      return db.select().from(relatoriosSnapshots).where(eq(relatoriosSnapshots.viewId, viewId));
    }
    return db.select().from(relatoriosSnapshots).orderBy(desc(relatoriosSnapshots.createdAt));
  }
}

export const relatoriosService = new RelatoriosService();
module.exports = { RelatoriosService, relatoriosService };
