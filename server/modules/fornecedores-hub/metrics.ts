import { Counter, Gauge, Histogram } from 'prom-client';

const { metricsRegistry } = require('../../../backend/src/monitoring/prometheus');

export type AdapterErrorKind = 'timeout' | 'reject' | 'breaker_open' | 'erro';

export const fornecedorAdapterLatency = new Histogram({
  name: 'rsv360_fornecedor_adapter_duration_seconds',
  help: 'Latência de busca por adapter de fornecedor (Hub Cotação v2)',
  labelNames: ['adapter', 'fornecedor'] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5],
  registers: [metricsRegistry],
});

export const fornecedorAdapterErrors = new Counter({
  name: 'rsv360_fornecedor_adapter_errors_total',
  help: 'Erros por adapter de fornecedor (timeout, reject, breaker_open, erro)',
  labelNames: ['adapter', 'fornecedor', 'tipo'] as const,
  registers: [metricsRegistry],
});

export const propostasPorStatus = new Gauge({
  name: 'rsv360_propostas_por_status',
  help: 'Contagem de propostas por status de aprovação',
  labelNames: ['status'] as const,
  registers: [metricsRegistry],
});

export function recordAdapterLatency(adapter: string, fornecedor: string, seconds: number): void {
  fornecedorAdapterLatency.observe({ adapter, fornecedor }, seconds);
}

export function recordAdapterError(
  adapter: string,
  fornecedor: string,
  tipo: AdapterErrorKind,
): void {
  fornecedorAdapterErrors.inc({ adapter, fornecedor, tipo });
}

/** Atualiza gauge de propostas (chamado por módulo propostas quando disponível). */
export function setPropostasPorStatus(counts: Record<string, number>): void {
  for (const [status, value] of Object.entries(counts)) {
    propostasPorStatus.set({ status }, value);
  }
}

export function registerFornecedoresHubMetrics(): void {
  // Métricas registradas no metricsRegistry compartilhado (/metrics).
}
