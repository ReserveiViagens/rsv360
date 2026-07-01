'use client';

import { useState } from 'react';
import { PricingModuleShell } from '../PricingModuleShell';
import { SmartPricingDashboard } from '@/components/smart-pricing/SmartPricingDashboard';
import { PricingBookingsBreakdown } from '../PricingBookingsBreakdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BookingBreakdownItem } from '@/components/analytics/BookingBreakdownTable';

function SmartPanel({ itemId, basePrice }: { itemId: string; basePrice: number }) {
  const [breakdown, setBreakdown] = useState<BookingBreakdownItem[]>([]);
  const [breakdownLabel, setBreakdownLabel] = useState('');

  const loadBreakdown = async (start?: string, end?: string) => {
    const params = new URLSearchParams({ item_id: itemId });
    if (start) params.set('start_date', start);
    if (end) params.set('end_date', end);
    const res = await fetch(`/api/pricing/dashboard?${params}`);
    const json = await res.json();
    if (res.ok && json.data?.breakdown?.bookings) {
      setBreakdown(json.data.breakdown.bookings);
      setBreakdownLabel(
        start && end
          ? `Reservas entre ${start} e ${end}`
          : 'Reservas recentes desta propriedade'
      );
    }
  };

  return (
    <div className="space-y-6">
      <SmartPricingDashboard
        propertyId={parseInt(itemId, 10)}
        defaultBasePrice={basePrice}
        hidePropertyInput
        onCalculated={(checkIn, checkOut) => loadBreakdown(checkIn, checkOut)}
      />

      {breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento — {breakdownLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <PricingBookingsBreakdown
              bookings={breakdown}
              showProperty={false}
              description="Clientes e valores que fundamentam a simulação de tarifa."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function PricingSmartModule() {
  return (
    <PricingModuleShell
      title="Smart Pricing"
      description="Sugestões dinâmicas, simulação de tarifas e reservas que compõem o histórico."
    >
      {({ itemId, item }) => (
        <SmartPanel itemId={itemId} basePrice={item?.basePrice ?? 250} />
      )}
    </PricingModuleShell>
  );
}
