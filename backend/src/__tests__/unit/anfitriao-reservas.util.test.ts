import {
  buildReservedDateSet,
  deriveCalendarioEstado,
  enumerateDatesInclusive,
  estadiaSobrepoePeriodo,
  isDiaReservadoProtegido,
  maskEmail,
  maskPhone,
  OBSERVACAO_RESERVADO,
  parseEstadiaFromMetadata,
} from '../../../../server/modules/acomodacoes/services/anfitriao-reservas.util';

describe('anfitriao-reservas.util', () => {
  describe('maskEmail / maskPhone', () => {
    it('mascara email e telefone para LGPD', () => {
      expect(maskEmail('cliente@dominio.com')).toBe('c***@dominio.com');
      expect(maskPhone('(64) 99999-1234')).toBe('***1234');
    });
  });

  describe('parseEstadiaFromMetadata', () => {
    it('extrai acomodacaoId e datas do metadata', () => {
      expect(
        parseEstadiaFromMetadata({
          acomodacaoId: 42,
          checkIn: '2026-08-01',
          checkOut: '2026-08-05',
        }),
      ).toEqual({
        acomodacaoId: 42,
        checkIn: '2026-08-01',
        checkOut: '2026-08-05',
      });
    });
  });

  describe('deriveCalendarioEstado', () => {
    it('marca reservado quando observacao ou overlay', () => {
      const reserved = new Set(['2026-08-02']);
      expect(
        deriveCalendarioEstado('2026-08-02', { disponivel: false, observacao: OBSERVACAO_RESERVADO }, reserved),
      ).toBe('reservado');
      expect(deriveCalendarioEstado('2026-08-03', undefined, reserved)).toBe('livre');
      expect(
        deriveCalendarioEstado('2026-08-04', { disponivel: false, observacao: 'bloqueado' }, new Set()),
      ).toBe('bloqueado');
    });
  });

  describe('isDiaReservadoProtegido', () => {
    it('bloqueia liberar dia reservado para anfitriao', () => {
      expect(
        isDiaReservadoProtegido(
          { disponivel: false, observacao: OBSERVACAO_RESERVADO },
          { disponivel: true },
        ),
      ).toBe(true);
    });
  });

  describe('estadiaSobrepoePeriodo', () => {
    it('detecta sobreposicao de periodos', () => {
      expect(estadiaSobrepoePeriodo('2026-08-01', '2026-08-05', '2026-08-01', '2026-08-31')).toBe(true);
      expect(estadiaSobrepoePeriodo('2026-09-01', '2026-09-05', '2026-08-01', '2026-08-31')).toBe(false);
    });
  });

  describe('enumerateDatesInclusive', () => {
    it('lista dias inclusive', () => {
      expect(enumerateDatesInclusive('2026-08-01', '2026-08-03')).toEqual([
        '2026-08-01',
        '2026-08-02',
        '2026-08-03',
      ]);
    });
  });

  describe('buildReservedDateSet', () => {
    it('expande noites da estadia', () => {
      const set = buildReservedDateSet([{ checkIn: '2026-08-01', checkOut: '2026-08-03' }]);
      expect(set.has('2026-08-01')).toBe(true);
      expect(set.has('2026-08-02')).toBe(true);
      expect(set.has('2026-08-03')).toBe(false);
    });
  });
});
