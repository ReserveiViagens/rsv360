import { PageHeader } from '@/components/PageHeader';
import { KPICards } from '@/src/modules/revenue/components/KPICards';
import { ForecastChart } from '@/src/modules/revenue/components/ForecastChart';
import { RateCalendar } from '@/src/modules/revenue/components/RateCalendar';
import { useForecast, useRateCalendar, useRevenueKPIs } from '@/src/modules/revenue/hooks';

export default function RevenueDashboardPage() {
  const { data: kpis } = useRevenueKPIs();
  const { data: forecast = [] } = useForecast();
  const { data: calendar = [] } = useRateCalendar();

  return (
    <div className="space-y-6">
      <PageHeader badge="Revenue" title="Revenue Dashboard" description="KPIs, forecast e calendário resumido." />
      <KPICards kpis={kpis} />
      <div className="grid gap-6 xl:grid-cols-2">
        <ForecastChart data={forecast} />
        <RateCalendar entries={calendar.slice(0, 8)} />
      </div>
    </div>
  );
}
