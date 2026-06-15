/**
 * T1.2 — contratos canônicos de auth/session (ADR-0004 Fase 1)
 */
import type { EnterpriseId, SessionUser, TenantSession } from '../types/tenant.js';

export const AUTH_ACCESS_TOKEN_KEY = 'rsv360_access_token';
export const AUTH_REFRESH_TOKEN_KEY = 'rsv360_refresh_token';

export interface RawAuthUser {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  enterpriseId?: EnterpriseId;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthTokenPair {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface AuthLoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: RawAuthUser;
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  error?: string;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user?: SessionUser;
  session?: TenantSession;
  error?: string;
}

/** Normaliza payload legado (site-publico login) para SessionUser canônico. */
export function normalizeSessionUser(raw: RawAuthUser, token?: string): SessionUser {
  const role = raw.role ?? 'user';
  return {
    id: String(raw.id),
    email: raw.email,
    name: raw.name,
    enterpriseId: raw.enterpriseId ?? 'ent_1',
    roles: [role],
    permissions: [],
    token,
  };
}

export function toTenantSession(user: SessionUser): TenantSession {
  return {
    enterpriseId: user.enterpriseId,
    userId: user.id,
    roles: user.roles,
    permissions: user.permissions,
  };
}

export function parseAuthSessionResponse(body: AuthSessionResponse): {
  user: SessionUser | null;
  session: TenantSession | null;
} {
  if (!body.authenticated || !body.user) {
    return { user: null, session: null };
  }
  const session = body.session ?? toTenantSession(body.user);
  return { user: body.user, session };
}
