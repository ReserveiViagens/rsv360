jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    execute: jest.fn(),
  },
}));

jest.mock('../../../../backend/src/db/schema/empreendimentos', () => ({
  empreendimentos: {
    id: 'id',
    slug: 'slug',
    hotelId: 'hotel_id',
    nomeNormalizado: 'nome_normalizado',
    nomeOficial: 'nome_oficial',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ a, b })),
  or: jest.fn((...args) => args),
  sql: jest.fn(),
}));

import { db } from '../../../../server/lib/db';
import { resolverHotel, slugify } from '../../../../server/modules/acomodacoes/import/normalizar';

describe('resolverHotel (PR 22C)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prioriza empreendimentos.hotel_id antes do fallback slug', async () => {
    const chain = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ hotelId: 'piazza-diroma' }]),
        }),
      }),
    };
    (db.select as jest.Mock).mockReturnValue(chain);

    const hotelId = await resolverHotel('Piazza DiRoma');
    expect(hotelId).toBe('piazza-diroma');
    expect(db.execute).not.toHaveBeenCalled();
  });

  it('fallback slug quando empreendimento não existe na tabela', async () => {
    const chain = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    };
    (db.select as jest.Mock).mockReturnValue(chain);
    (db.execute as jest.Mock).mockRejectedValue(new Error('no website_content'));

    const hotelId = await resolverHotel('Hotel Demo X');
    expect(hotelId).toBe(slugify('Hotel Demo X'));
  });
});
