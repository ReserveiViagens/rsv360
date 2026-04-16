import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { usePricingRules } from '@/src/modules/revenue/hooks';
import { PricingRuleCard } from '@/src/modules/revenue/components/PricingRuleCard';

export default function PricingRulesPage() {
  const { data = [] } = usePricingRules();

  return (
    <div className="space-y-6">
      <PageHeader badge="Revenue" title="Pricing rules" description="Regras, prioridade e reorder." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Nome da regra" />
          <Select defaultValue=""><option value="">Condição</option></Select>
          <Select defaultValue=""><option value="">Tipo</option></Select>
          <Button>Salvar regra</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((rule) => <PricingRuleCard key={rule.id} rule={rule} />)}
      </div>
    </div>
  );
}
