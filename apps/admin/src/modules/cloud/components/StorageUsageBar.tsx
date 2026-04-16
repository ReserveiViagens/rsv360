import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UsageStats } from '../types';
import { formatPercent, formatCurrency } from '@/src/lib/format';

export function StorageUsageBar({ usage }: { usage?: UsageStats }) {
  const percent = usage?.percent || 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Uso do armazenamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percent} />
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{formatPercent(percent)}</span>
          <span>{formatCurrency(usage?.usedBytes || 0, 'BRL')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
