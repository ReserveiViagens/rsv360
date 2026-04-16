import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForecast } from '@/src/modules/revenue/hooks';
import { ForecastChart } from '@/src/modules/revenue/components/ForecastChart';

export default function ForecastPage() {
  const { data = [] } = useForecast();

  return (
    <div className="space-y-6">
      <PageHeader badge="Revenue" title="Forecast" description="Previsão e backtesting." />
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm text-slate-600">Gerar previsão com base em ocupação, sazonalidade e eventos.</p>
          <Button>Gerar forecast</Button>
        </CardContent>
      </Card>
      <ForecastChart data={data} />
    </div>
  );
}
