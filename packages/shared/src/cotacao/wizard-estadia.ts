/** Estadia mínima comercializada no wizard de cotação (diária calculada, venda a partir de 2 noites). */
export const WIZARD_MIN_NIGHTS = 2;

export function countWizardNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export function meetsWizardMinNights(checkIn: string, checkOut: string): boolean {
  return countWizardNights(checkIn, checkOut) >= WIZARD_MIN_NIGHTS;
}
