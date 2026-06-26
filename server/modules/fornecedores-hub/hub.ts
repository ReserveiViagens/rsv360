import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { fornecedoresApi } from '../../../backend/src/db/schema/fornecedores-api';
import { getAdapterFactory } from './registry';
import type { BuscaParams, OfertaNormalizada } from './types';

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), ms);
    }),
  ]);
}

export type FornecedorHubRow = {
  nome: string;
  adapter: string;
  endpoint: string;
  apiKey: string;
  timeoutMs: number;
};

/** Núcleo testável: consulta adapters em paralelo sem travar por um fornecedor lento. */
export async function buscarComFornecedores(
  destino: string,
  params: BuscaParams,
  rows: FornecedorHubRow[],
): Promise<OfertaNormalizada[]> {
  const resultados = await Promise.allSettled(
    rows.map(async (row) => {
      const factory = getAdapterFactory(row.adapter);
      if (!factory) return [] as OfertaNormalizada[];
      const adapter = factory({
        nome: row.nome,
        endpoint: row.endpoint,
        apiKey: row.apiKey,
      });
      return withTimeout(adapter.buscar(destino, params), row.timeoutMs ?? 3000);
    }),
  );

  return resultados
    .filter((r): r is PromiseFulfilledResult<OfertaNormalizada[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}

export async function buscarPrecosConcorrencia(
  destino: string,
  params: BuscaParams = {},
): Promise<OfertaNormalizada[]> {
  const ativos = await db
    .select({
      nome: fornecedoresApi.nome,
      adapter: fornecedoresApi.adapter,
      endpoint: fornecedoresApi.endpoint,
      apiKey: fornecedoresApi.apiKey,
      timeoutMs: fornecedoresApi.timeoutMs,
    })
    .from(fornecedoresApi)
    .where(eq(fornecedoresApi.ativo, true));

  const rows: FornecedorHubRow[] = ativos.map((row) => ({
    nome: row.nome,
    adapter: row.adapter,
    endpoint: row.endpoint,
    apiKey: row.apiKey,
    timeoutMs: row.timeoutMs ?? 3000,
  }));

  return buscarComFornecedores(destino, params, rows);
}
