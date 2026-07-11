import fs from 'node:fs';
import path from 'node:path';
import {
  ETAPA_A_MAPEAMENTO,
  getEtapaAUnidade,
  montarCardsPasso2,
  montarCardsPorRelevancia,
  resolverCardsEtapaA,
  type AcomodacaoDisponivel,
} from '@rsv360/shared';

const CSV_PATH = path.join(
  __dirname,
  '../../../../../data/etapa-a/mapeamento-tipo-17-unidades.csv',
);

function makeDisp(
  partial: Partial<AcomodacaoDisponivel> & {
    id: number;
    codigoExterno: string;
    hotelId: string;
  },
): AcomodacaoDisponivel {
  return {
    titulo: partial.titulo ?? partial.codigoExterno,
    quartos: partial.quartos ?? 1,
    configSala: partial.configSala ?? 'nenhum',
    configBanheiro: partial.configBanheiro ?? 'so_wc_social',
    capacidadeMax: partial.capacidadeMax ?? 4,
    precoDiaria: partial.precoDiaria ?? 200,
    disponivel: true,
    ...partial,
  };
}

function parseCsvRows(content: string) {
  const lines = content.trim().split(/\r?\n/).slice(1);
  return lines.map((line) => {
    const cols = line.split(',');
    return {
      rsv360Id: Number(cols[0]),
      codigoExterno: cols[1],
      titulo: cols[2],
      hotelId: cols[3],
      quartos: Number(cols[4]),
      capacidadeMax: Number(cols[5]),
      precoDiariaFlat: Number(cols[6]),
      tipoTarifario: cols[7],
      upgradeVaranda: cols[8] === 'sim',
      upgradeVarandaRs: cols[9] ? Number(cols[9]) : null,
      premiumAncora: cols[7].includes('Premium âncora'),
    };
  });
}

describe('Etapa A — anti-drift CSV × TS', () => {
  it('constantes batem 1:1 com mapeamento-tipo-17-unidades.csv', () => {
    const csvRows = parseCsvRows(fs.readFileSync(CSV_PATH, 'utf8'));
    expect(ETAPA_A_MAPEAMENTO).toHaveLength(csvRows.length);

    for (const csv of csvRows) {
      const ts = getEtapaAUnidade(csv.codigoExterno);
      expect(ts).toBeDefined();
      expect(ts!.rsv360Id).toBe(csv.rsv360Id);
      expect(ts!.codigoExterno).toBe(csv.codigoExterno);
      expect(ts!.titulo).toBe(csv.titulo);
      expect(ts!.hotelId).toBe(csv.hotelId);
      expect(ts!.quartos).toBe(csv.quartos);
      expect(ts!.capacidadeMax).toBe(csv.capacidadeMax);
      expect(ts!.precoDiariaFlat).toBe(csv.precoDiariaFlat);
      expect(ts!.tipoTarifario).toBe(csv.tipoTarifario);
      expect(ts!.upgradeVaranda).toBe(csv.upgradeVaranda);
      expect(ts!.upgradeVarandaRs).toBe(csv.upgradeVarandaRs);
      expect(ts!.premiumAncora).toBe(csv.premiumAncora);
    }
  });
});

describe('resolverCardsEtapaA — pins âncora', () => {
  it('casal @ atrium-thermas → ATR-SUV com papel 1 quarto', () => {
    const disponiveis = [
      makeDisp({
        id: 12,
        codigoExterno: 'ATR-SUV',
        hotelId: 'atrium-thermas',
        titulo: 'Suite com Varanda',
        quartos: 1,
        precoDiaria: 380,
        upgradeVarandaDisponivel: true,
        upgradeVarandaValor: 80,
      }),
      makeDisp({
        id: 10,
        codigoExterno: 'ATR-DUP',
        hotelId: 'atrium-thermas',
        titulo: 'Quarto Duplo',
        precoDiaria: 349,
      }),
    ];
    const cards = resolverCardsEtapaA('atrium-thermas', 'casal', 2, 0, disponiveis);
    expect(cards).toHaveLength(1);
    expect(cards[0].acomodacao.codigoExterno).toBe('ATR-SUV');
    expect(cards[0].arquetipo.label).toBe('1 quarto');
    expect(cards[0].acomodacao.upgradeVarandaDisponivel).toBe(true);
  });

  it('familia @ aquarius-residence → AQR-FAM', () => {
    const disponiveis = [
      makeDisp({
        id: 18,
        codigoExterno: 'AQR-FAM',
        hotelId: 'aquarius-residence',
        titulo: 'Suite Familia com Varanda',
        quartos: 2,
        capacidadeMax: 5,
        precoDiaria: 449,
        upgradeVarandaDisponivel: true,
        upgradeVarandaValor: 80,
      }),
    ];
    const cards = resolverCardsEtapaA('aquarius-residence', 'familia', 2, 2, disponiveis);
    expect(cards[0].acomodacao.codigoExterno).toBe('AQR-FAM');
    expect(cards[0].arquetipo.label).toBe('2 quartos');
  });

  it('casal @ lacqua-diroma → KN39H Entrada', () => {
    const disponiveis = [
      makeDisp({
        id: 27,
        codigoExterno: 'KN39H',
        hotelId: 'lacqua-diroma',
        titulo: 'Lacqua diRoma IV Apto 196',
        precoDiaria: 120,
      }),
    ];
    const cards = resolverCardsEtapaA('lacqua-diroma', 'casal', 2, 0, disponiveis);
    expect(cards[0].acomodacao.codigoExterno).toBe('KN39H');
    expect(cards[0].arquetipo.label).toBe('Entrada');
    expect(cards[0].acomodacao.precoDiaria).toBe(120);
  });

  it('aldeia-do-lago → ALD-FAM premium âncora', () => {
    const disponiveis = [
      makeDisp({
        id: 14,
        codigoExterno: 'ALD-FAM',
        hotelId: 'aldeia-do-lago',
        titulo: 'Chale Familia',
        capacidadeMax: 8,
        precoDiaria: 600,
        premiumAncora: true,
      }),
    ];
    const cards = resolverCardsEtapaA('aldeia-do-lago', 'casal', 2, 0, disponiveis);
    expect(cards[0].acomodacao.codigoExterno).toBe('ALD-FAM');
    expect(cards[0].arquetipo.label).toBe('Premium');
    expect(cards[0].acomodacao.premiumAncora).toBe(true);
  });
});

