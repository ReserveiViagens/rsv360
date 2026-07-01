'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { PricingModuleShell } from '../PricingModuleShell';
import { PricingBookingsBreakdown } from '../PricingBookingsBreakdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BookingBreakdownItem } from '@/components/analytics/BookingBreakdownTable';

const PricingCalendar = dynamic(() => import('../PricingCalendar'), { ssr: false });

function CalendarPanel({ itemId }: { itemId: string }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: dayBookings } = useQuery({
    queryKey: ['pricing-calendar-day', itemId, selectedDate],
    enabled: !!selectedDate,
    queryFn: async () => {
      const res = await fetch(
        `/api/pricing/calendar/${itemId}?detail_date=${selectedDate}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro');
      return (json.breakdown as BookingBreakdownItem[]) || [];
    },
  });

  return (
    <div className="space-y-6">
      <PricingCalendar
        propertyId={itemId}
        dateRange={{
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        }}
        onDateClick={(date) => setSelectedDate(date.toISOString().slice(0, 10))}
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

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Reservas em {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PricingBookingsBreakdown
              bookings={dayBookings || []}
              showProperty={false}
              description="Clientes, horários e valores das reservas com check-in nesta data."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function PricingCalendarModule() {
  return (
    <PricingModuleShell
      title="Calendário de preços"
      description="Grade mensal com demanda por cor, override manual e drill-down por dia."
    >
      {({ itemId }) => <CalendarPanel itemId={itemId} />}
    </PricingModuleShell>
  );
}
