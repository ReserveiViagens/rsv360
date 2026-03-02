import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

const COTACAO_TO = process.env.COTACAO_EMAIL_TO || process.env.EMAIL_TO || 'reservas@reserveiviagens.com.br';

export interface CotacaoPayload {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  hotelIds?: (number | string)[];
  ticketIds?: (number | string)[];
  attractionIds?: (number | string)[];
  hotelNames?: string[];
  ticketNames?: string[];
  attractionNames?: string[];
  addOns?: Record<string, { cafeDaManha?: boolean; roupaDeCama?: boolean }>;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

function buildEmailContent(payload: CotacaoPayload): { subject: string; html: string; text: string } {
  const lines: string[] = [];
  lines.push('Nova solicitação de cotação - Monte suas férias');
  lines.push('');
  lines.push('--- DADOS DO SOLICITANTE ---');
  lines.push(`Nome: ${payload.name}`);
  lines.push(`E-mail: ${payload.email}`);
  lines.push(`Telefone: ${payload.phone || '-'}`);
  if (payload.notes) lines.push(`Observações: ${payload.notes}`);
  lines.push('');
  lines.push('--- PERÍODO E HÓSPEDES ---');
  lines.push(`Check-in: ${payload.checkIn || '-'}`);
  lines.push(`Check-out: ${payload.checkOut || '-'}`);
  lines.push(`Adultos: ${payload.adults ?? '-'}`);
  lines.push(`Crianças: ${payload.children ?? '-'}`);
  lines.push('');
  lines.push('--- PRODUTOS ESCOLHIDOS ---');
  if (payload.hotelNames?.length) {
    lines.push('Hotéis:');
    payload.hotelNames.forEach((n) => lines.push(`  • ${n}`));
  }
  if (payload.ticketNames?.length) {
    lines.push('Ingressos:');
    payload.ticketNames.forEach((n) => lines.push(`  • ${n}`));
  }
  if (payload.attractionNames?.length) {
    lines.push('Atrações:');
    payload.attractionNames.forEach((n) => lines.push(`  • ${n}`));
  }
  if (payload.addOns && Object.keys(payload.addOns).length > 0) {
    lines.push('');
    lines.push('--- ADD-ONS ---');
    Object.entries(payload.addOns).forEach(([hotelId, opts]) => {
      const parts: string[] = [];
      if (opts.cafeDaManha) parts.push('Café da manhã');
      if (opts.roupaDeCama) parts.push('Roupa de cama');
      if (parts.length) lines.push(`Hotel ${hotelId}: ${parts.join(', ')}`);
    });
  }

  const text = lines.join('\n');
  const subject = `Cotação: ${payload.name} - ${payload.checkIn || 'sem data'}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1e40af;">Nova cotação - Monte suas férias</h2>
  <p><strong>Nome:</strong> ${escapeHtml(payload.name)}</p>
  <p><strong>E-mail:</strong> ${escapeHtml(payload.email)}</p>
  <p><strong>Telefone:</strong> ${escapeHtml(payload.phone || '-')}</p>
  ${payload.notes ? `<p><strong>Observações:</strong> ${escapeHtml(payload.notes)}</p>` : ''}
  <hr style="border: none; border-top: 1px solid #eee;">
  <p><strong>Check-in:</strong> ${escapeHtml(payload.checkIn || '-')} &nbsp; <strong>Check-out:</strong> ${escapeHtml(payload.checkOut || '-')}</p>
  <p><strong>Adultos:</strong> ${payload.adults ?? '-'} &nbsp; <strong>Crianças:</strong> ${payload.children ?? '-'}</p>
  <hr style="border: none; border-top: 1px solid #eee;">
  <h3 style="color: #1e40af;">Produtos</h3>
  ${payload.hotelNames?.length ? `<p><strong>Hotéis:</strong><br>${payload.hotelNames.map((n) => `• ${escapeHtml(n)}`).join('<br>')}</p>` : ''}
  ${payload.ticketNames?.length ? `<p><strong>Ingressos:</strong><br>${payload.ticketNames.map((n) => `• ${escapeHtml(n)}`).join('<br>')}</p>` : ''}
  ${payload.attractionNames?.length ? `<p><strong>Atrações:</strong><br>${payload.attractionNames.map((n) => `• ${escapeHtml(n)}`).join('<br>')}</p>` : ''}
  ${payload.addOns && Object.keys(payload.addOns).length > 0 ? `<p><strong>Add-ons:</strong> Café da manhã / Roupa de cama conforme seleção.</p>` : ''}
</body>
</html>
  `.trim();

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body as CotacaoPayload;

    if (!payload.email || typeof payload.email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'E-mail é obrigatório.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return NextResponse.json(
        { success: false, error: 'E-mail inválido.' },
        { status: 400 }
      );
    }

    const hasProducts =
      (payload.hotelIds?.length ?? 0) > 0 ||
      (payload.ticketIds?.length ?? 0) > 0 ||
      (payload.attractionIds?.length ?? 0) > 0;
    if (!hasProducts) {
      return NextResponse.json(
        { success: false, error: 'Selecione pelo menos um produto (hotel, ingresso ou atração).' },
        { status: 400 }
      );
    }

    if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório.' },
        { status: 400 }
      );
    }

    const { subject, html, text } = buildEmailContent({
      ...payload,
      name: payload.name.trim(),
      email: payload.email.trim(),
    });

    const success = await sendEmail(COTACAO_TO, subject, html, text);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Cotação enviada com sucesso. Entraremos em contato em breve.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao enviar e-mail. Tente novamente ou use o WhatsApp.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Erro na API de cotação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
