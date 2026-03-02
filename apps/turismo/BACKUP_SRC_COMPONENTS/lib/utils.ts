import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes CSS de forma inteligente, resolvendo conflitos do Tailwind
 * @param inputs - Classes CSS para combinar
 * @returns String com classes CSS otimizadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
