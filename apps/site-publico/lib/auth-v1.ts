/** Client helpers for /api/v1/auth/* (T1.8 — site-publico). */

export const AUTH_V1 = {
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  SESSION: '/api/v1/auth/session',
  REGISTER: '/api/v1/auth/register',
  OAUTH: '/api/v1/auth/oauth',
} as const;

/** Same-origin BFF routes (browser calls these; server proxies to v1). */
export const AUTH_BFF = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  SESSION: '/api/auth/session',
  ME: '/api/auth/me',
  REGISTER: '/api/auth/register',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
} as const;

export const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface AuthV1UserPayload {
  id: string | number;
  email?: string;
  name?: string;
  full_name?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  enterpriseId?: string;
}

export interface AuthV1SessionResponse {
  authenticated: boolean;
  user?: AuthV1UserPayload;
  session?: Record<string, unknown>;
  error?: string;
}

export function parseAuthV1LoginResponse(
  json: Record<string, unknown>
): {
  user?: AuthV1UserPayload;
  access_token: string;
  refresh_token: string;
} | null {
  const payload = (json.data ?? json) as Record<string, unknown>;
  const access = payload.access_token ?? json.access_token;
  const refresh = payload.refresh_token ?? json.refresh_token;

  if (!access || !refresh) {
    return null;
  }

  return {
    user: payload.user as AuthV1UserPayload | undefined,
    access_token: String(access),
    refresh_token: String(refresh),
  };
}

export function mapSessionToLegacyUser(session: AuthV1SessionResponse): {
  id: string | number;
  email: string;
  name: string;
  role: string;
  roles: string[];
} | null {
  if (!session.authenticated || !session.user) {
    return null;
  }
  const u = session.user;
  const roles = Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : ['user'];
  return {
    id: u.id,
    email: u.email ?? '',
    name: u.name ?? u.full_name ?? '',
    role: u.role ?? roles[0] ?? 'user',
    roles,
  };
}
