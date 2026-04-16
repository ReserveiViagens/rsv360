/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GetServerSideProps } from 'next';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import { SEOHead } from '@shared/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ReservationCard } from '@/components/ReservationCard';
import { EmptyState } from '@/components/EmptyState';
import { useReservationUpdate, useReservations } from '@/hooks/use-reservations';
import { formatDate, formatDateTime } from '@/lib/format';
import { loadPortalBootstrap, requirePortalToken, type PortalBootstrap } from '@/lib/ssr';

type ReservationDetailProps = PortalBootstrap & { reservationId?: string | null };

function normalizeDateValue(value: unknown): string | number | Date | null {
  if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
    return value;
  }
  return null;
}

export default function ReservationDetailPage(props: ReservationDetailProps) {
  const router = useRouter();
  const [specialRequests, setSpecialRequests] = useState('');
  const updateReservation = useReservationUpdate();
  const reservationsQuery = useReservations(props.booking ? [props.booking] : undefined);
  const reservation = reservationsQuery.data?.[0] || props.booking;

  useEffect(() => {
    if (reservation) {
      setSpecialRequests(String(reservation.specialRequests || reservation.special_requests || ''));
    }
  }, [reservation]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reservation?.id && !reservation?.booking_id) return;

    try {
      await updateReservation.mutateAsync({
        id: reservation.id || reservation.booking_id || props.reservationId || 'atual',
        data: { special_requests: specialRequests },
      });
    } catch {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'rsv360_guest_reservation_notes',
          JSON.stringify({ id: reservation?.id || reservation?.booking_id, specialRequests }),
        );
      }
    }
  }

  if (!reservation) {
    return (
      <EmptyState
        title="Reserva não encontrada"
        description="Não encontramos uma reserva ativa para este portal."
        actionLabel="Voltar"
        onAction={() => void router.push('/reservations')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SEOHead
        title="Detalhe da Reserva | RSV360 Guest"
        description="Informações detalhadas da sua reserva e pedidos especiais."
        url={`https://www.reserveiviagens.com.br/reservations/${reservation.id || reservation.booking_id || 'atual'}`}
        noIndex
      />

      <ReservationCard reservation={reservation} />

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da estadia</CardTitle>
          <CardDescription>Revise os dados principais da sua reserva e mantenha seus pedidos especiais atualizados.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Quarto</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{reservation.roomNumber || reservation.room_number || '-'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{reservation.status || 'confirmed'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Entrada</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(normalizeDateValue(reservation.checkInDate ?? reservation.check_in_date))}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Saída</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(normalizeDateValue(reservation.checkOutDate ?? reservation.check_out_date))}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos especiais</CardTitle>
          <CardDescription>Atualize solicitações para a equipe antes da sua chegada.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="space-y-2">
              <Label htmlFor="specialRequests">Pedidos especiais</Label>
              <Textarea
                id="specialRequests"
                value={specialRequests}
                onChange={(event) => setSpecialRequests(event.target.value)}
                placeholder="Ex.: cama king, vista para piscina, travesseiros extras..."
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={updateReservation.isPending}>
                {updateReservation.isPending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
              <Button type="button" variant="outline" onClick={() => void router.push('/checkin')}>
                Fazer check-in
              </Button>
              <Button type="button" variant="ghost" onClick={() => void router.push('/checkout')}>
                Fazer check-out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline da reserva</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="rounded-xl bg-slate-50 p-4">
            Reserva ativa desde {formatDateTime(normalizeDateValue(reservation.created_at ?? new Date().toISOString()))}.
          </div>
          <div className="rounded-xl bg-slate-50 p-4">Status atual: {reservation.status || 'confirmed'}.</div>
          <div className="rounded-xl bg-slate-50 p-4">
            Última atualização: {formatDateTime(normalizeDateValue(reservation.updated_at ?? new Date().toISOString()))}.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<ReservationDetailProps> = async (context) => {
  const tokenResult = await requirePortalToken(context);
  if (typeof tokenResult !== 'string') {
    return tokenResult as any;
  }

  try {
    const bootstrap = await loadPortalBootstrap(tokenResult);
    return {
      props: {
        ...bootstrap,
        reservationId: Array.isArray(context.params?.id) ? context.params?.id[0] : (context.params?.id as string | undefined) || null,
      },
    };
  } catch {
    return {
      props: {
        booking: null,
        guest: null,
        requests: [],
        feedback: null,
        checkinStatus: null,
        reservationId: Array.isArray(context.params?.id) ? context.params?.id[0] : (context.params?.id as string | undefined) || null,
      },
    };
  }
};
