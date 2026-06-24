'use client';

import dynamic from 'next/dynamic';
import { PricingModuleShell } from '../PricingModuleShell';

const PricingCalendar = dynamic(() => import('../PricingCalendar'), { ssr: false });

export function PricingCalendarModule() {
  return (
    <PricingModuleShell
      title="Calendário de preços"
      description="Grade mensal com demanda por cor e override manual de tarifa."
    >
      {({ itemId }) => (
        <PricingCalendar
          propertyId={itemId}
          dateRange={{
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          }}
          onPriceChange={async (date, newPrice) => {
            const res = await fetch(`/api/pricing/calendar/${itemId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date: date.toISOString().slice(0, 10), price: newPrice }),
            });
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              throw new Error(j.error || 'Erro ao salvar preço');
            }
          }}
        />
      )}
    </PricingModuleShell>
  );
}
