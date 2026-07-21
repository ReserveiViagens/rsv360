/**
 * Client redirect / back_urls must never settle a payment from query params
 * (e.g. ?status=approved). Settlement requires a signed webhook or a
 * server-side lookup against the Mercado Pago API.
 */

export type RedirectQuerySettleResult = {
  settled: false;
  reason: 'redirect_query_forbidden';
};

export type MpApiSettleResult = {
  settled: boolean;
  status: string;
  source: 'mp_api';
};

/** Always refuses settlement from adulterated/trusted-looking redirect query. */
export function settleFromRedirectQuery(
  _query: Record<string, string | string[] | undefined>,
): RedirectQuerySettleResult {
  return { settled: false, reason: 'redirect_query_forbidden' };
}

/** Settle only after authoritative status from MP Payments API (server-side). */
export async function settleFromMpApiLookup(
  paymentId: string,
  fetchPayment: (id: string) => Promise<{ status: string }>,
): Promise<MpApiSettleResult> {
  const payment = await fetchPayment(paymentId);
  return {
    settled: payment.status === 'approved',
    status: payment.status,
    source: 'mp_api',
  };
}
