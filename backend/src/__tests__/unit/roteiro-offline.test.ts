import {
  buildRoteiroPrecacheUrls,
  isAllowedOfflineApiGet,
  isBlockedOfflineApiPath,
  ROTEIRO_SW_PATH,
  ROTEIRO_SW_SCOPE,
} from '../../../../apps/site-publico/lib/roteiro-offline/policies';
import {
  buildQrImageUrl,
  calcQrCacheExpMs,
  isQrCacheExpired,
} from '../../../../apps/site-publico/lib/roteiro-offline/qr-exp';

describe('roteiro-offline policies (PR 22)', () => {
  it('SW registra no escopo /roteiro/', () => {
    expect(ROTEIRO_SW_PATH).toBe('/roteiro/sw.js');
    expect(ROTEIRO_SW_SCOPE).toBe('/roteiro/');
  });

  it('permite GET de roteiro-dados e QR; bloqueia gerar-proposta e turnstile', () => {
    expect(isAllowedOfflineApiGet('/api/cotacao/roteiro/rt-abc')).toBe(true);
    expect(isAllowedOfflineApiGet('/api/propostas/rt-abc/vouchers/hotel/qr.png')).toBe(true);
    expect(isBlockedOfflineApiPath('/api/cotacao/gerar-proposta')).toBe(true);
    expect(isBlockedOfflineApiPath('/api/foo/turnstile/verify')).toBe(true);
    expect(isAllowedOfflineApiGet('/api/cotacao/gerar-proposta')).toBe(false);
  });

  it('precache inclui roteiro + 3 QRs com exp', () => {
    const urls = buildRoteiroPrecacheUrls('rt-test', '2026-08-05');
    expect(urls).toHaveLength(5);
    expect(urls[0]).toContain('/api/cotacao/roteiro/rt-test');
    expect(urls[2]).toMatch(/qr\.png\?exp=\d+/);
  });
});

describe('roteiro-offline qr-exp (PR 22)', () => {
  it('exp do QR deriva do check-out + 24h', () => {
    const exp = calcQrCacheExpMs('2026-08-05');
    expect(isQrCacheExpired(exp, exp - 1)).toBe(false);
    expect(isQrCacheExpired(exp, exp + 1)).toBe(true);
  });

  it('buildQrImageUrl inclui parâmetro exp', () => {
    const url = buildQrImageUrl('rt-x', 'hotel', '2026-08-05');
    expect(url).toContain('/vouchers/hotel/qr.png?exp=');
  });
});
