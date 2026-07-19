import {
  assertHotelMatchProposta,
  HotelMismatchError,
  HOTEL_MISMATCH_CODE,
} from '../../../../server/modules/cotacao-publica/services/assert-hotel-match-proposta';

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: jest.fn(),
  },
}));

const { db } = jest.requireMock('../../../../server/lib/db') as {
  db: { select: jest.Mock };
};

function mockHotelRow(hotelId: string | null) {
  const rows = hotelId == null ? [] : [{ hotelId }];
  const limit = jest.fn().mockResolvedValue(rows);
  const where = jest.fn().mockReturnValue({ limit });
  const from = jest.fn().mockReturnValue({ where });
  db.select.mockReturnValue({ from });
}

describe('E2 — assertHotelMatchProposta', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mismatch → HotelMismatchError (HOTEL_MISMATCH)', async () => {
    mockHotelRow('atrium-thermas');
    await expect(assertHotelMatchProposta(12, 'piazza-diroma')).rejects.toEqual(
      expect.objectContaining({
        name: 'HotelMismatchError',
        code: HOTEL_MISMATCH_CODE,
        statusCode: 422,
      }),
    );
    expect(HotelMismatchError.prototype).toBeInstanceOf(Error);
  });

  it('happy path: mesmo hotelId passa', async () => {
    mockHotelRow('atrium-thermas');
    await expect(assertHotelMatchProposta(12, 'atrium-thermas')).resolves.toBeUndefined();
  });

  it('happy path: alias canônico (lacqua-di-roma ≡ lacqua-diroma)', async () => {
    mockHotelRow('lacqua-diroma');
    await expect(assertHotelMatchProposta(12, 'lacqua-di-roma')).resolves.toBeUndefined();
  });

  it('payload hotelId ausente com acomodação → mismatch', async () => {
    mockHotelRow('atrium-thermas');
    await expect(assertHotelMatchProposta(12, null)).rejects.toBeInstanceOf(HotelMismatchError);
  });

  it('acomodação inexistente → não lança (skip seguro)', async () => {
    mockHotelRow(null);
    await expect(assertHotelMatchProposta(999, 'atrium-thermas')).resolves.toBeUndefined();
  });
});
