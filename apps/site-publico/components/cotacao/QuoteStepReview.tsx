'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, Ticket, MapPin, Mail, MessageCircle } from 'lucide-react';
import type { CotacaoState } from './cotacao-utils';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_QUOTE || '5564993197555';

interface QuoteStepReviewProps {
  state: CotacaoState;
  onBack: () => void;
  onReset: () => void;
  hotelNames: string[];
  ticketNames: string[];
  attractionNames: string[];
}

function buildWhatsAppText(state: CotacaoState, hotelNames: string[], ticketNames: string[], attractionNames: string[]): string {
  const lines: string[] = ['*Solicitação de cotação - Monte suas férias*', ''];
  lines.push(`*Contato:* ${state.name}`);
  lines.push(`E-mail: ${state.email}`);
  if (state.phone) lines.push(`Telefone: ${state.phone}`);
  lines.push('');
  lines.push(`*Período:* ${state.checkIn || '-'} a ${state.checkOut || '-'}`);
  lines.push(`*Pessoas:* ${state.adults} adulto(s), ${state.children} criança(s)`);
  lines.push('');
  if (hotelNames.length) {
    lines.push('*Hotéis:*');
    hotelNames.forEach((n) => lines.push(`• ${n}`));
  }
  if (ticketNames.length) {
    lines.push('*Ingressos:*');
    ticketNames.forEach((n) => lines.push(`• ${n}`));
  }
  if (attractionNames.length) {
    lines.push('*Atrações:*');
    attractionNames.forEach((n) => lines.push(`• ${n}`));
  }
  if (state.addOns && Object.keys(state.addOns).length > 0) {
    lines.push('');
    lines.push('*Extras:* Café da manhã / Roupa de cama conforme seleção.');
  }
  if (state.notes) {
    lines.push('');
    lines.push(`*Obs:* ${state.notes}`);
  }
  return lines.join('\n');
}

export function QuoteStepReview({
  state,
  onBack,
  onReset,
  hotelNames,
  ticketNames,
  attractionNames,
}: QuoteStepReviewProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<'email' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendByEmail = async () => {
    setError(null);
    setSending(true);
    try {
      const res = await fetch('/api/cotacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: state.checkIn || undefined,
          checkOut: state.checkOut || undefined,
          adults: state.adults,
          children: state.children,
          hotelIds: state.hotelIds,
          ticketIds: state.ticketIds,
          attractionIds: state.attractionIds,
          hotelNames,
          ticketNames,
          attractionNames,
          addOns: state.addOns,
          name: state.name,
          email: state.email,
          phone: state.phone || undefined,
          notes: state.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar.');
        return;
      }
      setSent('email');
    } catch (e) {
      setError('Erro de conexão. Tente novamente ou use o WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  const sendByWhatsApp = () => {
    const text = buildWhatsAppText(state, hotelNames, ticketNames, attractionNames);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisão da cotação</CardTitle>
        <p className="text-sm text-muted-foreground">
          Confira os dados e escolha como deseja enviar.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <p><strong>Período:</strong> {state.checkIn || '-'} a {state.checkOut || '-'}</p>
          <p><strong>Pessoas:</strong> {state.adults} adulto(s), {state.children} criança(s)</p>
        </div>
        {hotelNames.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Hotel className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Hotéis</p>
              <ul className="list-disc list-inside">{hotelNames.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          </div>
        )}
        {ticketNames.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Ticket className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Ingressos</p>
              <ul className="list-disc list-inside">{ticketNames.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          </div>
        )}
        {attractionNames.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Atrações</p>
              <ul className="list-disc list-inside">{attractionNames.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          </div>
        )}
        <div className="text-sm">
          <p><strong>Contato:</strong> {state.name} – {state.email}</p>
          {state.phone && <p><strong>Telefone:</strong> {state.phone}</p>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {sent === 'email' && (
          <p className="text-sm text-green-600 font-medium">
            Cotação enviada por e-mail com sucesso! Entraremos em contato em breve.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Button
            onClick={sendByEmail}
            disabled={sending}
            className="w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            {sending ? 'Enviando...' : 'Enviar por e-mail'}
          </Button>
          <Button variant="outline" onClick={sendByWhatsApp} className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar por WhatsApp
          </Button>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="ghost" onClick={onBack} className="flex-1">
            Voltar
          </Button>
          <Button variant="ghost" onClick={onReset} className="flex-1">
            Limpar e recomeçar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
