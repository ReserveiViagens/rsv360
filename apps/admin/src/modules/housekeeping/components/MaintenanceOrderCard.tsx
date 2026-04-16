import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MaintenanceItem } from '../types';

export function MaintenanceOrderCard({ order }: { order: MaintenanceItem }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-slate-900">{order.title}</p>
            <p className="text-xs text-slate-500">Quarto {order.room_id || '-'}</p>
          </div>
          <Badge variant="outline">{order.status}</Badge>
        </div>
        <Badge variant="secondary">{order.priority || 'medium'}</Badge>
      </CardContent>
    </Card>
  );
}
