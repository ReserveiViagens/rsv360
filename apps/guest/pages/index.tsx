/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarRange, Sparkles, MessageSquare, BedDouble, CheckCircle2 } from 'lucide-react';
import { SEOHead } from '@shared/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckinStatusBanner } from '@/components/CheckinStatusBanner';
import { ReservationCard } from '@/components/ReservationCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useBooking, useReservations } from '@/hooks/use-reservations';
import { useCheckinStatus } from '@/hooks/use-checkin';
import { useMessages } from '@/hooks/use-messages';
import { formatCurrency, formatDate } from '@/lib/format';
import { buildClearedPortalTokenCookie } from '@/lib/portal-session';
import { loadPortalBootstrapOrRedirect, requirePortalToken, type PortalBootstrap } from '@/lib/ssr';
import type { GuestReservation } from '@/types/auth';

type DashboardProps = PortalBootstrap;

export default function GuestDashboardPage(props: DashboardProps) {
  const bookingQuery = useBooking(props.booking && props.guest ? { booking: props.booking, guest: props.guest } : undefined);
  const reservationsQuery = useReservations(props.booking ? [props.booking] : undefined);
  const statusQuery = useCheckinStatus(props.checkinStatus || undefined);
  const messagesQuery = useMessages();

  const booking = bookingQuery.data?.booking || props.booking;
  const guest = bookingQuery.data?.guest || props.guest;
  const reservations = reservationsQuery.data || [];
  const messages = messagesQuery.data || [];
  const status = statusQuery.data || props.checkinStatus;

  const firstName = guest?.firstName || guest?.name?.split(' ')[0] || 'Hóspede';

  return (
    <div className="space-y-6">
      <SEOHead
        title="Dashboard do Hóspede | RSV360"
        description="Acompanhe sua estadia, check-in, mensagens e serviços do portal RSV360."
        url="https://www.reserveiviagens.com.br"
        noIndex
        siteName="RSV360 Guest"
      />

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden bg-brand-900 text-white">
          <CardContent className="relative p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Bem-vindo</p>
                <h1 className="mt-2 text-3xl font-bold">{firstName}.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-100">
                  Estamos cuidando da sua experiência para que tudo fique mais simples, rápido e acolhedor.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[24rem]">
                {[
                  { label: 'Reservas', value: reservations.length || 1, icon: CalendarRange },
                  { label: 'Mensagens', value: messages.length, icon: MessageSquare },
                  { label: 'Status', value: booking?.status || 'ativo', icon: CheckCircle2 },
                  { label: 'Check-in', value: status?.canCheckIn ? 'liberado' : 'aguardando', icon: BedDouble },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                      <Icon className="h-4 w-4 text-brand-100" />
                      <p className="mt-2 text-xs uppercase tracking-wide text-brand-100">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Próxima reserva</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {booking?.property_name || booking?.hotel_name || 'Reserva ativa'}
                  </p>
                </div>
                <Sparkles className="h-6 w-6 text-brand-900" />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Check-in</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate((booking?.checkInDate || booking?.check_in_date) as string | number | Date | null | undefined)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Check-out</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate((booking?.checkOutDate || booking?.check_out_date) as string | number | Date | null | undefined)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Valor</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(booking?.totalAmount || booking?.total_amount as number)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <CheckinStatusBanner status={status} booking={booking || undefined} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Minha reserva</h2>
            <Button variant="outline" asChild>
              <Link href="/reservations">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {booking ? <ReservationCard reservation={booking} /> : <LoadingSkeleton className="h-44" />}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Atalhos rápidos</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { href: '/checkin', title: 'Fazer check-in', description: 'Prepare documentos e aceite os termos.' },
              { href: '/services', title: 'Solicitar serviço', description: 'Room service, limpeza, transfer e mais.' },
              { href: '/messages', title: 'Mensagens', description: 'Converse com a recepção e acompanhe solicitações.' },
              { href: '/profile', title: 'Atualizar perfil', description: 'Mantenha dados e preferências em dia.' },
            ].map((item) => (
              <Card key={item.href}>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                    </div>
                    <Button asChild variant="ghost" size="icon">
                      <Link href={item.href}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (context) => {
  const tokenResult = await requirePortalToken(context);
  if (typeof tokenResult !== 'string') {
    return tokenResult;
  }

  const bootstrapResult = await loadPortalBootstrapOrRedirect(tokenResult);
  if (bootstrapResult.kind === 'redirect') {
    context.res.setHeader('Set-Cookie', buildClearedPortalTokenCookie());
    return { redirect: bootstrapResult.redirect };
  }

  return {
    props: bootstrapResult.props,
  };
};
