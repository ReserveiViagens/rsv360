import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';

export interface VoucherVerificacaoData {
  valido: boolean;
  hospede: string;
  unidade: string | null;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  titulo: string;
  voucherSlug: string;
  validadoEm: string;
}

export async function fetchVoucherVerificacao(
  qrToken: string,
): Promise<{ ok: true; data: VoucherVerificacaoData } | { ok: false; error: string }> {
  const backend = getFase1BackendBaseUrl();
  const res = await fetch(
    `${backend}/api/v1/vouchers/verificar/${encodeURIComponent(qrToken)}`,
    { cache: 'no-store' },
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    return { ok: false, error: (json.error as string) ?? 'Voucher inválido' };
  }
  return { ok: true, data: json.data as VoucherVerificacaoData };
}
