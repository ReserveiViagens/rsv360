import type { AgenteCarimboContexto } from '../../../../backend/src/db/schema/agentes-cache-semantico';
import { AgentesConfigService } from '../config.service';
import { getExactCache, hashEntrada, setExactCache } from '../exact-cache';
import { SemanticCacheService } from '../semantic-cache.service';
import { chatInstrutor, embedText, hasOpenAiKey } from './openai.client';
import { buscarChunksRag } from './rag.service';
import {
  filterInstrutorOutput,
  logInstrutorEvent,
} from './output-filter';
import {
  AGENTE_INSTRUTOR,
  VERSAO_BASE_PADRAO,
  normalizePergunta,
  type InstrutorPapel,
  type InstrutorResposta,
} from './tipos';
import { sanitizeLlmText, LLM_MAX_MESSAGE_CHARS } from '@rsv360/shared';

const PEDIDO_VALOR =
  /\b(quanto custa|preço|preco|valor da diária|valor da diaria|\%\s*de\s*comiss|comiss[aã]o de\s*\d|r\$\s*\d)/i;

export function solicitaValorConcreto(pergunta: string): boolean {
  return PEDIDO_VALOR.test(pergunta);
}

function carimboInstrutor(papel: string, versaoBase: string): AgenteCarimboContexto {
  return {
    agente: AGENTE_INSTRUTOR,
    entidade: 'turismo',
    idioma: 'pt-BR',
    perfil: papel,
    versao_base: versaoBase,
    tipo: 'instrutor',
  };
}

function buildSystemPrompt(chunks: { conteudo: string; rotas: string[]; docSlug: string }[]): string {
  const ctx = chunks
    .map((c, i) => `### Chunk ${i + 1} (${c.docSlug})\n${c.conteudo}`)
    .join('\n\n');
  return `Você é o Agente Instrutor do RSV360 (Turismo).
Regras OBRIGATÓRIAS:
1. Responda SOMENTE com base nos chunks abaixo. Se faltar contexto, diga que não sabe e oriente a falar com um humano da equipe.
2. NUNCA invente valores, preços, percentuais de comissão, prazos de repasse ou números financeiros. Se perguntarem isso: diga para confirmar com a equipe / no sistema.
3. Se o chunk indicar 🚧 ou "em construção", avise claramente que a funcionalidade está em construção.
4. TODA resposta DEVE terminar com uma linha exatamente no formato: Onde clicar: <rota>
   Use uma rota real citada nos chunks.
5. Linguagem simples, para usuário leigo. Sem jargão de código.

CONTEXTOS:
${ctx || '(nenhum chunk — diga que não sabe)'}`;
}

function defaultRota(papel: Exclude<InstrutorPapel, 'ambos'>): string {
  return papel === 'anfitriao' ? '/anfitriao' : '/modulos';
}

function applyOutputFilter(
  texto: string,
  papel: Exclude<InstrutorPapel, 'ambos'>,
  rotaHint?: string,
): { resposta: string; filtered: boolean } {
  const filtered = filterInstrutorOutput(
    texto,
    rotaHint || defaultRota(papel),
  );
  return { resposta: filtered.text, filtered: filtered.filtered };
}

export type T1Result = InstrutorResposta & {
  tokensIn?: number;
  tokensOut?: number;
  modelo?: string | null;
  entradaHash: string;
  outputFiltered?: boolean;
};

/**
 * T1: cache exato → semântico → RAG + LLM.
 * Fail-safe sem OPENAI_API_KEY → 503 (nunca lança).
 * PR-13d: output filter + logging sem PII.
 */
