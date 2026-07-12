import { listDiariasEstadia } from './disponibilidade-reserva.hook';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const WIZARD_TIMEZONE = 'America/Sao_Paulo';

export interface PeriodoEstadiaInput {
  checkIn: string;
  checkOut: string;
}

export interface DisponibilidadeDiaRow {
  disponivel: boolean;
  observacao: string | null;
}

export function isDataCalendarioValida(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/** Diárias da estadia no fuso comercial do wizard (D5). */
export function listarDiariasPeriodoWizard(checkIn: string, checkOut: string): string[] {
  return listDiariasEstadia(checkIn, checkOut);
}

export function parsePeriodoEstadiaOpcional(
  checkInRaw?: string,
  checkOutRaw?: string,
): PeriodoEstadiaInput | null | { error: string } {
  const checkIn = checkInRaw?.trim();
  const checkOut = checkOutRaw?.trim();
  if (!checkIn && !checkOut) return null;
  if (!checkIn || !checkOut) {
    return { error: 'checkIn e checkOut devem ser informados juntos (YYYY-MM-DD)' };
  }
  if (!isDataCalendarioValida(checkIn) || !isDataCalendarioValida(checkOut)) {
    return { error: 'checkIn e checkOut devem estar no formato YYYY-MM-DD' };
  }
  if (checkOut <= checkIn) {
    return { error: 'checkOut deve ser posterior a checkIn' };
  }
  return { checkIn, checkOut };
}

export function isDiaIndisponivelCalendario(row: DisponibilidadeDiaRow | undefined): boolean {
  if (!row) return false;
  if (row.observacao === 'reservado' || row.observacao === 'bloqueado') return true;
  return row.disponivel === false;
}

/**
 * Unidade elegível quando nenhuma diária do período está bloqueada/reservada.
 * Tabela vazia para a unidade = todas as diárias livres.
 */
export function filtrarIdsAcomodacaoCalendarioLivre(
  candidateIds: number[],
  diarias: string[],
  rows: Array<{ acomodacaoId: number; data: string; disponivel: boolean; observacao: string | null }>,
): number[] {
  if (candidateIds.length === 0 || diarias.length === 0) return candidateIds;

  const diariaSet = new Set(diarias);
  const indisponivelPorUnidade = new Set<number>();

  for (const row of rows) {
    if (!diariaSet.has(String(row.data).slice(0, 10))) continue;
    if (isDiaIndisponivelCalendario(row)) {
      indisponivelPorUnidade.add(row.acomodacaoId);
    }
  }

  return candidateIds.filter((id) => !indisponivelPorUnidade.has(id));
}
