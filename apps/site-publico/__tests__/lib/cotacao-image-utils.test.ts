import { describe, expect, it } from '@jest/globals';
import {
  normalizeImageList,
  resolveAbsoluteMediaUrl,
  resolvePublicMediaList,
  resolvePublicMediaUrl,
} from '@/lib/cotacao-image-utils';

describe('cotacao-image-utils', () => {
  it('normalizeImageList splits space-separated URLs', () => {
    expect(normalizeImageList('/a.jpg /b.jpg')).toEqual(['/a.jpg', '/b.jpg']);
  });

  it('resolvePublicMediaUrl keeps /uploads relative (rewrite server-side)', () => {
    expect(resolvePublicMediaUrl('/uploads/hoteis/atrium-thermas.jpg')).toBe(
      '/uploads/hoteis/atrium-thermas.jpg',
    );
  });

  it('resolvePublicMediaUrl normalizes uploads/ without leading slash', () => {
    expect(resolvePublicMediaUrl('uploads/hoteis/foo.jpg')).toBe('/uploads/hoteis/foo.jpg');
  });

  it('resolvePublicMediaUrl passes through absolute URLs', () => {
    const unsplash = 'https://images.unsplash.com/photo-1?w=800';
    expect(resolvePublicMediaUrl(unsplash)).toBe(unsplash);
  });

  it('resolvePublicMediaList maps all items', () => {
    expect(
      resolvePublicMediaList(['/uploads/hoteis/a.jpg', 'https://cdn.example/x.png']),
    ).toEqual(['/uploads/hoteis/a.jpg', 'https://cdn.example/x.png']);
  });

  it('resolveAbsoluteMediaUrl prefixes /uploads with API base', () => {
    const prev = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    try {
      expect(resolveAbsoluteMediaUrl('/uploads/hoteis/a.jpg')).toBe(
        'https://api.example.com/uploads/hoteis/a.jpg',
      );
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_API_URL;
      else process.env.NEXT_PUBLIC_API_URL = prev;
    }
  });
});
