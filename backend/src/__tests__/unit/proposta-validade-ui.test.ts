import {
  formatRestanteMs,
  inferirExpiradaComercial,
  isPropostaPosAceite,
  normalizeUrgenciaEstilo,
  propostaAceiteBloqueado,
  shouldShowUrgenciaIndicador,
} from '../../../../apps/site-publico/lib/proposta-validade-ui';

describe('proposta-validade-ui', () => {
  describe('normalizeUrgenciaEstilo', () => {
    it('aceita countdown, badge e nenhum da config modulo_propostas', () => {
      expect(normalizeUrgenciaEstilo('countdown')).toBe('countdown');
      expect(normalizeUrgenciaEstilo('badge')).toBe('badge');
      expect(normalizeUrgenciaEstilo('nenhum')).toBe('nenhum');
    });

    it('usa countdown como padrão para valor desconhecido', () => {
      expect(normalizeUrgenciaEstilo(undefined)).toBe('countdown');
      expect(normalizeUrgenciaEstilo('invalido')).toBe('countdown');
    });
  });

  describe('shouldShowUrgenciaIndicador', () => {
    it('nenhum não renderiza indicador', () => {
      expect(shouldShowUrgenciaIndicador('nenhum', false)).toBe(false);
    });

    it('countdown e badge somem quando expirada (painel do item 2)', () => {
      expect(shouldShowUrgenciaIndicador('countdown', true)).toBe(false);
      expect(shouldShowUrgenciaIndicador('badge', true)).toBe(false);
    });

    it('countdown e badge visíveis enquanto válida', () => {
      expect(shouldShowUrgenciaIndicador('countdown', false)).toBe(true);
      expect(shouldShowUrgenciaIndicador('badge', false)).toBe(true);
    });
  });

  describe('formatRestanteMs', () => {
    it('formata horas, minutos e segundos', () => {
      expect(formatRestanteMs(3_661_000)).toBe('01:01:01');
    });

    it('retorna 00:00:00 quando expirado', () => {
      expect(formatRestanteMs(0)).toBe('00:00:00');
      expect(formatRestanteMs(null)).toBe('00:00:00');
    });
  });

  describe('inferirExpiradaComercial', () => {
    it('sent sem valido_ate não expira (restanteMs null)', () => {
      expect(inferirExpiradaComercial('sent', false, null, null)).toBe(false);
    });

    it('sent com prazo vencido expira', () => {
      expect(inferirExpiradaComercial('sent', false, 0, '2020-01-01T00:00:00.000Z')).toBe(true);
    });

    it('accepted ignora prazo vencido', () => {
      expect(inferirExpiradaComercial('accepted', false, 0, '2020-01-01T00:00:00.000Z')).toBe(
        false,
      );
    });
  });

  describe('propostaAceiteBloqueado', () => {
    it('bloqueia quando expirada pelo socket/polling', () => {
      expect(propostaAceiteBloqueado('sent', true)).toBe(true);
    });

    it('não bloqueia roteiro pós-aceite por validade comercial', () => {
      expect(propostaAceiteBloqueado('accepted', false)).toBe(true);
      expect(isPropostaPosAceite('accepted')).toBe(true);
      expect(isPropostaPosAceite('paid')).toBe(true);
    });

    it('bloqueia status expired ao abrir a página', () => {
      expect(propostaAceiteBloqueado('expired', false)).toBe(true);
    });

    it('permite aceite em proposta sent ainda válida', () => {
      expect(propostaAceiteBloqueado('sent', false)).toBe(false);
    });
  });
});
