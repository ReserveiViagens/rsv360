const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerifyResult {
  ok: boolean;
  error?: string;
}

export async function verificarTurnstile(
  token: string | undefined,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, error: 'Turnstile não configurado no servidor' };
    }
    if (process.env.TURNSTILE_DEV_BYPASS_WARN !== 'false') {
      console.warn('[turnstile] TURNSTILE_SECRET_KEY ausente — bypass em desenvolvimento');
    }
    return { ok: true };
  }

  if (!token || typeof token !== 'string' || token.trim().length < 10) {
    return { ok: false, error: 'Token Turnstile ausente ou inválido' };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) body.set('remoteip', remoteIp);

  const res = await fetch(SITEVERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = (await res.json().catch(() => ({}))) as { success?: boolean; 'error-codes'?: string[] };
  if (!json.success) {
    const codes = json['error-codes']?.join(', ') || 'verificação falhou';
    return { ok: false, error: codes };
  }

  return { ok: true };
}

module.exports = { verificarTurnstile };
