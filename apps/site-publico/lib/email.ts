import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Configuração do transporter de email
function createEmailTransporter() {
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.warn('⚠️ SMTP não configurado. Emails não serão enviados.');
    return null;
  }

  return nodemailer.createTransport(smtpConfig);
}

// Função para carregar template HTML
function loadTemplate(templateName: string, variables: Record<string, string> = {}): string {
  try {
    const templatePath = path.join(process.cwd(), 'templates', 'emails', `${templateName}.html`);
    let html = fs.readFileSync(templatePath, 'utf-8');
    
    // Adicionar siteUrl padrão se não fornecido
    if (!variables.siteUrl) {
      variables.siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }
    
    // Substituir variáveis no template
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, variables[key] || '');
    });
    
    return html;
  } catch (error) {
    console.error(`Erro ao carregar template ${templateName}:`, error);
    // Retornar template básico em caso de erro
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            ${Object.keys(variables).map(key => `<p><strong>${key}:</strong> ${variables[key] || ''}</p>`).join('')}
          </div>
        </body>
      </html>
    `;
  }
}

// Função genérica para enviar email
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    console.warn('⚠️ Email não enviado - SMTP não configurado');
    return false;
  }

  const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@rsv360.com';

  try {
    const info = await transporter.sendMail({
      from: `RSV 360° <${emailFrom}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Remover HTML para versão texto
    });

    console.log('✅ Email enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}

// Email de confirmação de reserva
export async function sendBookingConfirmation(booking: {
  code: string;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  paymentMethod?: string;
}): Promise<boolean> {
  const html = loadTemplate('booking-confirmation', {
    guestName: booking.guestName,
    bookingCode: booking.code,
    propertyName: booking.propertyName,
    checkIn: new Date(booking.checkIn).toLocaleDateString('pt-BR'),
    checkOut: new Date(booking.checkOut).toLocaleDateString('pt-BR'),
    guests: booking.guests.toString(),
    total: booking.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    paymentMethod: booking.paymentMethod || 'PIX',
  });

  return sendEmail(
    booking.guestEmail,
    `Confirmação de Reserva #${booking.code} - RSV 360°`,
    html
  );
}

// Email de boas-vindas
export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
}): Promise<boolean> {
  const html = loadTemplate('welcome', {
    userName: user.name,
    userEmail: user.email,
  });

  return sendEmail(
    user.email,
    'Bem-vindo ao RSV 360°!',
    html
  );
}

// Email de recuperação de senha
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/redefinir-senha?token=${resetToken}`;
  
  const html = loadTemplate('password-reset', {
    resetUrl,
    resetToken,
  });

  return sendEmail(
    email,
    'Recuperação de Senha - RSV 360°',
    html
  );
}

// Email de cancelamento de reserva
export async function sendBookingCancelled(booking: {
  code: string;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  refundAmount?: number;
}): Promise<boolean> {
  const html = loadTemplate('booking-cancelled', {
    guestName: booking.guestName,
    bookingCode: booking.code,
    propertyName: booking.propertyName,
    refundAmount: booking.refundAmount 
      ? booking.refundAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : 'Será processado em até 5 dias úteis',
  });

  return sendEmail(
    booking.guestEmail,
    `Reserva #${booking.code} Cancelada - RSV 360°`,
    html
  );
}

// Email de pagamento confirmado
export async function sendPaymentConfirmed(booking: {
  code: string;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  amount: number;
  paymentMethod: string;
}): Promise<boolean> {
  const html = loadTemplate('payment-confirmed', {
    guestName: booking.guestName,
    bookingCode: booking.code,
    propertyName: booking.propertyName,
    amount: booking.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    paymentMethod: booking.paymentMethod,
  });

  return sendEmail(
    booking.guestEmail,
    `Pagamento Confirmado - Reserva #${booking.code}`,
    html
  );
}

// Email de instruções de check-in
export async function sendCheckInInstructions(booking: {
  code: string;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  propertyAddress: string;
  checkIn: string;
  checkOut: string;
  lockPin?: string;
  wifiPassword?: string;
  wifiName?: string;
  parkingInfo?: string;
}): Promise<boolean> {
  const html = loadTemplate('checkin-instructions', {
    guestName: booking.guestName,
    bookingCode: booking.code,
    propertyName: booking.propertyName,
    propertyAddress: booking.propertyAddress,
    checkIn: new Date(booking.checkIn).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    checkOut: new Date(booking.checkOut).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    lockPin: booking.lockPin || 'Será enviado 48h antes do check-in',
    wifiName: booking.wifiName || 'Não informado',
    wifiPassword: booking.wifiPassword || 'Não informado',
    parkingInfo: booking.parkingInfo || 'Não informado',
  });

  return sendEmail(
    booking.guestEmail,
    `Instruções de Check-in - Reserva #${booking.code}`,
    html
  );
}

