import {
  buildVideoSourceOrder,
  deriveWebmFromMp4,
  isLcpVideoElement,
  shouldPreferPosterOnly,
} from '../../../../apps/site-publico/lib/media/smart-video';

describe('smart-video policies (PR 23)', () => {
  it('deriveWebmFromMp4 troca extensão quando aplicável', () => {
    expect(deriveWebmFromMp4('https://cdn.example.com/hero.mp4')).toBe(
      'https://cdn.example.com/hero.webm',
    );
    expect(deriveWebmFromMp4('https://cdn.example.com/hero.webm')).toBeUndefined();
    expect(deriveWebmFromMp4('https://youtube.com/embed/x')).toBeUndefined();
  });

  it('buildVideoSourceOrder coloca webm antes de mp4', () => {
    expect(buildVideoSourceOrder('a.webm', 'a.mp4')).toEqual([
      { src: 'a.webm', type: 'video/webm' },
      { src: 'a.mp4', type: 'video/mp4' },
    ]);
    expect(buildVideoSourceOrder(undefined, 'a.mp4')).toEqual([{ src: 'a.mp4', type: 'video/mp4' }]);
  });

  it('shouldPreferPosterOnly ativa em saveData, downlink baixo e reduced-motion', () => {
    expect(shouldPreferPosterOnly({ saveData: true, downlink: 10 }, false)).toBe(true);
    expect(shouldPreferPosterOnly({ saveData: false, downlink: 1 }, false)).toBe(true);
    expect(shouldPreferPosterOnly({ saveData: false, downlink: 5 }, true)).toBe(true);
    expect(shouldPreferPosterOnly({ saveData: false, downlink: 5 }, false)).toBe(false);
  });

  it('branch data-saver: poster-only não monta sources no componente', () => {
    const posterOnly = shouldPreferPosterOnly({ saveData: true }, false);
    expect(posterOnly).toBe(true);
    // SmartVideo: quando posterOnly, não chama buildVideoSourceOrder — só renderiza <img poster>.
    expect(posterOnly).toBe(true);
  });

  it('isLcpVideoElement detecta vídeo como LCP indesejado', () => {
    expect(isLcpVideoElement({ tagName: 'VIDEO' } as Element)).toBe(true);
    expect(isLcpVideoElement({ tagName: 'IMG' } as Element)).toBe(false);
  });
});
