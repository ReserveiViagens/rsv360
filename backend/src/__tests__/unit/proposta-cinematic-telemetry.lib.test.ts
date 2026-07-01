import {
  buildCinematicFlushPayload,
  detectNewScrollMilestones,
  nextActiveMs,
  propostaCinematicEventosUrl,
  sendEngagementBeacon,
  urgencyLoadingClockClass,
} from '../../../../apps/site-publico/lib/proposta-cinematic-telemetry';

describe('proposta-cinematic-telemetry (lib)', () => {
  describe('detectNewScrollMilestones', () => {
    it('dispara cada marco 25/50/75/100 apenas uma vez', () => {
      const fired = new Set<number>();
      const at30 = detectNewScrollMilestones(30, fired);
      at30.forEach((m) => fired.add(m));
      const at80 = detectNewScrollMilestones(80, fired);
      at80.forEach((m) => fired.add(m));
      const at100 = detectNewScrollMilestones(100, fired);
      at100.forEach((m) => fired.add(m));

      expect(at30).toEqual([25]);
      expect(at80).toEqual([50, 75]);
      expect(at100).toEqual([100]);
      expect(detectNewScrollMilestones(100, fired)).toEqual([]);
    });
  });

  describe('nextActiveMs', () => {
    it('não acumula tempo quando aba está hidden', () => {
      const first = nextActiveMs(true, 1000, 6000, 0);
      expect(first.activeMs).toBe(5000);

      const hidden = nextActiveMs(false, first.lastTick, 20_000, first.activeMs);
      expect(hidden.activeMs).toBe(5000);
    });
  });

  describe('urgencyLoadingClockClass', () => {
    it('remove animate-pulse com prefers-reduced-motion', () => {
      expect(urgencyLoadingClockClass(true)).not.toContain('animate-pulse');
      expect(urgencyLoadingClockClass(false)).toContain('animate-pulse');
    });
  });

  describe('buildCinematicFlushPayload', () => {
    it('monta payload com tempo e scroll', () => {
      expect(
        buildCinematicFlushPayload({
          sessionId: 'uuid-1',
          activeMs: 42_500,
          maxScrollPct: 67,
          marcosToSend: [25, 50],
        }),
      ).toEqual({
        session_id: 'uuid-1',
        tempo_pagina_segundos: 43,
        scroll: { percentual_max: 67, marcos: [25, 50] },
      });
    });
  });

  it('monta URL do BFF de eventos', () => {
    expect(propostaCinematicEventosUrl('rt-abc')).toBe('/api/propostas/rt-abc/eventos');
  });

  it('envia via sendBeacon quando disponível', () => {
    const beacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(global, 'window', { configurable: true, value: global });
    Object.defineProperty(global.navigator, 'sendBeacon', {
      configurable: true,
      value: beacon,
    });

    sendEngagementBeacon('/api/propostas/rt-1/eventos', {
      session_id: 's1',
      tempo_pagina_segundos: 5,
    });

    expect(beacon).toHaveBeenCalled();
  });
});
