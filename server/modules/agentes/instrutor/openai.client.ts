import OpenAI from 'openai';
import {
  llmChatCompletion,
  type LlmChatGatewayDeps,
} from '@rsv360/shared';
import { AGENTES_CONFIG_PADRAO } from '../schema';

export function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!hasOpenAiKey()) {
    throw new Error('OPENAI_API_KEY ausente');
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export function __resetOpenAiClientForTests(): void {
  client = null;
}

/** Embedding 1536 — text-embedding-3-small (ou modelo da config). */
export async function embedText(
  texto: string,
  modelo = AGENTES_CONFIG_PADRAO.modeloEmbedding,
): Promise<{ embedding: number[]; tokens: number }> {
  const res = await getClient().embeddings.create({
    model: modelo,
    input: texto,
  });
  const embedding = res.data[0]?.embedding;
  if (!embedding || embedding.length !== 1536) {
    throw new Error('Embedding inválido (esperado 1536 dims)');
  }
  return { embedding, tokens: res.usage?.total_tokens ?? 0 };
}

/**
 * PR-13e-followup-c: Instrutor chat via shared llmChatCompletion.
 * Embeddings remain on the OpenAI SDK (not chat.completions).
 */
export async function chatInstrutor(
  opts: {
    system: string;
    user: string;
    modelo: string;
  },
  deps: LlmChatGatewayDeps = {},
): Promise<{ content: string; tokensIn: number; tokensOut: number }> {
  const result = await llmChatCompletion(
    {
      surface: 'instrutor',
      model: opts.modelo || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 800,
      maxOutputChars: 4_000,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
    },
    deps,
  );

  if (!result.ok) {
    throw new Error(`LLM falhou: ${result.error}`);
  }

  return {
    content: result.content,
    tokensIn: result.tokensIn ?? 0,
    tokensOut: result.tokensOut ?? 0,
  };
}
