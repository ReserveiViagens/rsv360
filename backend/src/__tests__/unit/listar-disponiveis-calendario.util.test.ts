import {
  filtrarIdsAcomodacaoCalendarioLivre,
  isDiaIndisponivelCalendario,
  listarDiariasPeriodoWizard,
  parsePeriodoEstadiaOpcional,
  WIZARD_TIMEZONE,
} from '../../../../server/modules/acomodacoes/services/listar-disponiveis-calendario.util';

describe('listar-disponiveis-calendario.util', () => {
  describe('parsePeriodoEstadiaOpcional', () => {
    it('retorna null sem datas (zero regressao)', () => {
      expect(parsePeriodoEstadiaOpcional(undefined, undefined)).toBeNull();
      expect(parsePeriodoEstadiaOpcional('', '')).toBeNull();
    });

    it('rejeita apenas uma data', () => {
      const result = parsePeriodoEstadiaOpcional('2026-08-01', undefined);
      expect(result).toEqual({ error: 'checkIn e checkOut devem ser informados juntos (YYYY-MM-DD)' });
    });

    it('aceita periodo valido', () => {
      expect(parsePeriodoEstadiaOpcional('2026-08-01', '2026-08-05')).toEqual({
        checkIn: '2026-08-01',
        checkOut: '2026-08-05',
      });
    });
  });

  describe('listarDiariasPeriodoWizard', () => {
    it('periodo de 1 noite (checkOut = checkIn + 1 dia)', () => {
      expect(listarDiariasPeriodoWizard('2026-08-10', '2026-08-11')).toEqual(['2026-08-10']);
    });

    it('lista diarias no fuso comercial America/Sao_Paulo (D5)', () => {
      expect(WIZARD_TIMEZONE).toBe('America/Sao_Paulo');
      expect(listarDiariasPeriodoWizard('2026-08-01', '2026-08-04')).toEqual([
        '2026-08-01',
        '2026-08-02',
        '2026-08-03',
      ]);
    });
  });

  describe('isDiaIndisponivelCalendario', () => {
    it('sem linha = livre (tabela vazia)', () => {
      expect(isDiaIndisponivelCalendario(undefined)).toBe(false);
    });

    it('dia bloqueado', () => {
      expect(isDiaIndisponivelCalendario({ disponivel: false, observacao: 'bloqueado' })).toBe(true);
    });

    it('dia reservado', () => {
      expect(isDiaIndisponivelCalendario({ disponivel: false, observacao: 'reservado' })).toBe(true);
    });

    it('dia livre explicito', () => {
      expect(isDiaIndisponivelCalendario({ disponivel: true, observacao: null })).toBe(false);
    });
  });

  describe('filtrarIdsAcomodacaoCalendarioLivre', () => {
    const diarias = ['2026-08-01', '2026-08-02'];

    it('unidade com dia bloqueado no periodo nao aparece', () => {
      const ids = filtrarIdsAcomodacaoCalendarioLivre(
        [10, 20],
        diarias,
        [{ acomodacaoId: 10, data: '2026-08-01', disponivel: false, observacao: 'bloqueado' }],
      );
      expect(ids).toEqual([20]);
    });

    it('unidade com dia reservado no periodo nao aparece', () => {
      const ids = filtrarIdsAcomodacaoCalendarioLivre(
        [10, 20],
        diarias,
        [{ acomodacaoId: 20, data: '2026-08-02', disponivel: false, observacao: 'reservado' }],
      );
      expect(ids).toEqual([10]);
    });

    it('unidade com todas as diarias livres aparece', () => {
      const ids = filtrarIdsAcomodacaoCalendarioLivre(
        [10, 20],
        diarias,
        [{ acomodacaoId: 99, data: '2026-08-01', disponivel: true, observacao: null }],
      );
      expect(ids).toEqual([10, 20]);
    });

    it('sem linhas no periodo mantem todas (tabela vazia por unidade)', () => {
      expect(filtrarIdsAcomodacaoCalendarioLivre([10, 20], diarias, [])).toEqual([10, 20]);
    });
  });
});
