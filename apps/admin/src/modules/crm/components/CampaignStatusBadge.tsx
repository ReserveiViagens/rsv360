import { Badge } from '@/components/ui/badge';
import type { Campaign } from '../types';

const tone: Record<Campaign['status'], 'secondary' | 'default' | 'warning' | 'success' | 'danger'> = {
  draft: 'secondary',
  scheduled: 'warning',
  sending: 'default',
  sent: 'success',
  paused: 'secondary',
  cancelled: 'danger',
};

export function CampaignStatusBadge({ status }: { status: Campaign['status'] }) {
  return <Badge variant={tone[status]}>{status}</Badge>;
}
