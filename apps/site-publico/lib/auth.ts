// Utilitários de autenticação
import * as jwt from 'jsonwebtoken';

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
    document.cookie = `auth_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; Path=/; Max-Age=0; SameSite=Lax';
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
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

  const msg = result.error || response.statusText || 'Erro ao fazer login';
  throw new Error(traduzirErro(msg));
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  document?: string;
}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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

export function logout(): void {
  removeToken();
  if (typeof window !== 'undefined') {
    void fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => undefined);
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; Path=/; Max-Age=0; SameSite=Lax';
    window.location.href = '/';
  }
}
