import {
  parseUpgradeVarandaMeta,
  isPremiumAncora,
  sumUpgradeVaranda,
  UPGRADE_VARANDA_DEFAULT_VALOR,
} from '@rsv360/shared';

describe('parseUpgradeVarandaMeta', () => {
  it('retorna indisponível sem metadata', () => {
    expect(parseUpgradeVarandaMeta(null)).toEqual({
      disponivel: false,
      valor: UPGRADE_VARANDA_DEFAULT_VALOR,
    });
  });

  it('lê flag e valor calibrável', () => {
    expect(
      parseUpgradeVarandaMeta({
        upgrade_varanda_disponivel: true,
        upgrade_varanda_valor: 100,
      }),
    ).toEqual({ disponivel: true, valor: 100 });
  });

  it('usa default 80 quando valor inválido', () => {
    expect(
      parseUpgradeVarandaMeta({
        upgrade_varanda_disponivel: true,
        upgrade_varanda_valor: 'x',
      }),
    ).toEqual({ disponivel: true, valor: 80 });
  });
});

describe('isPremiumAncora', () => {
  it('detecta premium_ancora', () => {
    expect(isPremiumAncora({ premium_ancora: true })).toBe(true);
    expect(isPremiumAncora({})).toBe(false);
  });
});

describe('sumUpgradeVaranda', () => {
  it('soma valor × noites quando ativo', () => {
    expect(sumUpgradeVaranda(true, 80, 3)).toBe(240);
  });

  it('retorna 0 quando desligado', () => {
    expect(sumUpgradeVaranda(false, 80, 3)).toBe(0);
  });
});
