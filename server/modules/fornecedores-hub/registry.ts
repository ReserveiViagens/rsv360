import type { FornecedorAdapter } from './types';

export type AdapterFactory = (cfg: {
  nome: string;
  endpoint: string;
  apiKey: string;
}) => FornecedorAdapter;

const factories = new Map<string, AdapterFactory>();

export function registrarAdapterFactory(chave: string, factory: AdapterFactory): void {
  factories.set(chave, factory);
}

export function getAdapterFactory(chave: string): AdapterFactory | undefined {
  return factories.get(chave);
}

export function limparRegistry(): void {
  factories.clear();
}

export function listarAdaptersRegistrados(): string[] {
  return [...factories.keys()];
}
