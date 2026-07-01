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