describe('resolverCardsEtapaA — pin ausente (b)', () => {
  it('cai em relevância quando âncora despublicada — nunca vazio', () => {
    const disponiveis = [
      makeDisp({
        id: 10,
        codigoExterno: 'ATR-DUP',
        hotelId: 'atrium-thermas',
        titulo: 'Quarto Duplo Standard',
        quartos: 1,
        configSala: 'sofa_cama',
        precoDiaria: 349,
      }),
      makeDisp({
        id: 11,
        codigoExterno: 'ATR-FAM',
        hotelId: 'atrium-thermas',
        titulo: 'Quarto Familia',
        quartos: 1,
        capacidadeMax: 4,
        precoDiaria: 400,
      }),
    ];
    const cards = resolverCardsEtapaA('atrium-thermas', 'casal', 2, 0, disponiveis);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.some((c) => c.acomodacao.codigoExterno === 'ATR-SUV')).toBe(false);
  });
});

describe('resolverCardsEtapaA — perfil não-mapeado (c)', () => {
  it('familia @ atrium-thermas usa relevância + badges (sem pin)', () => {
    const disponiveis = [
      makeDisp({
        id: 11,
        codigoExterno: 'ATR-FAM',
        hotelId: 'atrium-thermas',
        quartos: 1,
        capacidadeMax: 4,
        configSala: 'sofa_cama',
        precoDiaria: 400,
      }),
      makeDisp({
        id: 12,
        codigoExterno: 'ATR-SUV',
        hotelId: 'atrium-thermas',
        quartos: 2,
        capacidadeMax: 6,
        configSala: 'nenhum',
        precoDiaria: 380,
      }),
    ];
    const pinned = resolverCardsEtapaA('atrium-thermas', 'familia', 2, 2, disponiveis);
    const relevancia = montarCardsPorRelevancia('familia', 2, 2, disponiveis);
    expect(pinned).toHaveLength(relevancia.length);
    expect(pinned.map((c) => c.acomodacao.id)).toEqual(relevancia.map((c) => c.acomodacao.id));
  });

  it('casal @ aquarius-residence usa relevância (sem pin)', () => {
    const disponiveis = [
      makeDisp({
        id: 17,
        codigoExterno: 'AQR-CZ',
        hotelId: 'aquarius-residence',
        quartos: 1,
        precoDiaria: 320,
      }),
      makeDisp({
        id: 18,
        codigoExterno: 'AQR-FAM',
        hotelId: 'aquarius-residence',
        quartos: 2,
        precoDiaria: 449,
      }),
    ];
    const cards = resolverCardsEtapaA('aquarius-residence', 'casal', 2, 0, disponiveis);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((c) => c.acomodacao.codigoExterno !== 'AQR-FAM' || cards.length === 1)).toBe(
      true,
    );
    expect(cards[0].acomodacao.codigoExterno).not.toBe('AQR-FAM');
  });
});

describe('montarCardsPasso2 — hotel fora Etapa A', () => {
  it('comportamento idêntico ao legado pr19 (sem hotelId Etapa A)', () => {
    const disponiveis = [
      makeDisp({
        id: 10,
        codigoExterno: 'X-ECO',
        hotelId: 'hotel-generico',
        titulo: 'Eco',
        quartos: 1,
        configSala: 'sofa_cama',
        precoDiaria: 180,
      }),
      makeDisp({
        id: 11,
        codigoExterno: 'X-EXP',
        hotelId: 'hotel-generico',
        titulo: 'Exp',
        quartos: 2,
        configSala: 'nenhum',
        capacidadeMax: 6,
        precoDiaria: 320,
      }),
    ];
    const withHotel = montarCardsPasso2('familia', 2, 2, disponiveis, 'hotel-generico');
    const legacy = montarCardsPorRelevancia('familia', 2, 2, disponiveis);
    expect(withHotel.map((c) => c.acomodacao.id)).toEqual(legacy.map((c) => c.acomodacao.id));
    expect(withHotel[0].acomodacao.precoDiaria).toBeLessThanOrEqual(
      withHotel[withHotel.length - 1].acomodacao.precoDiaria,
    );
  });
});
