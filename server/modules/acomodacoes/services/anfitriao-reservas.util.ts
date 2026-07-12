import { listDiariasEstadia } from './disponibilidade-reserva.hook';

export const OBSERVACAO_RESERVADO = 'reservado';
export const OBSERVACAO_BLOQUEADO = 'bloqueado';

export type CalendarioDiaEstado = 'livre' | 'bloqueado' | 'reservado';

export interface EstadiaPropostaMeta {
  acomodacaoId: number;
  checkIn: string;
  checkOut: string;
}

export interface ReservaAnfitriaoItem {
  propostaId: number;
  codigo: string | null;
  titulo: string;
  status: string;
  acomodacaoId: number;
  checkIn: string;
  checkOut: string;
  valorTotal: string;
  clienteNome: string;
  clienteEmail: string | null;
  clienteTelefone: string | null;
  aceitoEm: string | null;
}

export interface CalendarioDiaItem {
  data: string;
  estado: CalendarioDiaEstado;
  disponivel: boolean;
  precoOverride: string | null;
  observacao: string | null;
  readOnly: boolean;
}

export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0) return '***';
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const visible = local.slice(0, Math.min(1, local.length));
  return `${visible}***@${domain}`;
}

export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `***${digits.slice(-4)}`;
}

export function parseEstadiaFromMetadata(raw: unknown): EstadiaPropostaMeta | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const meta = raw as Record<string, unknown>;
  const acomodacaoId = Number(meta.acomodacaoId ?? meta.selectedAcomodacaoId ?? 0);
  const checkIn = String(meta.checkIn ?? meta.checkin ?? '').slice(0, 10);
  const checkOut = String(meta.checkOut ?? meta.checkout ?? '').slice(0, 10);
  if (!Number.isFinite(acomodacaoId) || acomodacaoId <= 0 || !checkIn || !checkOut) return null;
  return { acomodacaoId, checkIn, checkOut };
}

export function enumerateDatesInclusive(de: string, ate: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${de}T12:00:00.000Z`);
  const end = new Date(`${ate}T12:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return dates;
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function estadiaSobrepoePeriodo(checkIn: string, checkOut: string, de: string, ate: string): boolean {
  return checkIn <= ate && checkOut > de;
}

export function buildReservedDateSet(reservas: Array<{ checkIn: string; checkOut: string }>): Set<string> {
  const set = new Set<string>();
  for (const r of reservas) {
    for (const data of listDiariasEstadia(r.checkIn, r.checkOut)) {
      set.add(data);
    }
  }
  return set;
}

export function deriveCalendarioEstado(
  data: string,
  row: { disponivel: boolean | null; observacao: string | null } | undefined,
  reservedDates: Set<string>,
): CalendarioDiaEstado {
  if (row?.observacao === OBSERVACAO_RESERVADO || reservedDates.has(data)) {
    return 'reservado';
  }
  if (row && row.disponivel === false) {
    return 'bloqueado';
  }
  return 'livre';
}

export function isDiaReservadoProtegido(
  existente: { disponivel: boolean | null; observacao: string | null } | undefined,
  dia: { disponivel: boolean; observacao?: string },
): boolean {
  if (!existente) return false;
  if (existente.observacao === OBSERVACAO_RESERVADO) {
    if (dia.disponivel) return true;
    if (dia.observacao != null && dia.observacao !== OBSERVACAO_RESERVADO) return true;
  }
  return false;
}
