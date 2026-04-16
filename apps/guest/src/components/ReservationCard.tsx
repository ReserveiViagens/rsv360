/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import Link from 'next/link';
import { CalendarRange, MapPin, BedDouble } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { formatCurrency, formatDate, formatReservationLabel } from '@/lib/format';
import type { GuestReservation } from '@/types/auth';
import { StatusBadge } from './StatusBadge';

export function ReservationCard({ reservation }: { reservation: GuestReservation }) {
  return (
    <Card className="overflow-hidden">
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{formatReservationLabel(reservation.booking_id || reservation.id)}</Badge>
              <StatusBadge status={reservation.status || 'confirmed'} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {reservation.hotelName || reservation.hotel_name || reservation.property_name || 'Reserva RSV360'}
              </h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {reservation.roomNumber || reservation.room_number || 'Quarto a definir'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Check-in</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <CalendarRange className="h-4 w-4" />
                  {formatDate(reservation.checkInDate || reservation.check_in_date)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Check-out</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <BedDouble className="h-4 w-4" />
                  {formatDate(reservation.checkOutDate || reservation.check_out_date)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatCurrency((reservation.totalAmount ?? (reservation.total_amount as number | undefined)) as number | undefined)}
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/reservations/${reservation.id || reservation.booking_id || 'atual'}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ver detalhes
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
