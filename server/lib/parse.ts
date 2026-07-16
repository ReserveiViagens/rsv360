/**
 * Typed helpers for Express HTTP inputs (query/params/headers).
 * Pure — no I/O. Prefer these over casts that hide string | string[] | ParsedQs.
 */

export function asString(v: unknown): string | undefined {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) {
    const first = v[0];
    return typeof first === 'string' ? first : undefined;
  }
  return undefined;
}

export function asRequiredString(v: unknown, fallback = ''): string {
  return asString(v) ?? fallback;
}

export function asStringArray(v: unknown): string[] {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) {
    return v.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

export function asNumber(v: unknown): number | undefined {
  const s = asString(v);
  if (s === undefined || s.trim() === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}
