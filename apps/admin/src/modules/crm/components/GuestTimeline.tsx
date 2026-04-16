import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/src/lib/format';
import type { GuestTimelineItem } from '../types';

export function GuestTimeline({ items }: { items: GuestTimelineItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline do hóspede</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={`${item.type}-${item.date}`} className="relative border-l border-slate-200 pl-4">
            <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
            <p className="text-sm font-medium text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-500">{formatDateTime(item.date)}</p>
            {item.details ? <p className="mt-1 text-sm text-slate-600">{item.details}</p> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
