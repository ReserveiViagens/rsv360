import crypto from 'crypto';

type TrackingPayload = {
  eventName: string;
  eventId: string;
  data?: Record<string, unknown>;
  pageUrl?: string | null;
  userAgent?: string | null;
  propertyId?: number;
};

export function hashForMeta(value: string) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export async function sendMetaServerEvent(payload: TrackingPayload) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken || typeof fetch !== 'function') {
    return { skipped: true, reason: 'meta-config-missing' };
  }

  const event = {
    event_name: payload.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: payload.pageUrl || 'https://www.reserveiviagens.com.br',
    event_id: payload.eventId,
    user_data: {
      client_user_agent: payload.userAgent || undefined,
      em: payload.data?.email && typeof payload.data.email === 'string' ? [hashForMeta(payload.data.email)] : undefined,
      ph: payload.data?.phone && typeof payload.data.phone === 'string' ? [hashForMeta(payload.data.phone)] : undefined,
    },
    custom_data: payload.data || {},
  };

  const endpoint = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [event] }),
    });

    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    console.warn('[META-CAPI] Falha ao enviar evento:', error instanceof Error ? error.message : String(error));
    return { ok: false };
  }
}
