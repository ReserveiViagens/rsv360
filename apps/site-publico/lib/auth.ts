// Utilitários de autenticação
import * as jwt from 'jsonwebtoken';
import {
  formatBrowserSessionCookie,
  formatClearedBrowserSessionCookie,
} from '@rsv360/shared';
import { AUTH_BFF, parseAuthV1LoginResponse } from '@/lib/auth-v1';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      null
    );
  }
  return null;
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    document.cookie = formatBrowserSessionCookie('auth_token', token);
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    document.cookie = formatClearedBrowserSessionCookie('auth_token');
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const token = getToken();
    if (!token) return null;

    try {
      const decoded = jwt.decode(token) as any;
      return {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name || '',
        role: decoded.role || 'customer',
      };
    } catch (error) {
      return null;
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

const ERROS_TRADUZIDOS: Record<string, string> = {
  'Too Many Requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'Unauthorized': 'E-mail ou senha inválidos.',
  'Forbidden': 'Acesso negado.',
  'Network Error': 'Erro de conexão. Verifique sua internet.',
  'Failed to fetch': 'Não foi possível conectar ao servidor.',
};

function traduzirErro(mensagem: string): string {
  return ERROS_TRADUZIDOS[mensagem] || mensagem;
}

export async function login(email: string, password: string) {
  const response = await fetch(AUTH_BFF.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  let result: Record<string, unknown> = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (response.status === 429) {
    throw new Error(String(result.error || 'Muitas tentativas. Tente novamente mais tarde.'));
  }

  if (result.success) {
    const parsed = parseAuthV1LoginResponse(result);
    const token = parsed?.access_token ?? (result.data as { token?: string })?.token;
    if (token) {
      setToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
        // PR-10c-pré-a — refresh only in HttpOnly cookie (BFF); never localStorage.
        localStorage.removeItem('refresh_token');
      }
    }
    return result.data;
  }

  const msg = String(result.error || response.statusText || 'Erro ao fazer login');
  throw new Error(traduzirErro(msg));
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  document?: string;
}) {
  const response = await fetch(AUTH_BFF.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.password,
    }),
  });

  let result: any = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (response.status === 429) {
    throw new Error(result.error || 'Muitas tentativas. Tente novamente mais tarde.');
  }

  if (result.success) {
    const token = result.data?.token ?? result.data?.access_token;
    if (token) setToken(token);
    return result.data;
  }

  const msg = result.error || response.statusText || 'Erro ao fazer cadastro';
  throw new Error(traduzirErro(msg));
}

export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch(AUTH_BFF.FORGOT_PASSWORD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  let result: Record<string, unknown> = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (response.status === 429) {
    throw new Error(String(result.error || 'Muitas tentativas. Tente novamente mais tarde.'));
  }

  if (result.success === true) {
    return;
  }

  throw new Error(traduzirErro(String(result.error || 'Erro ao solicitar recuperação')));
}

export async function resetPassword(payload: {
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  const response = await fetch(AUTH_BFF.RESET_PASSWORD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let result: Record<string, unknown> = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (response.status === 429) {
    throw new Error(String(result.error || 'Muitas tentativas. Tente novamente mais tarde.'));
  }

  if (result.success === true) {
    return;
  }

  throw new Error(traduzirErro(String(result.error || 'Erro ao redefinir senha')));
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    const access =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token');
    if (access) {
      void fetch(AUTH_BFF.LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
        credentials: 'include',
        body: JSON.stringify({}),
      }).catch(() => undefined);
    }
  }
  removeToken();
  if (typeof window !== 'undefined') {
    void fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => undefined);
    localStorage.removeItem('admin_token');
    document.cookie = formatClearedBrowserSessionCookie('admin_token');
    window.location.href = '/';
  }
}
