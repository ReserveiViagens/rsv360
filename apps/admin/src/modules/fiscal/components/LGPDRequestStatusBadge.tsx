import { Badge } from '@/components/ui/badge';
import type { LGPDRequest } from '../types';

const tone: Record<LGPDRequest['status'], 'secondary' | 'default' | 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  in_progress: 'default',
  completed: 'success',
  rejected: 'secondary',
  overdue: 'danger',
};

export function LGPDRequestStatusBadge({ status }: { status: LGPDRequest['status'] }) {
  return <Badge variant={tone[status]}>{status}</Badge>;
}
