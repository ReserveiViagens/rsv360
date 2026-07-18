import { parseGerarPropostaBody } from '../../../../server/modules/cotacao-publica/schemas/gerar-proposta.schema';
import {
  buildOrcamentoItens,
  type GerarPropostaPayload,
} from '../../../../server/modules/cotacao-publica/services/montar-roteiro';
import { resolveUpgradeVarandaProposta } from '../../../../server/modules/cotacao-publica/services/validar-upgrade-varanda-proposta';

const basePayload = (): GerarPropostaPayload => ({
  checkIn: '2026-08-01',
  checkOut: '2026-08-04',
  adults: 2,
  children: 0,
  name: 'Cliente Teste',
  phone: '62999999999',
  email: 'cliente@example.com',
  hotelId: 'atrium-thermas',
  catalog: {
    hotels: [{ id: 'atrium-thermas', title: 'Atrium', price: 380 }],
  },
});

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: jest.fn(),
  },
}));

const { db } = jest.requireMock('../../../../server/lib/db') as {
  db: { select: jest.Mock };
};

function mockAcomodacaoRow(codigoExterno: string, metadata: Record<string, unknown> = {}) {
  const limit = jest.fn().mockResolvedValue([
    { codigoExterno, metadata },
  ]);
  const where = jest.fn().mockReturnValue({ limit });
  const from = jest.fn().mockReturnValue({ where });
  db.select.mockReturnValue({ from });
}

describe('parseGerarPropostaBody — retrocompat (ponto 1)', () => {
  it('defaults fail-safe sem campos novos', () => {
    const parsed = parseGerarPropostaBody({
      checkIn: '2026-08-01',
      checkOut: '2026-08-04',
      adults: 2,
      children: 0,
      name: 'Ana',
      phone: '62999990000',
      email: 'ana@example.com',
    });
    expect(parsed.upgradeVaranda).toBe(false);
    expect(parsed.suiteUpgrade).toBe(false);
    expect(parsed.arquetipoId).toBeUndefined();
    expect(parsed.codigoExterno).toBeUndefined();
  });

  it('descarta upgradeVarandaValor do client (anti-tamper)', () => {
    const parsed = parseGerarPropostaBody({
      ...basePayload(),
      upgradeVaranda: true,
      upgradeVarandaValor: 1,
    });
    expect(parsed.upgradeVaranda).toBe(true);
    expect((parsed as unknown as Record<string, unknown>).upgradeVarandaValor).toBeUndefined();
  });
});

describe('buildOrcamentoItens — upgrade varanda (pontos 2–3)', () => {
  it('payload legado sem upgrade nao adiciona linha de upgrade', () => {
    const items = buildOrcamentoItens(basePayload());
    expect(items.filter((i) => i.nome.includes('varanda'))).toHaveLength(0);
    expect(items.filter((i) => i.nome.includes('Suíte Master'))).toHaveLength(0);
  });

  it('snapshot server-side gera uma linha de upgrade com valor correto', () => {
    const items = buildOrcamentoItens({
      ...basePayload(),
      acomodacaoSnapshot: {
        codigoExterno: 'ATR-SUV',
        upgradeVaranda: true,
        upgradeVarandaValorResolvido: 80,
      },
    });
    const upgrades = items.filter((i) => i.nome === 'Upgrade varanda/vista');
    expect(upgrades).toHaveLength(1);
    expect(upgrades[0].precoUnitario).toBe('80');
    expect(upgrades[0].precoTotal).toBe('240');
  });

  it('ambos suiteUpgrade e upgradeVaranda true => uma unica linha (ponto 3)', async () => {
    mockAcomodacaoRow('ATR-SUV', {
      upgrade_varanda_disponivel: true,
      upgrade_varanda_valor: 80,
    });
    const snapshot = await resolveUpgradeVarandaProposta({
      ...basePayload(),
      selectedAcomodacaoId: 12,
      suiteUpgrade: true,
      upgradeVaranda: true,
    });
    const items = buildOrcamentoItens({
      ...basePayload(),
      acomodacaoSnapshot: snapshot,
    });
    const upgrades = items.filter((i) => i.nome === 'Upgrade varanda/vista');
    expect(upgrades).toHaveLength(1);
    expect(snapshot.upgradeVaranda).toBe(true);
    expect(parseFloat(upgrades[0].precoTotal)).toBe(240);
  });
});

