jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: jest.fn(),
  },
}));

jest.mock('../../../../backend/src/db/schema/empreendimentos', () => ({
  empreendimentos: {
    hotelId: 'hotel_id',
    slug: 'slug',
    websiteContentId: 'website_content_id',
    nomeOficial: 'nome_oficial',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ a, b })),
  or: jest.fn((...args) => args),
  sql: jest.fn(),
}));

import { db } from '../../../../server/lib/db';
import {
  matchCaldasHotelIdByTitle,
  resolverHotelIdParaAcomodacoes,
} from '../../../../server/modules/acomodacoes/services/resolve-hotel-id';

describe('resolve-hotel-id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });
  });

  it('matchCaldasHotelIdByTitle resolve Piazza parcial', () => {
    expect(matchCaldasHotelIdByTitle('Piazza')).toBe('piazza-diroma');
    expect(matchCaldasHotelIdByTitle('Piazza DiRoma')).toBe('piazza-diroma');
    expect(matchCaldasHotelIdByTitle('Spazzio DiRoma')).toBe('spazzio-diroma');
  });

  it('resolverHotelIdParaAcomodacoes mapeia hub-hotel-piazza via título', async () => {
    const id = await resolverHotelIdParaAcomodacoes('hub-hotel-piazza', 'Piazza');
    expect(id).toBe('piazza-diroma');
  });

  it('resolverHotelIdParaAcomodacoes mantém slug já canônico', async () => {
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ hotelId: 'piazza-diroma' }]),
        }),
      }),
    });
    const id = await resolverHotelIdParaAcomodacoes('piazza-diroma');
    expect(id).toBe('piazza-diroma');
  });
});
