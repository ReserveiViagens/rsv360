/** Envio de e-mail de reset — webhook, SMTP/SES ou log em dev (D2.8). */

function getEmailFrom() {
  const from =
    process.env.PASSWORD_RESET_EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    'noreply@rsv360.com';
  if (from.includes('<')) {
    return from;
  }
  return `RSV 360° <${from}>`;
}

function getWebhookUrl() {
  return (process.env.PASSWORD_RESET_EMAIL_WEBHOOK || '').trim();
}

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

function buildEmailContent({ name, resetUrl }) {
  const displayName = name || 'usuário';
  const subject = 'Recuperação de Senha - RSV 360°';
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f8fafc;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #e2e8f0">
    <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a">Recuperação de senha</h1>
    <p>Olá, ${displayName}.</p>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta RSV 360°. O link abaixo é válido por <strong>1 hora</strong>.</p>
    <p style="margin:28px 0">
      <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600">Redefinir senha</a>
    </p>
    <p style="font-size:13px;color:#64748b;word-break:break-all">Ou copie e cole: ${resetUrl}</p>
    <p style="font-size:13px;color:#64748b;margin-top:24px">Se você não solicitou esta alteração, ignore este e-mail.</p>
  </div>
</body>
</html>`;
  const text = [
    `Olá, ${displayName}.`,
    '',
    'Recebemos uma solicitação para redefinir sua senha RSV 360° (válido por 1 hora).',
    '',
    resetUrl,
    '',
    'Se você não solicitou, ignore este e-mail.',
  ].join('\n');

  return { subject, html, text };
}

async function sendViaWebhook(payload) {
  const url = getWebhookUrl();
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const secret = (process.env.PASSWORD_RESET_EMAIL_WEBHOOK_SECRET || '').trim();
  if (secret) {
    headers.Authorization = `Bearer ${secret}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(Number(process.env.PASSWORD_RESET_EMAIL_WEBHOOK_TIMEOUT_MS || 15000)),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Webhook ${response.status}: ${body.slice(0, 200)}`);
  }

  return { sent: true, mode: 'webhook' };
}

async function sendViaSmtp({ to, subject, html, text }) {
  const nodemailer = require('nodemailer');
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure =
    process.env.SMTP_SECURE === 'true' || String(process.env.SMTP_PORT) === '465';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: getEmailFrom(),
    to,
    subject,
    html,
    text,
  });

  return { sent: true, mode: 'smtp', messageId: info.messageId };
}

/**
 * Prioridade: webhook → SMTP/SES → log (dev).
 * Nunca propaga erro — forgot-password mantém resposta genérica.
 */
async function sendPasswordResetEmail({ email, name, resetUrl, token }) {
  const { subject, html, text } = buildEmailContent({ name, resetUrl });
  const payload = {
    to: email,
    name: name || email,
    resetUrl,
    subject,
    html,
    text,
    tokenPreview: token ? `${token.slice(0, 4)}…` : undefined,
  };

  try {
    if (getWebhookUrl()) {
      return await sendViaWebhook(payload);
    }

    if (isSmtpConfigured()) {
      return await sendViaSmtp({ to: email, subject, html, text });
    }

    console.info('[AUTH] password reset email (dev/log)', JSON.stringify(payload));
    return { sent: true, mode: 'log' };
  } catch (error) {
    console.error('[AUTH] password reset email delivery failed:', error?.message || error);
    return { sent: false, mode: 'error', error: error?.message || 'delivery_failed' };
  }
}

module.exports = {
  sendPasswordResetEmail,
  buildEmailContent,
  getEmailFrom,
  isSmtpConfigured,
  getWebhookUrl,
};
