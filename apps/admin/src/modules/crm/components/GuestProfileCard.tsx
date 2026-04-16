import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GuestProfile } from '../types';
import { formatCurrency } from '@/src/lib/format';

export function GuestProfileCard({ guest }: { guest: GuestProfile }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-slate-900">{guest.first_name} {guest.last_name}</p>
            <p className="text-sm text-slate-500">{guest.email || guest.phone || '-'}</p>
          </div>
          <Badge variant={guest.is_vip ? 'success' : 'secondary'}>{guest.lifecycle_stage}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">{guest.total_stays || 0} estadias</Badge>
          <Badge variant="outline">{formatCurrency(guest.total_revenue || 0)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
