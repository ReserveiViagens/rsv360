import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PricingRule } from '../types';

export function PricingRuleCard({ rule }: { rule: PricingRule }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-slate-900">{rule.name}</p>
          <Badge variant={rule.active ? 'success' : 'secondary'}>{rule.active ? 'ativa' : 'inativa'}</Badge>
        </div>
        <p className="text-sm text-slate-500">{rule.condition || 'Sem condição'}</p>
        <p className="text-xs text-slate-500">Ajuste: {rule.adjustment_value ?? 0}</p>
      </CardContent>
    </Card>
  );
}
