import { Counter } from 'prom-client';

const { metricsRegistry } = require('../../../backend/src/monitoring/prometheus');

export const propostasGeradasTotal = new Counter({
  name: 'rsv360_propostas_geradas_total',
  help: 'Total de propostas geradas ou publicadas',
  labelNames: ['origem'] as const,
  registers: [metricsRegistry],
});

export const roteiroViewsTotal = new Counter({
  name: 'rsv360_roteiro_views_total',
  help: 'Visualizações do roteiro premium cinematográfico',
  registers: [metricsRegistry],
});

export const propostasExpiradasTotal = new Counter({
  name: 'rsv360_propostas_expiradas_total',
  help: 'Propostas marcadas como expiradas',
  labelNames: ['trigger'] as const,
  registers: [metricsRegistry],
});

export const propostasAceitasTotal = new Counter({
  name: 'rsv360_propostas_aceitas_total',
  help: 'Conversões — proposta aceita ou paga',
  labelNames: ['canal'] as const,
  registers: [metricsRegistry],
});

export const avisosRecuperacaoTotal = new Counter({
  name: 'rsv360_avisos_recuperacao_total',
  help: 'Avisos proativos de expiração (PR16)',
  labelNames: ['result', 'channel'] as const,
  registers: [metricsRegistry],
});

export const propostasJobsFailedTotal = new Counter({
  name: 'rsv360_propostas_jobs_failed_total',
  help: 'Jobs BullMQ do módulo propostas que falharam',
  labelNames: ['job'] as const,
  registers: [metricsRegistry],
});

export function recordPropostaGerada(
  origem: 'wizard' | 'staff' | 'from_orcamento' | 'recotacao',
): void {
  propostasGeradasTotal.inc({ origem });
}

export function recordRoteiroView(): void {
  roteiroViewsTotal.inc();
}

export function recordPropostaExpirada(trigger: 'worker' | 'sync'): void {
  propostasExpiradasTotal.inc({ trigger });
}

export function recordPropostaAceita(canal: 'public' | 'staff'): void {
  propostasAceitasTotal.inc({ canal });
}

export function recordAvisoRecuperacao(
  result: 'sent' | 'demo' | 'failed',
  channel: 'whatsapp' | 'email' | 'demo' | 'unknown',
): void {
  avisosRecuperacaoTotal.inc({ result, channel });
}

export function recordPropostaJobFailed(job: string): void {
  propostasJobsFailedTotal.inc({ job });
}

/** Log estruturado para agregadores (Loki/Datadog) e alertas por string. */
export function logPropostaAlert(
  event: string,
  data: Record<string, unknown>,
  message: string,
): void {
  console.error(
    JSON.stringify({
      level: 'error',
      context: 'propostas',
      event,
      ts: new Date().toISOString(),
      ...data,
      message,
    }),
  );
}

export function registerPropostasMetrics(): void {
  // Counters registrados via `registers: [metricsRegistry]` — expostos em GET /metrics.
}

module.exports = {
  registerPropostasMetrics,
  recordPropostaGerada,
  recordRoteiroView,
  recordPropostaExpirada,
  recordPropostaAceita,
  recordAvisoRecuperacao,
  recordPropostaJobFailed,
  logPropostaAlert,
};
