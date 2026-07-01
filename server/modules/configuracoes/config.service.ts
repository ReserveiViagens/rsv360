import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { configuracoesSistema } from '../../../backend/src/db/schema/configuracoes-sistema';
import {
  CONFIG_PROPOSTA_PADRAO,
  configPropostaSchema,
  type ConfigProposta,
} from '../fornecedores-hub/schema';

const CHAVE_MODULO_PROPOSTAS = 'modulo_propostas';

export class ConfigService {
  static async obterRegrasCotacao(): Promise<ConfigProposta> {
    try {
      const [row] = await db
        .select()
        .from(configuracoesSistema)
        .where(eq(configuracoesSistema.chave, CHAVE_MODULO_PROPOSTAS))
        .limit(1);

      if (!row?.valores) return CONFIG_PROPOSTA_PADRAO;

      const parsed = configPropostaSchema.safeParse(row.valores);
      return parsed.success ? parsed.data : CONFIG_PROPOSTA_PADRAO;
    } catch {
      return CONFIG_PROPOSTA_PADRAO;
    }
  }

  static async salvarRegrasCotacao(partial: Partial<ConfigProposta>): Promise<ConfigProposta> {
    const atual = await this.obterRegrasCotacao();
    const merged = configPropostaSchema.parse({ ...atual, ...partial });

    const [existing] = await db
      .select()
      .from(configuracoesSistema)
      .where(eq(configuracoesSistema.chave, CHAVE_MODULO_PROPOSTAS))
      .limit(1);

    if (existing) {
      await db
        .update(configuracoesSistema)
        .set({ valores: merged, updatedAt: new Date() })
        .where(eq(configuracoesSistema.chave, CHAVE_MODULO_PROPOSTAS));
    } else {
      await db.insert(configuracoesSistema).values({
        chave: CHAVE_MODULO_PROPOSTAS,
        valores: merged,
      });
    }

    return merged;
  }
}

module.exports = { ConfigService };
