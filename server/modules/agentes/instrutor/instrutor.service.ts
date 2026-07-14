import { createHash } from 'crypto';
import { AgentesExecucoesService } from '../execucoes.service';
import { hashEntrada } from '../exact-cache';
import { normalizePergunta, type InstrutorPapel } from './tipos';
import { runInstrutorGraph } from './graph';

export class InstrutorService {
  static async perguntar(input: {
    pergunta: string;
    papel: Exclude<InstrutorPapel, 'ambos'>;
    canal?: string;
    userId?: number;
  }) {
    const started = Date.now();
    const result = await runInstrutorGraph(input.pergunta, input.papel, input.userId
      ? `instrutor:u${input.userId}`
      : undefined);

    const entradaHash =
      result.entradaHash ||
      hashEntrada(`${input.papel}|${normalizePergunta(input.pergunta)}`) ||
      createHash('sha256').update(input.pergunta).digest('hex');

    try {
      await AgentesExecucoesService.registrar({
        agente: 'instrutor',
        canal: input.canal ?? 'api',
        entradaHash,
        tier: result.tier,
        cacheHit: result.cacheHit,
        modelo: result.modelo,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        duracaoMs: Date.now() - started,
      });
    } catch (err) {
      console.error('[instrutor] falha ao registrar execução:', (err as Error).message);
    }

    return result;
  }
}
