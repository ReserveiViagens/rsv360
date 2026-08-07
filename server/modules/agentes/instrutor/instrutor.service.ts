import { createHash } from 'crypto';
import { AgentesExecucoesService } from '../execucoes.service';
import { hashEntrada } from '../exact-cache';
import { normalizePergunta, type InstrutorPapel } from './tipos';
import { runInstrutorGraph } from './graph';
import { logInstrutorEvent } from './output-filter';
import { sanitizeLlmText, LLM_MAX_MESSAGE_CHARS } from '@rsv360/shared';

export class InstrutorService {
  static async perguntar(input: {
    pergunta: string;
    papel: Exclude<InstrutorPapel, 'ambos'>;
    canal?: string;
    userId?: number;
  }) {
    const started = Date.now();
    const perguntaSafe =
      sanitizeLlmText(input.pergunta, LLM_MAX_MESSAGE_CHARS) ||
      normalizePergunta(input.pergunta);

    const result = await runInstrutorGraph(
      perguntaSafe,
      input.papel,
      input.userId ? `instrutor:u${input.userId}` : undefined,
    );

    const entradaHash =
      result.entradaHash ||
      hashEntrada(`${input.papel}|${normalizePergunta(perguntaSafe)}`) ||
      createHash('sha256').update(perguntaSafe).digest('hex');

    logInstrutorEvent('perguntar_done', {
      papel: input.papel,
      canal: input.canal ?? 'api',
      tier: result.tier,
      cacheHit: result.cacheHit,
      status: result.status,
      entradaHashPrefix: entradaHash.slice(0, 12),
      duracaoMs: Date.now() - started,
      hasUserId: Boolean(input.userId),
    });

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
