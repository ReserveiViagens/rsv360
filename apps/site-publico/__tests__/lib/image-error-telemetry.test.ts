/**
 * PR-001c — unit tests for ImageError / ImageRecovered dedup + metrics.
 */

import {
  IMAGE_ERROR_EVENT,
  IMAGE_RECOVERED_EVENT,
  IMAGE_SENTINEL_EVENT,
  __resetImageTelemetryForTests,
  buildLoadAttemptKey,
  detectBrowser,
  getImageTelemetrySessionMetrics,
  reportImageError,
  reportImagePermanentFailure,
  reportImageRecovered,
  reportImageTelemetrySentinel,
} from '@/lib/image-error-telemetry';

describe('image-error-telemetry (PR-001c)', () => {
  const emitted: Array<{ name: string; payload: Record<string, unknown> }> = [];

  beforeEach(() => {
    emitted.length = 0;
    __resetImageTelemetryForTests({
      emit: async (name, payload) => {
        emitted.push({ name, payload });
      },
    });
  });

  afterEach(() => {
    __resetImageTelemetryForTests({ emit: null });
  });

  it('detectBrowser maps common UAs', () => {
    expect(detectBrowser('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36')).toBe(
      'chrome',
    );
    expect(detectBrowser('Mozilla/5.0 Edg/120.0.0.0')).toBe('edge');
    expect(
      detectBrowser(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15 Version/17 Safari/605.1.15',
      ),
    ).toBe('safari');
  });

  it('emits ImageError once per load attempt (no duplication)', async () => {
    const key = buildLoadAttemptKey({
      component_name: 'TicketProductCard',
      url: '/images/hot-park.jpeg',
      attempt_id: 'a1',
    });
    const ctx = {
      url: '/images/hot-park.jpeg',
      component_name: 'TicketProductCard',
      parque_id: 'hot-park',
      ingresso_id: 'hot-park',
      page_route: '/ingressos',
    };

    expect(await reportImageError(key, ctx)).toBe(true);
    expect(await reportImageError(key, ctx)).toBe(false);
    expect(emitted.filter((e) => e.name === IMAGE_ERROR_EVENT)).toHaveLength(1);
    expect(emitted[0].payload).toMatchObject({
      url: '/images/hot-park.jpeg',
      component_name: 'TicketProductCard',
      parque_id: 'hot-park',
      ingresso_id: 'hot-park',
      page_route: '/ingressos',
    });
    expect(emitted[0].payload.release_version).toBeTruthy();
  });

  it('emits ImageRecovered once with efficacy metrics after ImageError', async () => {
    const key = buildLoadAttemptKey({
      component_name: 'ImageWithFallback',
      url: 'https://cdn.example/broken.jpg',
      attempt_id: 'b2',
    });
    const ctx = {
      url: 'https://cdn.example/broken.jpg',
      component_name: 'ImageWithFallback',
      page_route: '/ingressos',
    };

    await reportImageError(key, ctx);
    expect(await reportImageRecovered(key, { ...ctx, url: '/fallback.svg' })).toBe(
      true,
    );
    expect(await reportImageRecovered(key, ctx)).toBe(false);

    const recovered = emitted.filter((e) => e.name === IMAGE_RECOVERED_EVENT);
    expect(recovered).toHaveLength(1);
    expect(recovered[0].payload).toMatchObject({
      falhas_totais: 1,
      pct_recuperacao_automatica: 100,
      falhas_permanentes: 0,
    });
    expect(typeof recovered[0].payload.tempo_medio_recuperacao_ms).toBe(
      'number',
    );
  });

  it('does not emit ImageRecovered without prior ImageError', async () => {
    const key = buildLoadAttemptKey({
      component_name: 'TicketProductCard',
      url: '/ok.jpg',
      attempt_id: 'c3',
    });
    expect(
      await reportImageRecovered(key, {
        url: '/ok.jpg',
        component_name: 'TicketProductCard',
      }),
    ).toBe(false);
    expect(emitted).toHaveLength(0);
  });

  it('tracks permanent failures in session metrics', async () => {
    const key = buildLoadAttemptKey({
      component_name: 'ImageWithFallback',
      url: '/gone.jpg',
      attempt_id: 'd4',
    });
    await reportImagePermanentFailure(key, {
      url: '/gone.jpg',
      component_name: 'ImageWithFallback',
    });
    const m = getImageTelemetrySessionMetrics();
    expect(m.falhas_totais).toBeGreaterThanOrEqual(1);
    expect(m.falhas_permanentes).toBe(1);
  });

  it('emits sentinel heartbeat payload', async () => {
    await reportImageTelemetrySentinel({ sequence: 7, expected_interval_ms: 60_000 });
    expect(emitted).toHaveLength(1);
    expect(emitted[0].name).toBe(IMAGE_SENTINEL_EVENT);
    expect(emitted[0].payload).toMatchObject({
      sequence: 7,
      expected_interval_ms: 60_000,
    });
  });

  it('strips query string and fragment from url/page_route before emit', async () => {
    const { sanitizeUrlForTelemetry } = await import('@/lib/image-error-telemetry');
    expect(
      sanitizeUrlForTelemetry(
        'https://cdn.example/img.jpg?token=rt-secret&x=1#frag',
      ),
    ).toBe('https://cdn.example/img.jpg');
    expect(
      sanitizeUrlForTelemetry('/proposta/abc?token=rt-leak#top'),
    ).toBe('/proposta/abc');

    const key = buildLoadAttemptKey({
      component_name: 'TicketProductCard',
      url: '/images/x.jpeg?sig=rt-abc',
      attempt_id: 'e5',
    });
    expect(key).not.toContain('sig=');
    expect(key).toContain('/images/x.jpeg');

    await reportImageError(key, {
      url: 'https://example.com/park.jpg?token=rt-capability-leak',
      component_name: 'TicketProductCard',
      page_route: '/proposta/1?token=rt-capability-leak',
    });
    expect(emitted[0].payload.url).toBe('https://example.com/park.jpg');
    expect(emitted[0].payload.page_route).toBe('/proposta/1');
    expect(JSON.stringify(emitted[0].payload)).not.toMatch(/rt-capability|token=/);
  });
});
