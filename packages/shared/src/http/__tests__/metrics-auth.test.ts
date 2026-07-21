import { isMetricsBearerAuthorized, getMetricsToken } from '../metrics-auth';

describe('metrics-auth (PR-05b)', () => {
  it('denies when METRICS_TOKEN unset (fail-closed)', () => {
    expect(isMetricsBearerAuthorized('Bearer secret', {})).toBe(false);
    expect(getMetricsToken({})).toBeUndefined();
  });

  it('accepts matching Bearer token', () => {
    const env = { METRICS_TOKEN: 'test-metrics-token-32chars-xx' };
    expect(
      isMetricsBearerAuthorized('Bearer test-metrics-token-32chars-xx', env),
    ).toBe(true);
  });

  it('rejects wrong / missing / non-bearer auth', () => {
    const env = { METRICS_TOKEN: 'test-metrics-token-32chars-xx' };
    expect(isMetricsBearerAuthorized(undefined, env)).toBe(false);
    expect(isMetricsBearerAuthorized('Bearer wrong', env)).toBe(false);
    expect(isMetricsBearerAuthorized('Basic abc', env)).toBe(false);
  });
});
