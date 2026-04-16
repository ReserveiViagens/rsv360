import { Badge } from '@/components/ui/badge';
import type { FiscalInvoice } from '../types';

const tone: Record<FiscalInvoice['status'], 'secondary' | 'default' | 'warning' | 'success' | 'danger'> = {
  draft: 'secondary',
  issued: 'default',
  sent: 'warning',
  cancelled: 'danger',
  error: 'danger',
};

export function InvoiceStatusBadge({ status }: { status: FiscalInvoice['status'] }) {
  return <Badge variant={tone[status]}>{status}</Badge>;
}
