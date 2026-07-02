import { getFase1BackendBaseUrl } from '@/lib/fase1-bff';

export type RoteiroPontoTipo =
  | 'hospedagem'
  | 'parque'
  | 'restaurante'
  | 'atracao'
  | 'ponto_dia';

export interface RoteiroPonto {
  id: number;
  tipo: RoteiroPontoTipo | string;
  titulo: string;
  descricao: string | null;
  lat: number;
  lng: number;
  dia: number | null;
  ordem: number | null;
}

export interface RoteiroBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface RoteiroPontosData {
  pontos: RoteiroPonto[];
  bounds: RoteiroBounds | null;
}

export type FetchRoteiroPontosResult =
  | { ok: true; data: RoteiroPontosData }
  | { ok: false; reason: 'not_found' | 'denied' | 'error' };

export async function fetchRoteiroPontos(token: string): Promise<FetchRoteiroPontosResult> {
  const backend = getFase1BackendBaseUrl();
  const res = await fetch(
    `${backend}/api/v1/roteiro/${encodeURIComponent(token)}/pontos`,
    { cache: 'no-store' },
  );

  if (res.status === 403) return { ok: false, reason: 'denied' };
  if (res.status === 404) return { ok: false, reason: 'not_found' };
  if (!res.ok) return { ok: false, reason: 'error' };

  const json = await res.json().catch(() => ({}));
  const data = json?.data as RoteiroPontosData | undefined;
  if (!data || !Array.isArray(data.pontos)) {
    return { ok: false, reason: 'error' };
  }

  return { ok: true, data };
}
