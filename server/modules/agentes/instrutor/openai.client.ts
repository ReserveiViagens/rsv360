import OpenAI from 'openai';
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

export async function chatInstrutor(opts: {
  system: string;
  user: string;
  modelo: string;
}): Promise<{ content: string; tokensIn: number; tokensOut: number }> {
  const res = await getClient().chat.completions.create({
    model: opts.modelo,
    temperature: 0.2,
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.user },
    ],
  });
  const content = res.choices[0]?.message?.content?.trim() || '';
  return {
    content,
    tokensIn: res.usage?.prompt_tokens ?? 0,
    tokensOut: res.usage?.completion_tokens ?? 0,
  };
}
