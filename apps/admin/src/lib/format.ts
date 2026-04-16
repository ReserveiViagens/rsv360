import { format, parseISO } from 'date-fns';

export function formatCurrency(value: number | string | null | undefined, currency = 'BRL') {
  const amount = typeof value === 'string' ? Number(value) : value ?? 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatPercent(value: number | string | null | undefined) {
  const amount = typeof value === 'string' ? Number(value) : value ?? 0;
  return `${Number.isFinite(amount) ? amount.toFixed(1) : '0.0'}%`;
}

export function formatDate(value?: string | null) {
  if (!value) return '-';
  try {
    return format(parseISO(value), 'dd/MM/yyyy');
  } catch {
    return value;
  }
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-';
  try {
    return format(parseISO(value), 'dd/MM/yyyy HH:mm');
  } catch {
    return value;
  }
}

export function safeArray<T>(value: T[] | string | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
