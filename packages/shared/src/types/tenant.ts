/**
 * T1.x — contratos canônicos de tenant/auth (ADR-0004 Fase 1)
 */

/** Identificador canônico de enterprise (backend payments usa UUID string; legado CRM usa number). */
export type EnterpriseId = string;

export interface TenantSession {
  enterpriseId: EnterpriseId;
  userId: string;
  roles: string[];
  permissions: string[];
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  enterpriseId: EnterpriseId;
  roles: string[];
  permissions: string[];
  token?: string;
}

export interface TenantContextValue {
  enterpriseId: EnterpriseId;
  session: TenantSession | null;
  setEnterpriseId: (id: EnterpriseId) => void;
}

/** Resolve enterpriseId de query, header ou fallback dev. */
export function resolveEnterpriseId(input: {
  query?: string | string[] | null;
  header?: string | null;
  fallback?: EnterpriseId;
}): EnterpriseId {
  const fromQuery = Array.isArray(input.query) ? input.query[0] : input.query;
  const fromHeader = input.header?.trim();
  return (fromQuery || fromHeader || input.fallback || 'ent_1').trim();
}
