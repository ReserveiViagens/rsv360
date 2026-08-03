/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import {
  formatBrowserSessionCookie,
  formatClearedBrowserSessionCookie,
} from '@rsv360/shared';

export const PORTAL_TOKEN_COOKIE = 'rsv360_guest_portal_token';
export const PORTAL_GUEST_COOKIE = 'rsv360_guest_portal_guest';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getPortalCookieToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${PORTAL_TOKEN_COOKIE}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

export function getPortalToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const fromLocalStorage = window.localStorage.getItem(PORTAL_TOKEN_COOKIE);
  if (fromLocalStorage) {
    return fromLocalStorage;
  }

  return getPortalCookieToken();
}

/** Cookie e localStorage devem existir e coincidir (evita loop SSR/client). */
export function hasValidPortalSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const fromLocalStorage = window.localStorage.getItem(PORTAL_TOKEN_COOKIE);
  const fromCookie = getPortalCookieToken();
  return Boolean(fromLocalStorage && fromCookie && fromLocalStorage === fromCookie);
}

export function getPortalGuest<T = Record<string, unknown>>() {
  if (typeof window === 'undefined') {
    return null;
  }

  return safeJsonParse<T>(window.localStorage.getItem(PORTAL_GUEST_COOKIE));
}

export function setPortalSession(token: string, guest?: Record<string, unknown> | null) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PORTAL_TOKEN_COOKIE, token);
  document.cookie = formatBrowserSessionCookie(PORTAL_TOKEN_COOKIE, token);

  if (guest) {
    window.localStorage.setItem(PORTAL_GUEST_COOKIE, JSON.stringify(guest));
  }
}

export function clearPortalSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PORTAL_TOKEN_COOKIE);
  window.localStorage.removeItem(PORTAL_GUEST_COOKIE);
  document.cookie = formatClearedBrowserSessionCookie(PORTAL_TOKEN_COOKIE);
}

export function buildClearedPortalTokenCookie() {
  return formatClearedBrowserSessionCookie(PORTAL_TOKEN_COOKIE);
}
