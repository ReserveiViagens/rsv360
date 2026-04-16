import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { RoomItem } from '../types';

const colorMap: Record<RoomItem['status'], string> = {
  clean: 'border-emerald-200 bg-emerald-50',
  dirty: 'border-rose-200 bg-rose-50',
  cleaning: 'border-amber-200 bg-amber-50',
  maintenance: 'border-slate-200 bg-slate-100',
};

export function RoomStatusCard({ room }: { room: RoomItem }) {
  return (
    <Card className={colorMap[room.status]}>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-slate-900">Quarto {room.number}</p>
          <Badge variant="outline">{room.status}</Badge>
        </div>
        <p className="text-sm text-slate-600">{room.type || 'Quarto padrão'}</p>
        <p className="text-xs text-slate-500">{room.guest_name || 'Sem hóspede atual'}</p>
      </CardContent>
    </Card>
  );
}
