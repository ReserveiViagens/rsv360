import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import {
  fornecedoresApi,
  type NewFornecedorApi,
} from '../../../../backend/src/db/schema/fornecedores-api';

export class FornecedoresApiService {
  async list() {
    return db.select().from(fornecedoresApi).orderBy(desc(fornecedoresApi.prioridade));
  }

  async getById(id: string) {
    const [row] = await db.select().from(fornecedoresApi).where(eq(fornecedoresApi.id, id));
    return row ?? null;
  }

  async create(data: NewFornecedorApi) {
    const [created] = await db.insert(fornecedoresApi).values(data).returning();
    return created;
  }

  async update(id: string, data: Partial<NewFornecedorApi>) {
    const [updated] = await db
      .update(fornecedoresApi)
      .set(data)
      .where(eq(fornecedoresApi.id, id))
      .returning();
    return updated ?? null;
  }
}

export const fornecedoresApiService = new FornecedoresApiService();
