const { trustedProxyAllowlist } = require('../../../app');

describe('trustedProxyAllowlist (PR-10c-infra)', () => {
  it('trusts only loopback when no edge allowlist is configured', () => {
    expect(trustedProxyAllowlist({})).toEqual(['loopback']);
  });

  it('parses explicit proxy names and CIDRs', () => {
    expect(
      trustedProxyAllowlist({
        TRUST_PROXY: 'loopback, 10.20.0.0/16, 2001:db8::/32',
      }),
    ).toEqual(['loopback', '10.20.0.0/16', '2001:db8::/32']);
  });
});
