/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-px w-full bg-slate-200', className)} {...props} />;
}