describe('resolveUpgradeVarandaProposta — server-side (ponto 2)', () => {
  it('ignora upgrade para unidade inelegivel (KN39H)', async () => {
    mockAcomodacaoRow('KN39H', {});
    const snapshot = await resolveUpgradeVarandaProposta({
      ...basePayload(),
      selectedAcomodacaoId: 27,
      upgradeVaranda: true,
    });
    expect(snapshot.upgradeVaranda).toBe(false);
    expect(snapshot.upgradeVarandaValorResolvido).toBe(0);
  });

  it('anti-tamper: valor vem do metadata/mapeamento, nao do body', async () => {
    mockAcomodacaoRow('ATR-SUV', {
      upgrade_varanda_disponivel: true,
      upgrade_varanda_valor: 80,
    });
    const snapshot = await resolveUpgradeVarandaProposta({
      ...basePayload(),
      selectedAcomodacaoId: 12,
      codigoExterno: 'ATR-SUV',
      upgradeVaranda: true,
    });
    expect(snapshot.upgradeVarandaValorResolvido).toBe(80);
  });

  it('selectedAcomodacaoId prevalece sobre codigoExterno adulterado no body', async () => {
    mockAcomodacaoRow('ATR-SUV', {
      upgrade_varanda_disponivel: true,
      upgrade_varanda_valor: 80,
    });
    const snapshot = await resolveUpgradeVarandaProposta({
      ...basePayload(),
      selectedAcomodacaoId: 12,
      codigoExterno: 'KN39H',
      arquetipoId: 'kn39h',
      upgradeVaranda: true,
    });
    expect(snapshot.codigoExterno).toBe('ATR-SUV');
    expect(snapshot.arquetipoId).toBe('atr-suv');
    expect(snapshot.upgradeVaranda).toBe(true);
  });

  it('suiteUpgrade legado mapeia para mesma validacao (politica a)', async () => {
    mockAcomodacaoRow('ATR-SUV', {
      upgrade_varanda_disponivel: true,
      upgrade_varanda_valor: 80,
    });
    const snapshot = await resolveUpgradeVarandaProposta({
      ...basePayload(),
      selectedAcomodacaoId: 12,
      suiteUpgrade: true,
      upgradeVaranda: false,
    });
    expect(snapshot.upgradeVaranda).toBe(true);
    expect(snapshot.codigoExterno).toBe('ATR-SUV');
  });
});

describe('snapshot imutavel (ponto 4)', () => {
  it('orcamento usa snapshot gravado na epoca; nao recalcula com tarifa nova', async () => {
    mockAcomodacaoRow('ATR-SUV', {
      upgrade_varanda_disponivel: true,
      upgrade_varanda_valor: 80,
    });
    const snapshotGravado = await resolveUpgradeVarandaProposta({
      ...basePayload(),
      selectedAcomodacaoId: 12,
      upgradeVaranda: true,
    });
    const itemsEpoca = buildOrcamentoItens({
      ...basePayload(),
      acomodacaoSnapshot: snapshotGravado,
    });

    mockAcomodacaoRow('ATR-SUV', {
      upgrade_varanda_disponivel: true,
      upgrade_varanda_valor: 120,
    });
    await resolveUpgradeVarandaProposta({
      ...basePayload(),
      selectedAcomodacaoId: 12,
      upgradeVaranda: true,
    });

    const itemsComSnapshotAntigo = buildOrcamentoItens({
      ...basePayload(),
      acomodacaoSnapshot: snapshotGravado,
    });
    expect(itemsComSnapshotAntigo).toEqual(itemsEpoca);
    expect(snapshotGravado.upgradeVarandaValorResolvido).toBe(80);
  });

  it('snapshot contem os 4 campos de auditoria', async () => {
    mockAcomodacaoRow('AQR-FAM', {
      upgrade_varanda_disponivel: true,
      upgrade_varanda_valor: 80,
    });
    const snapshot = await resolveUpgradeVarandaProposta({
      ...basePayload(),
      selectedAcomodacaoId: 18,
      upgradeVaranda: true,
    });
    expect(snapshot).toMatchObject({
      arquetipoId: 'aqr-fam',
      codigoExterno: 'AQR-FAM',
      upgradeVaranda: true,
      upgradeVarandaValorResolvido: 80,
    });
  });
});
