const mockSelectLimit = jest.fn();
const mockSelectWhere = jest.fn(() => ({ limit: mockSelectLimit }));
const mockSelectFrom = jest.fn(() => ({ where: mockSelectWhere }));
const mockSelect = jest.fn(() => ({ from: mockSelectFrom }));

const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn(() => ({ set: mockUpdateSet }));

const mockInsertValues = jest.fn().mockResolvedValue(undefined);
const mockInsert = jest.fn(() => ({ values: mockInsertValues }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/disponibilidade-acomodacao', () => ({
  disponibilidadeAcomodacao: {
    id: 'id',
    acomodacaoId: 'acomodacao_id',
    data: 'data',
    disponivel: 'disponivel',
  },
}));

jest.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => args,
  eq: (...args: unknown[]) => args,
}));

import {
  assertDisponibilidadeReserva,
  DisponibilidadeReservaConflictError,
  isDataBloqueada,
  listDiariasEstadia,
  marcarDiariasReservadas,
  verificarDisponibilidadeReserva,
} from '../../../../server/modules/acomodacoes/services/disponibilidade-reserva.hook';

describe('disponibilidade-reserva.hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectLimit.mockResolvedValue([]);
  });

  it('listDiariasEstadia retorna noites entre check-in e check-out', () => {
    expect(listDiariasEstadia('2026-08-01', '2026-08-04')).toEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
    ]);
  });

  it('tabela vazia: verificarDisponibilidadeReserva passa', async () => {
    mockSelectLimit.mockResolvedValue([]);
    await expect(assertDisponibilidadeReserva(10, '2026-08-01', '2026-08-03')).resolves.toBeUndefined();
  });

  it('data bloqueada retorna 409 com datasIndisponiveis', async () => {
    mockSelectLimit.mockResolvedValueOnce([]).mockResolvedValueOnce([{ disponivel: false }]);

    const result = await verificarDisponibilidadeReserva(10, '2026-08-01', '2026-08-03');
    expect(result).toEqual({ ok: false, datasIndisponiveis: ['2026-08-02'] });

    mockSelectLimit.mockResolvedValueOnce([]).mockResolvedValueOnce([{ disponivel: false }]);
    await expect(assertDisponibilidadeReserva(10, '2026-08-01', '2026-08-03')).rejects.toMatchObject({
      acomodacaoId: 10,
      datasIndisponiveis: ['2026-08-02'],
      statusCode: 409,
    });
  });

  it('isDataBloqueada é false quando não há linha', async () => {
    mockSelectLimit.mockResolvedValueOnce([]);
    await expect(isDataBloqueada(5, '2026-08-01')).resolves.toBe(false);
  });

  it('marcarDiariasReservadas grava disponivel=false (insert quando vazio)', async () => {
    mockSelectLimit.mockResolvedValue([]);
    await marcarDiariasReservadas(7, '2026-08-01', '2026-08-03');

    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockInsertValues).toHaveBeenNthCalledWith(1, {
      acomodacaoId: 7,
      data: '2026-08-01',
      disponivel: false,
      observacao: 'reservado',
    });
  });

  it('segunda reserva sobreposta falha quando diária já está indisponível', async () => {
    mockSelectLimit
      .mockResolvedValueOnce([{ disponivel: false }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const result = await verificarDisponibilidadeReserva(7, '2026-08-02', '2026-08-05');
    expect(result).toEqual({ ok: false, datasIndisponiveis: ['2026-08-02'] });
  });

  it('datas disjuntas: segunda verificação passa', async () => {
    mockSelectLimit.mockResolvedValue([]);
    await expect(
      assertDisponibilidadeReserva(9, '2026-08-01', '2026-08-03'),
    ).resolves.toBeUndefined();
    await expect(
      assertDisponibilidadeReserva(9, '2026-08-10', '2026-08-12'),
    ).resolves.toBeUndefined();
  });
});
