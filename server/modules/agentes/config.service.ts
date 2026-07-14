import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { configuracoesSistema } from '../../../backend/src/db/schema/configuracoes-sistema';
import {
  AGENTES_CONFIG_PADRAO,
  CHAVE_AGENTES,
  configFromValores,
  parseAgenteInstrutorAtivo,
  parseAgentesModuloAtivo,
  type AgentesConfig,
} from './schema';

export class AgentesConfigService {
  static async obterConfig(): Promise<AgentesConfig> {
    try {
      const [row] = await db
        .select()
        .from(configuracoesSistema)
        .where(eq(configuracoesSistema.chave, CHAVE_AGENTES))
        .limit(1);

      if (!row?.valores || typeof row.valores !== 'object') {
        return { ...AGENTES_CONFIG_PADRAO };
      }

      return configFromValores(row.valores as Record<string, unknown>);
    } catch {
      return { ...AGENTES_CONFIG_PADRAO };
    }
  }

  /** Fail-safe: só true literal ativa o módulo. */
  static async isModuloAtivo(): Promise<boolean> {
    try {
      const [row] = await db
        .select()
        .from(configuracoesSistema)
        .where(eq(configuracoesSistema.chave, CHAVE_AGENTES))
        .limit(1);

      if (!row?.valores || typeof row.valores !== 'object') return false;
      return parseAgentesModuloAtivo(row.valores as Record<string, unknown>);
    } catch {
      return false;
    }
  }

  /** Dupla flag: módulo E instrutor precisam ser true literal. */
  static async isInstrutorAtivo(): Promise<boolean> {
    try {
      const [row] = await db
        .select()
        .from(configuracoesSistema)
        .where(eq(configuracoesSistema.chave, CHAVE_AGENTES))
        .limit(1);

      if (!row?.valores || typeof row.valores !== 'object') return false;
      const v = row.valores as Record<string, unknown>;
      return parseAgentesModuloAtivo(v) && parseAgenteInstrutorAtivo(v);
    } catch {
      return false;
    }
  }
}
