import {
  mapBatchToRows,
  roteiroAnalyticsBatchSchema,
} from '../../../../server/modules/roteiro-analytics/schemas/roteiro-analytics.schema';
import {
  nextScrollDepthMilestone,
  shouldCollectRoteiroAnalytics,
} from '../../../../apps/site-publico/lib/analytics/roteiro-analytics';

describe('roteiro-analytics schema (PR 24)', () => {
  it('rejeita scroll_pct > 100 e event_type inválido', () => {
    expect(() =>
      roteiroAnalyticsBatchSchema.parse({
        session_id: 'sess-1',
        events: [{ event_type: 'hero_view', scroll_pct: 101 }],
      }),
    ).toThrow();

    expect(() =>
      roteiroAnalyticsBatchSchema.parse({
        session_id: 'sess-1',
        events: [{ event_type: 'invalid_event' }],
      }),
    ).toThrow();
  });

  it('rejeita lote com mais de 50 eventos', () => {
    const events = Array.from({ length: 51 }, () => ({ event_type: 'hero_view' as const }));
    expect(() =>
      roteiroAnalyticsBatchSchema.parse({ session_id: 'sess-1', events }),
    ).toThrow();
  });

  it('bulk insert monta N rows a partir de 1 lote', () => {
    const batch = roteiroAnalyticsBatchSchema.parse({
      session_id: 'sess-abc',
      events: [
        { event_type: 'hero_view', section: 'hero' },
        { event_type: 'scroll_depth', scroll_pct: 50 },
        { event_type: 'section_dwell', section: 'timeline', value_ms: 3200 },
      ],
    });

    const rows = mapBatchToRows('rt-token', batch);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      propostaToken: 'rt-token',
      sessionId: 'sess-abc',
      eventType: 'hero_view',
      section: 'hero',
    });
    expect(rows[1].scrollPct).toBe(50);
    expect(rows[2].valueMs).toBe(3200);
  });
});

describe('roteiro-analytics client policy (PR 24)', () => {
  it('doNotTrack impede coleta', () => {
    expect(shouldCollectRoteiroAnalytics({ doNotTrack: '1' }, null)).toBe(false);
    expect(shouldCollectRoteiroAnalytics({ doNotTrack: '0' }, null)).toBe(true);
  });

  it('scroll milestones em 25/50/75/100', () => {
    expect(nextScrollDepthMilestone(0, 10)).toBeNull();
    expect(nextScrollDepthMilestone(0, 30)).toBe(25);
    expect(nextScrollDepthMilestone(25, 55)).toBe(50);
    expect(nextScrollDepthMilestone(75, 100)).toBe(100);
  });
});
