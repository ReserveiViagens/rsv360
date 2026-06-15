/**
 * T1.3 — tenant routing canônico (ADR-0004 Fase 1)
 */
import type { EnterpriseId } from '../types/tenant.js';
import { resolveEnterpriseId } from '../types/tenant.js';

export const TENANT_PATH_PREFIX = '/e';
export const TENANT_QUERY_PARAM = 'enterpriseId';
export const TENANT_HEADER = 'X-Enterprise-Id';
export const TENANT_STORAGE_KEY = 'rsv360_enterprise_id';

/** Extrai enterpriseId de path `/e/:enterpriseId/...` */
export function parseTenantFromPath(pathname: string): EnterpriseId | null {
  const normalized = pathname.split('?')[0] ?? pathname;
  const match = normalized.match(new RegExp(`^${TENANT_PATH_PREFIX}/([^/]+)`));
  return match?.[1]?.trim() || null;
}

/** Monta path com prefixo tenant. */
export function buildTenantPath(enterpriseId: EnterpriseId, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const prefix = `${TENANT_PATH_PREFIX}/${enterpriseId}`;
  if (clean === '/' || clean === '') return prefix;
  if (clean.startsWith(prefix)) return clean;
  return `${prefix}${clean}`;
}

/** Injeta ou substitui query `enterpriseId`. */
export function withTenantQuery(
  href: string,
  enterpriseId: EnterpriseId
): string {
  const [path, search = ''] = href.split('?');
  const params = new URLSearchParams(search);
  params.set(TENANT_QUERY_PARAM, enterpriseId);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Resolve tenant ativo: path > query > header > sessão > storage > fallback. */
export function resolveTenantRoute(input: {
  pathname?: string;
  query?: string | string[] | null;
  header?: string | null;
  sessionEnterpriseId?: EnterpriseId | null;
  storageEnterpriseId?: EnterpriseId | null;
  fallback?: EnterpriseId;
}): EnterpriseId {
  const fromPath = input.pathname ? parseTenantFromPath(input.pathname) : null;
  if (fromPath) return fromPath;

  return resolveEnterpriseId({
    query: input.query,
    header: input.header,
    fallback:
      input.sessionEnterpriseId ??
      input.storageEnterpriseId ??
      input.fallback ??
      'ent_1',
  });
}
