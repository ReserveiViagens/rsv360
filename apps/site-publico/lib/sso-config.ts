import { PRIMARY_SITE_URL, isMarketingLabMode } from '@/lib/app-mode';

export const LAB_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export function isSsoDevMockEnabled(): boolean {
  return process.env.SSO_DEV_MOCK === 'true';
}

export function isMarketingLabAuthRequired(): boolean {
  if (!isMarketingLabMode()) return false;
  return process.env.MARKETING_LAB_REQUIRE_AUTH === 'true';
}

/** URL no S1 para iniciar handoff (requer endpoint no Crm-RSV-360 — ver docs Fase 4). */
export function buildS1SsoStartUrl(returnPath = '/lab'): string {
  const safeReturn = returnPath.startsWith('/') ? returnPath : '/lab';
  const params = new URLSearchParams({
    return: safeReturn,
    lab_url: LAB_SITE_URL,
  });
  return `${PRIMARY_SITE_URL}/api/auth/lab-handoff?${params.toString()}`;
}

export function buildSsoCallbackPath(code: string, returnPath = '/lab'): string {
  const safeReturn = returnPath.startsWith('/') ? returnPath : '/lab';
  const params = new URLSearchParams({
    code,
    return: safeReturn,
  });
  return `/auth/sso/callback?${params.toString()}`;
}
