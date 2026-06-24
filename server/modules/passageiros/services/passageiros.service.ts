import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { fnrhRegistros } from '../../../../backend/src/db/schema/fase1-ext';
import { passageiroExcursao, passageiros } from '../../../../backend/src/db/schema/passageiros';

type Documento = { tipo: string; numero?: string; url?: string; validade?: string };

function parseDocs(raw: unknown): Documento[] {
  if (Array.isArray(raw)) return raw as Documento[];
  return [];
}

export class PassageirosService {
  async list(enterpriseId?: number) {
    if (enterpriseId) {
      return db.select().from(passageiros).where(eq(passageiros.enterpriseId, enterpriseId));
    }
    return db.select().from(passageiros).orderBy(desc(passageiros.createdAt));
  }

  async getById(id: number) {
    const [row] = await db.select().from(passageiros).where(eq(passageiros.id, id));
    if (!row) return null;
    const excursao = await db
      .select()
      .from(passageiroExcursao)
      .where(eq(passageiroExcursao.passageiroId, id));
    const fnrh = await db.select().from(fnrhRegistros).where(eq(fnrhRegistros.passageiroId, id));
    return { ...row, excursao, fnrh };
  }

  async create(data: Record<string, unknown>) {
    const [created] = await db
      .insert(passageiros)
      .values(data as typeof passageiros.$inferInsert)
      .returning();
    return created;
  }

  async update(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(passageiros)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof passageiros.$inferInsert>)
      .where(eq(passageiros.id, id))
      .returning();
    return updated ?? null;
  }

  async remove(id: number) {
    const [deleted] = await db.delete(passageiros).where(eq(passageiros.id, id)).returning();
    return deleted ?? null;
  }

  async addDocumento(passageiroId: number, doc: Documento) {
    const [row] = await db.select().from(passageiros).where(eq(passageiros.id, passageiroId));
    if (!row) throw new Error('Passageiro não encontrado');
    const docs = [...parseDocs(row.documentos), doc];
    return this.update(passageiroId, { documentos: docs });
  }

  async removeDocumento(passageiroId: number, index: number) {
    const [row] = await db.select().from(passageiros).where(eq(passageiros.id, passageiroId));
    if (!row) throw new Error('Passageiro não encontrado');
    const docs = parseDocs(row.documentos).filter((_, i) => i !== index);
    return this.update(passageiroId, { documentos: docs });
  }

  async createFnrh(passageiroId: number, data: Record<string, unknown>) {
    const [created] = await db
      .insert(fnrhRegistros)
      .values({ ...data, passageiroId } as typeof fnrhRegistros.$inferInsert)
      .returning();
    return created;
  }

  async updateFnrh(id: number, data: Record<string, unknown>) {
    const [updated] = await db
      .update(fnrhRegistros)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof fnrhRegistros.$inferInsert>)
      .where(eq(fnrhRegistros.id, id))
      .returning();
    return updated ?? null;
  }

  async linkExcursao(passageiroId: number, data: Record<string, unknown>) {
    const [created] = await db
      .insert(passageiroExcursao)
      .values({ ...data, passageiroId } as typeof passageiroExcursao.$inferInsert)
      .returning();
    return created;
  }
}

export const passageirosService = new PassageirosService();
module.exports = { PassageirosService, passageirosService };
