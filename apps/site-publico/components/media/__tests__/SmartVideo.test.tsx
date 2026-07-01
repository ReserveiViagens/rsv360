import { render, screen } from '@testing-library/react';
import { SmartVideo } from '../SmartVideo';

describe('SmartVideo (PR 23)', () => {
  const originalConnection = (navigator as Navigator & { connection?: unknown }).connection;

  afterEach(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: originalConnection,
    });
  });

  it('data-saver: renderiza só poster, sem <source>', () => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, downlink: 10 },
    });
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    render(
      <SmartVideo
        srcMp4="https://cdn.example.com/hero.mp4"
        poster="https://cdn.example.com/hero.webp"
        background
      />,
    );

    expect(document.querySelector('img')?.getAttribute('src')).toBe('https://cdn.example.com/hero.webp');
    expect(document.querySelector('video source')).toBeNull();
  });

  it('fora do viewport não injeta sources até IntersectionObserver', () => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, downlink: 10 },
    });
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    render(
      <SmartVideo
        srcMp4="https://cdn.example.com/clip.mp4"
        srcWebm="https://cdn.example.com/clip.webm"
        poster="https://cdn.example.com/poster.webp"
      />,
    );

    expect(document.querySelector('video source')).toBeNull();
  });
});
