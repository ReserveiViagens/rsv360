import {
  montarDailySchedule,
  montarDailyScheduleAsync,
  montarDailyScheduleLegado,
  type GerarPropostaPayload,
} from '../../../../server/modules/cotacao-publica/services/montar-roteiro';
import { CATALOGO_TESTE } from '../fixtures/roteiro-atracoes.fixture';

jest.mock('../../../../server/modules/cotacao-publica/services/roteiro-atracoes.service', () => ({
  listRoteiroAtracoes: jest.fn(async () => CATALOGO_TESTE),
}));

const LEGACY_SNAPSHOT_PAYLOAD: GerarPropostaPayload = {
  checkIn: '2026-07-15',
  checkOut: '2026-07-18',
  adults: 2,
  children: 0,
  hotelId: 'hotel-1',
  ticketIds: ['ticket-1', 'ticket-2'],
  attractionIds: ['attr-1'],
  name: 'Test Guest',
  phone: '64999999999',
  profile: 'casal',
  catalog: {
    hotels: [
      {
        id: 'hotel-1',
        title: 'Atrium Thermas',
        price: 350,
        images: ['https://cdn.example/hotel.jpg'],
        metadata: { behaviorTags: ['casal'], premiumLabel: 'Premium Casal' },
      },
    ],
    tickets: [
      {
        id: 'ticket-1',
        title: 'Hot Park',
        price: 120,
        images: ['https://cdn.example/ticket1.jpg'],
      },
      {
        id: 'ticket-2',
        title: 'Diroma Acqua',
        price: 95,
        images: ['https://cdn.example/ticket2.jpg'],
      },
    ],
    attractions: [
      {
        id: 'attr-1',
        title: 'Serra de Caldas',
        price: 0,
        images: ['https://cdn.example/attr.jpg'],
        metadata: { behaviorTags: ['familia'] },
      },
    ],
  },
};

const LEGACY_SNAPSHOT_EXPECTED = JSON.stringify(
  montarDailyScheduleLegado(LEGACY_SNAPSHOT_PAYLOAD),
);

describe('montar-roteiro flag ROTEIRO_INTELIGENTE_ENABLED', () => {
  const envKey = 'ROTEIRO_INTELIGENTE_ENABLED';
  let previous: string | undefined;

  beforeEach(() => {
    previous = process.env[envKey];
  });

  afterEach(() => {
    if (previous === undefined) delete process.env[envKey];
    else process.env[envKey] = previous;
  });

  it('flag ausente — saida byte-a-byte identica ao legado', () => {
    delete process.env[envKey];
    const output = JSON.stringify(montarDailySchedule(LEGACY_SNAPSHOT_PAYLOAD));
    expect(output).toBe(LEGACY_SNAPSHOT_EXPECTED);
  });

  it('flag false — saida byte-a-byte identica ao legado', () => {
    process.env[envKey] = 'false';
    const output = JSON.stringify(montarDailySchedule(LEGACY_SNAPSHOT_PAYLOAD));
    expect(output).toBe(LEGACY_SNAPSHOT_EXPECTED);
  });

  it('flag true — usa motor inteligente (nao igual ao legado)', async () => {
    process.env[envKey] = 'true';
    const output = JSON.stringify(await montarDailyScheduleAsync(LEGACY_SNAPSHOT_PAYLOAD));
    expect(output).not.toBe(LEGACY_SNAPSHOT_EXPECTED);
  });
});
