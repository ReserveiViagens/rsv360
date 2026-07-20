const mockWhere = jest.fn();
const mockFrom = jest.fn(() => ({ where: mockWhere }));
const mockSelect = jest.fn((..._args: unknown[]) => ({ from: mockFrom }));

function whereResult(rows: unknown[]) {
  return {
    limit: jest.fn().mockResolvedValue(rows),
    then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(rows).then(resolve, reject),
  };
}
const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn((..._args: unknown[]) => ({ set: mockUpdateSet }));
const mockInsertValues = jest.fn().mockResolvedValue(undefined);
const mockInsert = jest.fn((..._args: unknown[]) => ({ values: mockInsertValues }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return { from: mockFrom };
    },
    insert: (...args: unknown[]) => {
      mockInsert(...args);
      return { values: mockInsertValues };
    },
    update: (...args: unknown[]) => {
      mockUpdate(...args);
      return { set: mockUpdateSet };
    },
  },
}));

jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { id: 'id', tokenPublico: 'token_publico', status: 'status', isPublica: 'is_publica' },
}));

jest.mock('../../../../backend/src/db/schema/proposta-vouchers', () => ({
  propostaVouchers: {
    id: 'id',
    propostaId: 'proposta_id',
    voucherSlug: 'voucher_slug',
    voucherValidadoEm: 'voucher_validado_em',
  },
  VOUCHER_SLUGS: ['hotel', 'ingressos', 'checkin'],
}));

jest.mock('drizzle-orm', () => ({
  eq: (...args: unknown[]) => args,
  and: (...args: unknown[]) => args,
}));

jest.mock('qrcode', () => ({
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-png')),
}));

import {
  assinarQrToken,
  verificarAssinaturaQrToken,
  gerarQrVoucherPng,
  verificarVoucherPorQrToken,
  QrVoucherError,
} from '../../../../server/modules/propostas/services/qr-voucher.service';

const propostaPaga = {
  id: 42,
  isPublica: true,
  status: 'paid',
  tokenPublico: 'rt-paga',
  clienteNome: 'Ana Silva',
  metadata: { checkIn: '2026-08-01', checkOut: '2026-08-05', hotelId: 'piazza-diroma' },
  conteudo: { inclusions: { hotel: 'Piazza diRoma' } },
};

const voucherRow = {
  id: 1,
  propostaId: 42,
  voucherSlug: 'hotel',
  titulo: 'Voucher de Hospedagem',
  hospede: 'Ana Silva',
  unidade: 'Piazza diRoma',
  checkIn: '2026-08-01',
  checkOut: '2026-08-05',
  voucherValidadoEm: null as Date | null,
};

describe('qr-voucher.service (PR 21)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.QR_SECRET = 'test-qr-secret';
    mockWhere.mockImplementation(() => whereResult([]));
  });

  it('assina e verifica token HMAC', () => {
    const exp = Date.now() + 60_000;
    const token = assinarQrToken(42, 'hotel', exp);
    const parsed = verificarAssinaturaQrToken(token);
    expect(parsed).toEqual({ propostaId: 42, voucherSlug: 'hotel', exp });
  });

  it('rejeita assinatura adulterada', () => {
    const exp = Date.now() + 60_000;
    const token = assinarQrToken(42, 'hotel', exp);
    const parsed = verificarAssinaturaQrToken(`${token}x`);
    expect(parsed).toBeNull();
  });

  it('gerarQrVoucherPng retorna buffer para proposta paga', async () => {
    mockWhere
      .mockImplementationOnce(() => whereResult([propostaPaga]))
      .mockImplementation(() => whereResult([]));

    const png = await gerarQrVoucherPng('rt-paga', 'hotel');
    expect(Buffer.isBuffer(png)).toBe(true);
  });

  it('gerarQrVoucherPng bloqueia proposta não paga', async () => {
    mockWhere.mockImplementationOnce(() =>
      whereResult([{ ...propostaPaga, status: 'sent' }]),
    );

    await expect(gerarQrVoucherPng('rt-sent', 'hotel')).rejects.toBeInstanceOf(QrVoucherError);
  });

  it('verificarVoucherPorQrToken retorna dados e marca validação', async () => {
    const exp = Date.now() + 60_000;
    const qrToken = assinarQrToken(42, 'hotel', exp);

    mockWhere
      .mockImplementationOnce(() => whereResult([propostaPaga]))
      .mockImplementationOnce(() => whereResult([]))
      .mockImplementationOnce(() => whereResult([]))
      .mockImplementationOnce(() => whereResult([]))
      .mockImplementationOnce(() => whereResult([voucherRow]));

    const data = await verificarVoucherPorQrToken(qrToken);
    expect(data.valido).toBe(true);
    expect(data.hospede).toBe('Ana Silva');
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('verificarVoucherPorQrToken rejeita HMAC inválido', async () => {
    await expect(verificarVoucherPorQrToken('invalid.token')).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});
