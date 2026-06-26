import CircuitBreaker from 'opossum';
import type { BuscaParams, FornecedorAdapter, OfertaNormalizada } from './types';
import { recordAdapterError, recordAdapterLatency } from './metrics';

export type BreakerOptions = {
  fornecedor: string;
  adapterKey: string;
  timeoutMs: number;
};

export function comBreaker(adapter: FornecedorAdapter, opts: BreakerOptions): FornecedorAdapter {
  const action = async (
    destino: string,
    params: BuscaParams,
  ): Promise<OfertaNormalizada[]> => {
    const started = process.hrtime.bigint();
    try {
      const result = await adapter.buscar(destino, params);
      const seconds = Number(process.hrtime.bigint() - started) / 1e9;
      recordAdapterLatency(opts.adapterKey, opts.fornecedor, seconds);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      recordAdapterError(
        opts.adapterKey,
        opts.fornecedor,
        message === 'timeout' ? 'timeout' : 'erro',
      );
      throw error;
    }
  };

  const breaker = new CircuitBreaker(action, {
    timeout: opts.timeoutMs,
    errorThresholdPercentage: 50,
    resetTimeout: 30_000,
    volumeThreshold: 3,
  });

  breaker.fallback(() => [] as OfertaNormalizada[]);

  breaker.on('open', () => {
    recordAdapterError(opts.adapterKey, opts.fornecedor, 'breaker_open');
  });
  breaker.on('timeout', () => {
    recordAdapterError(opts.adapterKey, opts.fornecedor, 'timeout');
  });
  breaker.on('reject', () => {
    recordAdapterError(opts.adapterKey, opts.fornecedor, 'reject');
  });

  return {
    nome: adapter.nome,
    buscar: (destino, params) => breaker.fire(destino, params) as Promise<OfertaNormalizada[]>,
  };
}
