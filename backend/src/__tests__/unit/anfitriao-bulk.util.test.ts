import {
  isDiaBloqueadoRow,
  isDiaReservadoRow,
  normalizarListaDatas,
} from '../../../../server/modules/acomodacoes/services/anfitriao-bulk.util';

describe('anfitriao-bulk.util', () => {
  it('normaliza lista de datas unicas', () => {
    expect(normalizarListaDatas(['2026-08-01', '2026-08-01', '2026-08-02'])).toEqual({
      datas: ['2026-08-01', '2026-08-02'],
    });
  });

  it('rejeita lista vazia', () => {
    expect(normalizarListaDatas([])).toEqual({ error: 'datas é obrigatório (array YYYY-MM-DD)' });
  });

  it('identifica dia reservado e bloqueado', () => {
    expect(isDiaReservadoRow({ observacao: 'reservado' })).toBe(true);
    expect(isDiaBloqueadoRow({ disponivel: false, observacao: 'bloqueado' })).toBe(true);
    expect(isDiaBloqueadoRow(undefined)).toBe(false);
  });
});
