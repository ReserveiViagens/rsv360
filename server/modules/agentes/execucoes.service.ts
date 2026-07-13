import { db } from '../../lib/db';
import {
  agenteExecucoes,
  type AgenteCacheHit,
  type AgenteTier,
} from '../../../backend/src/db/schema/agentes';

export type RegistrarExecucaoInput = {
  agente: string;
  canal?: string | null;
  entradaHash: string;
  tier: AgenteTier;
  cacheHit: AgenteCacheHit;
  modelo?: string | null;
  tokensIn?: number | null;
  tokensOut?: number | null;
  custoEstimado?: string | number | null;
  duracaoMs?: number | null;
};

export class AgentesExecucoesService {
  static async registrar(input: RegistrarExecucaoInput) {
    const [row] = await db
      .insert(agenteExecucoes)
      .values({
        agente: input.agente,
        canal: input.canal ?? null,
        entradaHash: input.entradaHash,
        tier: input.tier,
        cacheHit: input.cacheHit,
        modelo: input.modelo ?? null,
        tokensIn: input.tokensIn ?? null,
        tokensOut: input.tokensOut ?? null,
        custoEstimado:
          input.custoEstimado == null ? null : String(input.custoEstimado),
        duracaoMs: input.duracaoMs ?? null,
      })
      .returning();

    return row;
  }
}
