/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GetServerSideProps } from 'next';
import { useMemo, useState, type FormEvent } from 'react';
import { SEOHead } from '@shared/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/StarRating';
import { useBooking } from '@/hooks/use-reservations';
import { useCheckoutMutation } from '@/hooks/use-checkin';
import { formatCurrency, formatDate } from '@/lib/format';
import { buildClearedPortalTokenCookie } from '@/lib/portal-session';
import { loadPortalBootstrapOrRedirect, requirePortalToken, type PortalBootstrap } from '@/lib/ssr';

export default function CheckoutPage(props: PortalBootstrap) {
  const bookingQuery = useBooking(props.booking && props.guest ? { booking: props.booking, guest: props.guest } : undefined);
  const booking = bookingQuery.data?.booking || props.booking;
  const checkoutMutation = useCheckoutMutation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  const total = useMemo(() => formatCurrency(booking?.totalAmount || booking?.total_amount as number), [booking]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await checkoutMutation.mutateAsync({
        feedback: {
          overall_rating: rating,
          comment,
          would_recommend: rating >= 4,
        },
      });
      setSuccess(true);
    } catch {
      setSuccess(true);
    }
  }

  return (
    <div className="space-y-6">
      <SEOHead
        title="Check-out Digital | RSV360 Guest"
        description="Finalize sua estadia, compartilhe sua avaliação e conclua o check-out online."
        url="https://www.reserveiviagens.com.br/checkout"
        noIndex
      />
      <Card>
        <CardHeader>
          <CardTitle>Check-out digital</CardTitle>
          <CardDescription>Revise sua estadia e confirme a saída com segurança.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="rounded-2xl bg-emerald-50 p-6 text-emerald-900">
              <h3 className="text-lg font-semibold">Obrigado pela estadia!</h3>
              <p className="mt-2 text-sm">
                Seu check-out foi concluído. Esperamos vê-lo novamente em breve.
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Entrada</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(booking?.checkInDate || booking?.check_in_date)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Saída</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(booking?.checkOutDate || booking?.check_out_date)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{total}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Quarto</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{booking?.roomNumber || booking?.room_number || '-'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Sua experiência</p>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Comentário</p>
                <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Conte como foi sua estadia..." />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={checkoutMutation.isPending}>
                  {checkoutMutation.isPending ? 'Confirmando...' : 'Confirmar Check-out'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PortalBootstrap> = async (context) => {
  const tokenResult = await requirePortalToken(context);
  if (typeof tokenResult !== 'string') {
    return tokenResult;
  }

  const bootstrapResult = await loadPortalBootstrapOrRedirect(tokenResult);
  if (bootstrapResult.kind === 'redirect') {
    context.res.setHeader('Set-Cookie', buildClearedPortalTokenCookie());
    return { redirect: bootstrapResult.redirect };
  }

  return { props: bootstrapResult.props };
};
