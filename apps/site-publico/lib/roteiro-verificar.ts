import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';

export interface RoteiroVerificacaoData {
  autentico: boolean;
  token: string;
  titulo: string;
  destino: string;
  status: string;
  emitidoEm?: string | null;
  clienteNome?: string;
  roteiroUrl: string;
}

export async function fetchRoteiroVerificacao(
  token: string,
): Promise<RoteiroVerificacaoData | null> {
  const backend = getFase1BackendBaseUrl();
  const res = await fetch(
    `${backend}/api/v1/cotacao-publica/roteiro/${encodeURIComponent(token)}/verificar`,
    { cache: 'no-store' },
  );
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  return (json?.data as RoteiroVerificacaoData) ?? null;
}
