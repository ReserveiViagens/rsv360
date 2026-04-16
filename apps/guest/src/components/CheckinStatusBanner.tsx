/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import Link from 'next/link';
import { CheckCircle2, Clock3, QrCode, Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import type { GuestReservation, PortalBookingStatus } from '@/types/auth';

function resolveBanner(status?: PortalBookingStatus | null, booking?: GuestReservation | null) {
  const bookingStatus = booking?.status || status?.booking?.status;
  const checkInDate = booking?.checkInDate || booking?.check_in_date || status?.booking?.checkInDate || status?.booking?.check_in_date;
  const checkInCandidate = checkInDate ? new Date(checkInDate) : null;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const canCheckInNow =
    bookingStatus === 'confirmed' &&
    checkInCandidate instanceof Date &&
    !Number.isNaN(checkInCandidate.getTime()) &&
    (checkInCandidate.toDateString() === today.toDateString() || checkInCandidate.toDateString() === tomorrow.toDateString());

  if (status?.canCheckIn) {
    return {
      tone: 'info',
      title: 'Check-in disponível',
      description: status.reason || 'Seu check-in online já está liberado.',
      action: '/checkin',
      icon: <Clock3 className="h-5 w-5" />,
      accent: 'bg-blue-50 text-blue-900',
    };
  }

  if (bookingStatus === 'checked_in') {
    return {
      tone: 'success',
      title: 'Check-in realizado',
      description: 'Seu acesso digital está ativo. Mostre o QR code na recepção.',
      action: '/reservations',
      icon: <QrCode className="h-5 w-5" />,
      accent: 'bg-emerald-50 text-emerald-900',
    };
  }

  if (bookingStatus === 'checked_out') {
    return {
      tone: 'warning',
      title: 'Check-out realizado',
      description: 'Obrigado pela estadia. Esperamos você de volta em breve.',
      action: '/profile',
      icon: <CheckCircle2 className="h-5 w-5" />,
      accent: 'bg-amber-50 text-amber-900',
    };
  }

  return {
      tone: 'neutral',
      title: canCheckInNow ? 'Check-in disponível' : 'Portal do Hóspede',
      description: canCheckInNow
        ? 'Seu check-in online está liberado e você já pode prosseguir.'
        : 'Acompanhe sua estadia, serviços e mensagens em um só lugar.',
      action: '/services',
      icon: <Sparkles className="h-5 w-5" />,
      accent: 'bg-slate-50 text-slate-900',
  };
}

export function CheckinStatusBanner({
  status,
  booking,
}: {
  status?: PortalBookingStatus | null;
  booking?: GuestReservation | null;
}) {
  const banner = resolveBanner(status, booking);

  return (
    <Card className={`border-0 ${banner.accent}`}>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-white/70 p-2">{banner.icon}</div>
            <div>
              <h3 className="text-base font-semibold">{banner.title}</h3>
              <p className="text-sm opacity-80">{banner.description}</p>
            </div>
          </div>

          <Button asChild variant="outline" className="border-white/50 bg-white/80">
            <Link href={banner.action}>Acessar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
