import type { OfertaNormalizada } from '@rsv360/shared';

export type { OfertaNormalizada };

export type BuscaParams = Record<string, unknown>;

export interface FornecedorAdapter {
  nome: string;
  buscar(destino: string, params: BuscaParams): Promise<OfertaNormalizada[]>;
}

export type FornecedorApiConfig = {
  nome: string;
  adapter: string;
  timeoutMs: number;
};
