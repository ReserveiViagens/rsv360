import { OBSERVACAO_BLOQUEADO, OBSERVACAO_RESERVADO } from './anfitriao-reservas.util';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDataValida(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function normalizarListaDatas(
  raw: unknown,
  max = 50,
): { datas: string[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: 'datas é obrigatório (array YYYY-MM-DD)' };
  }
  if (raw.length > max) {
    return { error: `Máximo ${max} datas por requisição` };
  }
  const datas = [...new Set(raw.map((d) => String(d).trim().slice(0, 10)))];
  for (const data of datas) {
    if (!isDataValida(data)) {
      return { error: `Data inválida: ${data}` };
    }
  }
  return { datas };
}

export function isDiaReservadoRow(row: { observacao: string | null } | undefined): boolean {
  return row?.observacao === OBSERVACAO_RESERVADO;
}

export function isDiaBloqueadoRow(
  row: { disponivel: boolean; observacao: string | null } | undefined,
): boolean {
  if (!row) return false;
  if (row.observacao === OBSERVACAO_RESERVADO) return false;
  return row.disponivel === false || row.observacao === OBSERVACAO_BLOQUEADO;
}
