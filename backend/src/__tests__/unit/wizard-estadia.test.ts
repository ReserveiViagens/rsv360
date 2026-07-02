import {
  countWizardNights,
  meetsWizardMinNights,
  WIZARD_MIN_NIGHTS,
} from '@rsv360/shared';

describe('wizard-estadia — estadia mínima comercial', () => {
  it('exige pelo menos 2 noites para reservar', () => {
    expect(WIZARD_MIN_NIGHTS).toBe(2);
  });

  it('conta 1 noite entre check-in e check-out consecutivos', () => {
    expect(countWizardNights('2026-07-01', '2026-07-02')).toBe(1);
    expect(meetsWizardMinNights('2026-07-01', '2026-07-02')).toBe(false);
  });

  it('aceita estadia de 2 noites ou mais', () => {
    expect(countWizardNights('2026-07-01', '2026-07-03')).toBe(2);
    expect(meetsWizardMinNights('2026-07-01', '2026-07-03')).toBe(true);

    expect(countWizardNights('2026-07-01', '2026-07-05')).toBe(4);
    expect(meetsWizardMinNights('2026-07-01', '2026-07-05')).toBe(true);
  });

  it('retorna 0 para datas inválidas ou ausentes', () => {
    expect(countWizardNights('', '2026-07-02')).toBe(0);
    expect(countWizardNights('2026-07-01', '')).toBe(0);
    expect(countWizardNights('invalid', '2026-07-02')).toBe(0);
    expect(meetsWizardMinNights('', '')).toBe(false);
  });
});
