import { desc, eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import {
  fornecedoresApi,
  type FornecedorApi,
  type NewFornecedorApi,
} from '../../../../backend/src/db/schema/fornecedores-api';
import { encryptApiKey } from '../crypto';
import { toPublicFornecedorApi } from '../public-dto';

function encryptIfPresent(apiKey: string | undefined): string | undefined {
  if (apiKey === undefined) return undefined;
  return encryptApiKey(apiKey);
}

export class FornecedoresApiService {
  async list() {
    const rows = await db.select().from(fornecedoresApi).orderBy(desc(fornecedoresApi.prioridade));
    return rows.map(toPublicFornecedorApi);
  }

  async getById(id: string) {
    const [row] = await db.select().from(fornecedoresApi).where(eq(fornecedoresApi.id, id));
    return row ? toPublicFornecedorApi(row) : null;
  }

  /** Uso interno do hub — inclui api_key criptografada. */
  async listAtivosForHub(): Promise<FornecedorApi[]> {
    return db
      .select()
      .from(fornecedoresApi)
      .where(eq(fornecedoresApi.ativo, true))
      .orderBy(desc(fornecedoresApi.prioridade));
  }

  async create(data: NewFornecedorApi) {
    const [created] = await db
      .insert(fornecedoresApi)
      .values({ ...data, apiKey: encryptApiKey(data.apiKey) })
      .returning();
    return toPublicFornecedorApi(created);
  }

  async update(id: string, data: Partial<NewFornecedorApi>) {
    const patch = { ...data };
    if (patch.apiKey !== undefined) {
      patch.apiKey = encryptIfPresent(patch.apiKey);
    }
    const [updated] = await db
      .update(fornecedoresApi)
      .set(patch)
      .where(eq(fornecedoresApi.id, id))
      .returning();
    return updated ? toPublicFornecedorApi(updated) : null;
  }
}

export const fornecedoresApiService = new FornecedoresApiService();