export async function executarT1(
  pergunta: string,
  papel: Exclude<InstrutorPapel, 'ambos'>,
): Promise<T1Result> {
  const cfg = await AgentesConfigService.obterConfig();
  const perguntaSafe = sanitizeLlmText(pergunta, LLM_MAX_MESSAGE_CHARS) || normalizePergunta(pergunta);
  const perguntaNorm = normalizePergunta(perguntaSafe);
  const entradaHash = hashEntrada(`${papel}|${perguntaNorm}`);
  const versaoBase = VERSAO_BASE_PADRAO;
  const carimbo = carimboInstrutor(papel, versaoBase);
  const ttlExact = Math.max(60, cfg.ttlCacheInstitucionalDias * 86400);

  const exact = await getExactCache(AGENTE_INSTRUTOR, entradaHash);
  if (exact) {
    const { resposta, filtered } = applyOutputFilter(exact, papel);
    if (filtered) {
      await setExactCache(AGENTE_INSTRUTOR, entradaHash, resposta, ttlExact);
      logInstrutorEvent('output_filtered', {
        source: 'exact_cache',
        papel,
        entradaHashPrefix: entradaHash.slice(0, 12),
      });
    }
    return {
      resposta,
      tier: 't1',
      cacheHit: 'exact',
      status: 200,
      entradaHash,
      modelo: null,
      outputFiltered: filtered,
    };
  }

  if (!hasOpenAiKey()) {
    return {
      resposta: 'Instrutor temporariamente indisponível',
      tier: 't1',
      cacheHit: 'none',
      status: 503,
      entradaHash,
      modelo: null,
    };
  }

  try {
    const { embedding, tokens: embTokens } = await embedText(perguntaSafe, cfg.modeloEmbedding);

    const semantic = await SemanticCacheService.buscar(embedding, carimbo, { tipo: 'instrutor' });
    if (semantic?.tier === 'hit') {
      const { resposta, filtered } = applyOutputFilter(semantic.resposta, papel);
      await setExactCache(AGENTE_INSTRUTOR, entradaHash, resposta, ttlExact);
      if (filtered) {
        logInstrutorEvent('output_filtered', {
          source: 'semantic_cache',
          papel,
          entradaHashPrefix: entradaHash.slice(0, 12),
        });
      }
      return {
        resposta,
        tier: 't1',
        cacheHit: 'semantic',
        status: 200,
        entradaHash,
        tokensIn: embTokens,
        modelo: cfg.modeloEmbedding,
        outputFiltered: filtered,
      };
    }

    if (solicitaValorConcreto(perguntaSafe)) {
      const rota = papel === 'anfitriao' ? '/anfitriao/comissoes' : '/financeiro';
      const { resposta } = applyOutputFilter(
        'Não informo valores, preços nem percentuais de comissão. Confirme no sistema ou com a equipe financeira responsável.',
        papel,
        rota,
      );
      await setExactCache(AGENTE_INSTRUTOR, entradaHash, resposta, ttlExact);
      logInstrutorEvent('blocked_value_request', {
        papel,
        entradaHashPrefix: entradaHash.slice(0, 12),
      });
      return {
        resposta,
        tier: 't1',
        cacheHit: 'none',
        status: 200,
        entradaHash,
        tokensIn: embTokens,
        modelo: cfg.modeloEmbedding,
        outputFiltered: true,
      };
    }

    const chunks = await buscarChunksRag(embedding, papel, cfg.ragTopK);
    const fallbackRota =
      chunks[0]?.rotas?.[0] || defaultRota(papel);

    const { content, tokensIn, tokensOut } = await chatInstrutor({
      system: buildSystemPrompt(chunks),
      user: perguntaSafe,
      modelo: cfg.modeloT1,
    });

    const { resposta, filtered } = applyOutputFilter(
      content ||
        'Não encontrei informação suficiente nos guias. Fale com a equipe de suporte.',
      papel,
      fallbackRota,
    );

    if (filtered) {
      logInstrutorEvent('output_filtered', {
        source: 'llm',
        papel,
        entradaHashPrefix: entradaHash.slice(0, 12),
      });
    }

    await setExactCache(AGENTE_INSTRUTOR, entradaHash, resposta, ttlExact);
    const expira = new Date();
    expira.setDate(expira.getDate() + cfg.ttlCacheInstitucionalDias);
    await SemanticCacheService.gravar({
      agente: AGENTE_INSTRUTOR,
      carimbo,
      perguntaNormalizada: perguntaNorm,
      embedding,
      resposta,
      versaoBase,
      expiraEm: expira,
      tipo: 'instrutor',
    });

    return {
      resposta,
      tier: 't1',
      cacheHit: 'none',
      status: 200,
      entradaHash,
      tokensIn: embTokens + tokensIn,
      tokensOut,
      modelo: cfg.modeloT1,
      outputFiltered: filtered,
    };
  } catch (err) {
    logInstrutorEvent('t1_failsafe', {
      papel,
      entradaHashPrefix: entradaHash.slice(0, 12),
      errName: (err as Error).name || 'Error',
    });
    console.error('[instrutor] T1 falhou (fail-safe 503):', (err as Error).message);
    return {
      resposta: 'Instrutor temporariamente indisponível',
      tier: 't1',
      cacheHit: 'none',
      status: 503,
      entradaHash,
      modelo: null,
    };
  }
}
