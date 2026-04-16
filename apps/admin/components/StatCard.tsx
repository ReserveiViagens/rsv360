import type { ReactNode } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delta?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({ label, value, icon, delta, tone = 'default' }: StatCardProps) {
  const toneClass = tone === 'success' ? 'text-emerald-600' : tone === 'warning' ? 'text-amber-600' : tone === 'danger' ? 'text-rose-600' : 'text-slate-900';

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className={`text-3xl font-semibold tracking-tight ${toneClass}`}>{value}</div>
          {delta ? <Badge variant="outline">{delta}</Badge> : null}
        </div>
        {icon ? <div className="rounded-xl bg-slate-100 p-3 text-slate-700">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}
