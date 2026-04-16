import { Badge } from '@/components/ui/badge';
import type { Message } from '../types';

const toneMap: Record<Message['status'], 'default' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  queued: 'warning',
  sent: 'secondary',
  delivered: 'success',
  opened: 'default',
  failed: 'danger',
};

export function MessageStatusBadge({ status }: { status: Message['status'] }) {
  return <Badge variant={toneMap[status]}>{status}</Badge>;
}
