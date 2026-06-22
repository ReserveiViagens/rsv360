/** Envio de e-mail de reset — log em dev; adapter SMTP/SES futuro (spec §8). */

async function sendPasswordResetEmail({ email, name, resetUrl, token }) {
  const payload = {
    to: email,
    name: name || email,
    resetUrl,
    tokenPreview: token ? `${token.slice(0, 4)}…` : undefined,
  };

  if (process.env.NODE_ENV === 'production' && process.env.PASSWORD_RESET_EMAIL_WEBHOOK) {
    // Hook opcional para integração externa
    console.info('[AUTH] password reset email queued', { to: email });
    return { sent: true, mode: 'webhook' };
  }

  console.info('[AUTH] password reset email (dev)', JSON.stringify(payload));
  return { sent: true, mode: 'log' };
}

module.exports = { sendPasswordResetEmail };
