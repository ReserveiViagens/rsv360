/**
 * PR-10c-a2 — DPoP shared helpers (htu mapping + fail-soft).
 */
import { resolveDpopHtu, stripQueryAndFragment, tryCreateDpopProof } from '../dpop';

describe('dpop helpers (PR-10c-a2)', () => {
  it('stripQueryAndFragment removes query and hash', () => {
    expect(stripQueryAndFragment('https://api.example/x?a=1#h')).toBe('https://api.example/x');
  });

  it('resolveDpopHtu maps site-publico BFF auth path to upstream AS URL', () => {
    expect(
      resolveDpopHtu('/api/auth/login', {
        baseUrl: 'https://site.example',
        upstreamAuthBase: 'https://api.example',
      }),
    ).toBe('https://api.example/api/v1/auth/login');

    expect(
      resolveDpopHtu('/api/auth/refresh?x=1', {
        baseUrl: 'https://site.example',
        upstreamAuthBase: 'http://localhost:3002',
      }),
    ).toBe('http://localhost:3002/api/v1/auth/refresh');
  });

  it('resolveDpopHtu keeps absolute non-BFF URLs', () => {
    expect(
      resolveDpopHtu('https://api.example/api/v1/auth/session', {
        upstreamAuthBase: 'https://api.example',
      }),
    ).toBe('https://api.example/api/v1/auth/session');
  });

  it('tryCreateDpopProof returns null outside browser', async () => {
    await expect(
      tryCreateDpopProof({ method: 'POST', url: 'https://api.example/api/v1/auth/login' }),
    ).resolves.toBeNull();
  });
});
