'use client';

/**
 * Tabela reutilizável de drill-down de reservas (Analytics / CRM).
 */

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface BookingBreakdownItem {
  id: number;
  booking_code: string;
  item_id: number;
  item_name: string;
  customer_name: string;
  customer_email: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface BookingBreakdownTableProps {
  bookings: BookingBreakdownItem[];
  showProperty?: boolean;
  showCustomer?: boolean;
  className?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function BookingBreakdownTable({
  bookings,
  showProperty = true,
  showCustomer = true,
  className,
}: BookingBreakdownTableProps) {
  if (bookings.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        Nenhuma reserva encontrada para este período.
      </p>
    );
  }

  return (
    <div className={`rounded-md border overflow-x-auto ${className || ''}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            {showProperty && <TableHead>Propriedade</TableHead>}
            {showCustomer && <TableHead>Cliente</TableHead>}
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Reservado em</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-mono text-xs">{booking.booking_code}</TableCell>
              {showProperty && (
                <TableCell>
                  <Link
                    href={`/analytics/properties/${booking.item_id}`}
                    className="text-primary hover:underline"
                  >
                    {booking.item_name}
                  </Link>
                </TableCell>
              )}
              {showCustomer && (
                <TableCell>
                  <div className="font-medium">{booking.customer_name}</div>
                  <div className="text-xs text-gray-500">{booking.customer_email}</div>
                </TableCell>
              )}
              <TableCell>{formatDate(booking.start_date)}</TableCell>
              <TableCell>{formatDate(booking.end_date)}</TableCell>
              <TableCell>{formatDateTime(booking.created_at)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(booking.total_amount)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{booking.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
