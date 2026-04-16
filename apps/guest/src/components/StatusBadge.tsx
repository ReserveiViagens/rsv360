/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import { Badge } from './ui/badge';

const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'danger',
  checked_in: 'default',
  checked_out: 'secondary',
  draft: 'secondary',
  sent: 'success',
  delivered: 'success',
  failed: 'danger',
};

const labels: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendente',
  cancelled: 'Cancelada',
  checked_in: 'Check-in',
  checked_out: 'Check-out',
  draft: 'Rascunho',
  sent: 'Enviada',
  delivered: 'Entregue',
  failed: 'Falhou',
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) {
    return <Badge variant="outline">Sem status</Badge>;
  }

  return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
}
