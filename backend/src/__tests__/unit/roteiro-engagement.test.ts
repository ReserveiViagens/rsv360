import {
  buildRoteiroEngagementPayload,
  computeScrollDepthPct,
  roteiroEngagementUrl,
  shouldAutoplayCinematicVideo,
} from '../../../../apps/site-publico/lib/roteiro-engagement';

describe('roteiro-engagement', () => {
  describe('computeScrollDepthPct', () => {
    it('retorna 0 no topo e 100 no fim', () => {
      expect(computeScrollDepthPct(0, 2000, 800)).toBe(0);
      expect(computeScrollDepthPct(1200, 2000, 800)).toBe(100);
    });

    it('retorna 100 quando não há scroll possível', () => {
      expect(computeScrollDepthPct(0, 600, 800)).toBe(100);
    });

    it('arredonda porcentagem intermediária', () => {
      expect(computeScrollDepthPct(600, 2000, 800)).toBe(50);
    });
  });

  describe('buildRoteiroEngagementPayload', () => {
    it('normaliza tempo e scroll depth', () => {
      expect(buildRoteiroEngagementPayload(-10, 150)).toEqual({
        tempoMs: 0,
        scrollDepthPct: 100,
      });
    });
  });

  describe('roteiroEngagementUrl', () => {
    it('monta rota BFF do evento cinematic', () => {
      expect(roteiroEngagementUrl('rt-abc')).toBe('/api/cotacao/roteiro/rt-abc/evento');
    });
  });

  describe('shouldAutoplayCinematicVideo', () => {
    it('autoplay só com vídeo e sem prefers-reduced-motion', () => {
      expect(shouldAutoplayCinematicVideo('https://cdn/video.mp4', false)).toBe(true);
      expect(shouldAutoplayCinematicVideo('https://cdn/video.mp4', true)).toBe(false);
      expect(shouldAutoplayCinematicVideo(undefined, false)).toBe(false);
    });
  });
});
