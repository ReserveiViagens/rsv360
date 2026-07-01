import { formatAcomodacaoConfigLabel } from '@rsv360/shared';

describe('formatAcomodacaoConfigLabel', () => {
  it('quartos=0 exibe Studio', () => {
    expect(formatAcomodacaoConfigLabel('nenhum', 'so_suite', 0, 4)).toBe(
      'Studio · suíte · até 4 pessoa(s)',
    );
  });

  it('quartos>=1 exibe N qt', () => {
    expect(formatAcomodacaoConfigLabel('nenhum', 'so_wc_social', 2, 6)).toBe(
      '2 qt · WC social · até 6 pessoa(s)',
    );
  });
});
