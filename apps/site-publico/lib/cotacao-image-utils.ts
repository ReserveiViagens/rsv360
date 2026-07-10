/** Normaliza metadata.images (string com URLs separadas por espaço ou array). */
export function normalizeImageList(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.filter(Boolean).map(String);
  }
  if (typeof input === 'string' && input.trim()) {
    return input.trim().split(/\s+/).filter(Boolean);
  }
  return [];
}

export const COTACAO_FALLBACK_HOTEL =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop';

function normalizeUploadPath(url: string): string {
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/uploads/')) return trimmed;
  if (trimmed.startsWith('uploads/')) return `/${trimmed}`;
  return trimmed;
}

/**
 * Caminho público para mídia da vitrine/cotação.
 *
 * Estratégia principal: manter `/uploads/...` relativo para o browser.
 * O Next.js faz proxy via rewrite (`INTERNAL_API_URL` em runtime no servidor).
 *
 * URLs absolutas (https://) passam direto (ex.: Unsplash).
 */
export function resolvePublicMediaUrl(url: string): string {
  return normalizeUploadPath(url);
}

export function resolvePublicMediaList(urls: string[]): string[] {
  return urls.map((u) => resolvePublicMediaUrl(String(u))).filter(Boolean);
}

/**
 * URL absoluta — uso secundário (admin, OG tags, integrações externas).
 * `NEXT_PUBLIC_*` é embutida no bundle no `next build`; não confiar só em runtime.
 */
export function resolveAbsoluteMediaUrl(url: string): string {
  const normalized = normalizeUploadPath(url);
  if (!normalized || /^https?:\/\//i.test(normalized)) return normalized;
  if (!normalized.startsWith('/uploads/')) return normalized;
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3002';
  return `${base.replace(/\/$/, '')}${normalized}`;
}

export function resolveAbsoluteMediaList(urls: string[]): string[] {
  return urls.map((u) => resolveAbsoluteMediaUrl(String(u))).filter(Boolean);
}
