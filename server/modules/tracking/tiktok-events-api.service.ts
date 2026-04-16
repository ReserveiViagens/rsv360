type TrackingPayload = {
  eventName: string;
  eventId: string;
  data?: Record<string, unknown>;
  pageUrl?: string | null;
  userAgent?: string | null;
  propertyId?: number;
};

export async function sendTikTokServerEvent(payload: TrackingPayload) {
  const pixelId = process.env.TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!pixelId || !accessToken || typeof fetch !== 'function') {
    return { skipped: true, reason: 'tiktok-config-missing' };
  }

  const endpoint = process.env.TIKTOK_EVENTS_API_URL ||
    'https://business-api.tiktok.com/open_api/v1.3/event/track/';

  const body = {
    pixel_code: pixelId,
    event: payload.eventName,
    event_id: payload.eventId,
    timestamp: Math.floor(Date.now() / 1000),
    context: {
      page: {
        url: payload.pageUrl || 'https://www.reserveiviagens.com.br',
      },
      user_agent: payload.userAgent || undefined,
    },
    properties: payload.data || {},
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    console.warn('[TIKTOK-API] Falha ao enviar evento:', error instanceof Error ? error.message : String(error));
    return { ok: false };
  }
}
