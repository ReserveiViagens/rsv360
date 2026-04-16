/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GetServerSideProps } from 'next';
import { SEOHead } from '@shared/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { ReservationCard } from '@/components/ReservationCard';
import { useReservations } from '@/hooks/use-reservations';
import { loadPortalBootstrap, requirePortalToken, type PortalBootstrap } from '@/lib/ssr';

export default function ReservationsPage(props: PortalBootstrap) {
  const reservationsQuery = useReservations(props.booking ? [props.booking] : undefined);
  const reservations = reservationsQuery.data || [];

  return (
    <div className="space-y-6">
      <SEOHead
        title="Reservas | RSV360 Guest"
        description="Lista e detalhes da sua reserva no portal do hóspede RSV360."
        url="https://www.reserveiviagens.com.br/reservations"
        noIndex
      />
      <Card>
        <CardHeader>
          <CardTitle>Reservas</CardTitle>
          <CardDescription>Acompanhe sua estadia atual e qualquer histórico disponível para o portal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reservations.length > 0 ? (
            reservations.map((reservation) => <ReservationCard key={reservation.id || reservation.booking_id} reservation={reservation} />)
          ) : (
            <EmptyState
              title="Nenhuma reserva encontrada"
              description="Conecte-se ao portal para ver sua reserva atual."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PortalBootstrap> = async (context) => {
  const tokenResult = await requirePortalToken(context);
  if (typeof tokenResult !== 'string') {
    return tokenResult as any;
  }

  try {
    return { props: await loadPortalBootstrap(tokenResult) };
  } catch {
    return {
      props: {
        booking: null,
        guest: null,
        requests: [],
        feedback: null,
        checkinStatus: null,
      },
    };
  }
};
