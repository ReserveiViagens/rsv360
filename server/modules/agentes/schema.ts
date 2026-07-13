export type AgentesConfig = {
  agentesModuloAtivo: boolean;
  limiarSemanticoHit: number;
  limiarSemanticoVerificar: number;
  ttlCacheInstitucionalDias: number;
  ttlCacheCatalogoHoras: number;
};

/** Defaults — módulo OFF (fail-safe). */
export const AGENTES_CONFIG_PADRAO: AgentesConfig = {
  agentesModuloAtivo: false,
  limiarSemanticoHit: 0.92,
  limiarSemanticoVerificar: 0.85,
  ttlCacheInstitucionalDias: 7,
  ttlCacheCatalogoHoras: 24,
};

export const CHAVE_AGENTES = 'agentes';

export function parseAgentesModuloAtivo(valores: Record<string, unknown>): boolean {
  return valores.agentes_modulo_ativo === true || valores.agentesModuloAtivo === true;
}

export function configFromValores(valores: Record<string, unknown>): AgentesConfig {
  const num = (a: unknown, b: unknown, fallback: number) => {
    const raw = a ?? b;
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string' && raw.trim() !== '') {
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
    return fallback;
  };

  return {
    agentesModuloAtivo: parseAgentesModuloAtivo(valores),
    limiarSemanticoHit: num(valores.limiar_semantico_hit, valores.limiarSemanticoHit, 0.92),
    limiarSemanticoVerificar: num(
      valores.limiar_semantico_verificar,
      valores.limiarSemanticoVerificar,
      0.85,
    ),
    ttlCacheInstitucionalDias: num(
      valores.ttl_cache_institucional_dias,
      valores.ttlCacheInstitucionalDias,
      7,
    ),
    ttlCacheCatalogoHoras: num(
      valores.ttl_cache_catalogo_horas,
      valores.ttlCacheCatalogoHoras,
      24,
    ),
  };
}
