import { decryptApiKey } from './crypto';
import { comBreaker } from './breaker';
import { getAdapterFactory } from './registry';
import type { BuscaParams, OfertaNormalizada } from './types';
import { fornecedoresApiService } from './services/fornecedores-api.service';

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

function instantiateAdapter(row: FornecedorHubRow) {
  const factory = getAdapterFactory(row.adapter);
  if (!factory) return null;

  const inner = factory({
    nome: row.nome,
    endpoint: row.endpoint,
    apiKey: row.apiKey,
  });

  return comBreaker(inner, {
    fornecedor: row.nome,
    adapterKey: row.adapter,
    timeoutMs: row.timeoutMs ?? 3000,
  });
}

/** Núcleo testável: consulta adapters em paralelo sem travar por um fornecedor lento. */
export async function buscarComFornecedores(
  destino: string,
  params: BuscaParams,
  rows: FornecedorHubRow[],
): Promise<OfertaNormalizada[]> {
  const resultados = await Promise.allSettled(
    rows.map(async (row) => {
      const adapter = instantiateAdapter(row);
      if (!adapter) return [] as OfertaNormalizada[];
      return adapter.buscar(destino, params);
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
  const ativos = await fornecedoresApiService.listAtivosForHub();

  const rows: FornecedorHubRow[] = ativos.map((row) => ({
    nome: row.nome,
    adapter: row.adapter,
    endpoint: row.endpoint,
    apiKey: decryptApiKey(row.apiKey),
    timeoutMs: row.timeoutMs ?? 3000,
  }));

  return buscarComFornecedores(destino, params, rows);
}
