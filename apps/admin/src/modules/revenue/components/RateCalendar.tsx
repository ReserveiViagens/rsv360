import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RateCalendarEntry } from '../types';
import { formatDate, formatCurrency } from '@/src/lib/format';

export function RateCalendar({ entries }: { entries: RateCalendarEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Calendário de tarifas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {entries.map((entry) => (
          <div key={entry.id ?? entry.date} className="rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-900">{formatDate(entry.date)}</p>
            <p className="text-xs text-slate-500">{entry.room_type || 'geral'}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(entry.rate)}</p>
            <p className="text-xs text-slate-500">Ocupação: {entry.occupancy ?? 0}%</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
