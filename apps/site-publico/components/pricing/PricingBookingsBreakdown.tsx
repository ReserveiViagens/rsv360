'use client';

/**
 * Tabela de reservas no contexto de precificação (reexporta analytics).
 */

import {
  BookingBreakdownTable,
  type BookingBreakdownItem,
} from '@/components/analytics/BookingBreakdownTable';

export type { BookingBreakdownItem };

interface PricingBookingsBreakdownProps {
  bookings: BookingBreakdownItem[];
  showProperty?: boolean;
  showCustomer?: boolean;
  title?: string;
  description?: string;
}

export function PricingBookingsBreakdown({
  bookings,
  showProperty = false,
  showCustomer = true,
  title,
  description,
}: PricingBookingsBreakdownProps) {
  return (
    <div className="space-y-2">
      {title && <h3 className="font-semibold text-base">{title}</h3>}
      {description && <p className="text-sm text-slate-500">{description}</p>}
      <BookingBreakdownTable
        bookings={bookings}
        showProperty={showProperty}
        showCustomer={showCustomer}
      />
    </div>
  );
}
