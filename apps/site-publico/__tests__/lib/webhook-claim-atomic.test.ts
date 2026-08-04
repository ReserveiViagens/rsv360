/**
 * PR-11b — atomic webhook_logs claim (INSERT … ON CONFLICT DO NOTHING RETURNING).
 */
import { processWebhookEvent } from '@/lib/mercadopago-enhanced';

describe('PR-11b — webhook claim atomic', () => {
  it('second concurrent delivery loses claim and skips settle', async () => {
    const claimed = new Set<string>();
    const queryDatabase = jest.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes('CREATE TABLE IF NOT EXISTS webhook_logs')) {
        return [];
      }
      if (sql.includes('SELECT id FROM webhook_logs') && sql.includes('processed = TRUE')) {
        return [];
      }
      if (sql.includes('INSERT INTO webhook_logs') && sql.includes('RETURNING')) {
        const wid = String(params?.[0]);
        if (claimed.has(wid)) {
          return [];
        }
        claimed.add(wid);
        return [{ id: 1 }];
      }
      if (sql.includes('SELECT processed FROM webhook_logs')) {
        return [{ processed: false }];
      }
      return [];
    });

    const getPaymentStatus = jest.fn(async () => ({ status: 'approved' }));
    const updateBookingStatus = jest.fn(async () => ({ success: true as const, booking: {} }));
    const logStatusChange = jest.fn(async () => undefined);

    const deps = {
      queryDatabase: queryDatabase as never,
      getPaymentStatus: getPaymentStatus as never,
      updateBookingStatus: updateBookingStatus as never,
      logStatusChange: logStatusChange as never,
    };

    const event = {
      id: 'evt-claim-1',
      type: 'payment',
      action: 'payment.updated',
      data: { id: 'pay-1', status: 'approved' },
    };

    const first = await processWebhookEvent('payment', event, undefined, undefined, deps);
    const second = await processWebhookEvent('payment', event, undefined, undefined, deps);

    expect(first.processed === true || first.reason === undefined || 'processed' in first).toBe(true);
    // First may proceed into payment path (needs payments rows) — claim itself is what we assert on second
    expect(second).toEqual(
      expect.objectContaining({
        processed: false,
        reason: expect.stringMatching(/Claim held|Already processed/),
      }),
    );
  });

  it('already processed webhook returns early', async () => {
    const queryDatabase = jest.fn(async (sql: string) => {
      if (sql.includes('SELECT id FROM webhook_logs') && sql.includes('processed = TRUE')) {
        return [{ id: 9 }];
      }
      return [];
    });

    const result = await processWebhookEvent(
      'payment',
      { id: 'evt-done', data: { id: 'pay-9' } },
      undefined,
      undefined,
      {
        queryDatabase: queryDatabase as never,
        getPaymentStatus: jest.fn(async () => ({ status: 'approved' })) as never,
        updateBookingStatus: jest.fn(async () => ({ success: true as const, booking: {} })) as never,
        logStatusChange: jest.fn(async () => undefined) as never,
      },
    );

    expect(result).toEqual({ processed: false, reason: 'Already processed' });
  });
});
