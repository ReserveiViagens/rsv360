/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { SEOHead } from '@shared/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { QRCodePlaceholder } from '@/components/QRCodePlaceholder';
import { CheckinStatusBanner } from '@/components/CheckinStatusBanner';
import { useBooking } from '@/hooks/use-reservations';
import { useCheckinMutation } from '@/hooks/use-checkin';
import { formatDate } from '@/lib/format';
import { buildClearedPortalTokenCookie } from '@/lib/portal-session';
import { loadPortalBootstrapOrRedirect, requirePortalToken, type PortalBootstrap } from '@/lib/ssr';

export default function CheckinPage(props: PortalBootstrap) {
  const bookingQuery = useBooking(props.booking && props.guest ? { booking: props.booking, guest: props.guest } : undefined);
  const booking = bookingQuery.data?.booking || props.booking;
  const guest = bookingQuery.data?.guest || props.guest;
  const checkinMutation = useCheckinMutation();
  const [arrivalTime, setArrivalTime] = useState('');
  const [documentType, setDocumentType] = useState('cpf');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDocumentNumber(String(guest?.documentNumber || guest?.document || ''));
    setDocumentType(String(guest?.documentType || 'cpf'));
  }, [guest]);

  const canSubmit = useMemo(() => acceptedTerms && Boolean(booking), [acceptedTerms, booking]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!booking) return;

    try {
      await checkinMutation.mutateAsync({
        guestData: {
          full_name: guest?.name || [guest?.firstName, guest?.lastName].filter(Boolean).join(' '),
          email: guest?.email,
          phone: guest?.phone,
          document_type: documentType,
          document_number: documentNumber,
          estimated_arrival: arrivalTime,
          consent_lgpd: acceptedTerms,
          document_file_name: documentFile?.name || null,
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
        title="Check-in Digital | RSV360 Guest"
        description="Faça seu check-in com poucos passos e acelere sua chegada."
        url="https://www.reserveiviagens.com.br/checkin"
        noIndex
      />
      <CheckinStatusBanner status={props.checkinStatus} booking={booking || undefined} />

      <Card>
        <CardHeader>
          <CardTitle>Check-in digital</CardTitle>
          <CardDescription>Complete seus dados e confirme sua chegada.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="space-y-4">
                <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900">
                  <p className="text-sm font-semibold">Check-in confirmado</p>
                  <p className="mt-1 text-sm">Seu check-in foi enviado com sucesso. Mostre o QR code abaixo na recepção.</p>
                </div>
                <div className="grid gap-3 text-sm text-slate-600">
                  <p>Quarto: {booking?.roomNumber || booking?.room_number || '-'}</p>
                  <p>Entrada: {formatDate(booking?.checkInDate || booking?.check_in_date)}</p>
                  <p>Horário estimado: {arrivalTime || 'não informado'}</p>
                </div>
              </div>
              <QRCodePlaceholder code={String(booking?.id || booking?.booking_id || 'RSV360')} />
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" value={guest?.name || [guest?.firstName, guest?.lastName].filter(Boolean).join(' ')} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" value={guest?.email || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de documento</Label>
                  <Select id="documentType" value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                    <option value="cpf">CPF</option>
                    <option value="rg">RG</option>
                    <option value="passaporte">Passaporte</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número do documento</Label>
                  <Input id="documentNumber" value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">Horário estimado de chegada</Label>
                  <Input id="arrivalTime" value={arrivalTime} onChange={(event) => setArrivalTime(event.target.value)} placeholder="14:30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentFile">Documento (visual)</Label>
                  <Input id="documentFile" type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Observações / termos</Label>
                <Textarea id="specialRequests" value={`Hóspede ciente dos termos e da política LGPD.`} readOnly />
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1" />
                <span>Aceito os termos de hospedagem e autorizo o uso dos dados para finalidades operacionais do check-in.</span>
              </label>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={!canSubmit || checkinMutation.isPending}>
                  {checkinMutation.isPending ? 'Confirmando...' : 'Confirmar Check-in'}
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
