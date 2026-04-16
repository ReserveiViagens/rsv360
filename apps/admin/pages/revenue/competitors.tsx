import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useCompetitors } from '@/src/modules/revenue/hooks';
import { CompetitorCompare } from '@/src/modules/revenue/components/CompetitorCompare';

export default function CompetitorRatesPage() {
  const { data = [] } = useCompetitors();

  return (
    <div className="space-y-6">
      <PageHeader badge="Revenue" title="Tarifas de concorrentes" description="Cadastro e comparação rápida." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Concorrente" />
          <Select defaultValue=""><option value="">Tipo de quarto</option></Select>
          <Input placeholder="Tarifa" />
          <Button>Salvar concorrente</Button>
        </CardContent>
      </Card>
      <CompetitorCompare data={data} />
    </div>
  );
}
