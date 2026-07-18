/**
 * Exercises real anfitriaoService bulk/preco paths (service NOT mocked).
 * Regression for missing OBSERVACAO_RESERVADO import → ReferenceError at L390+.
 */
const mockSelectLimit = jest.fn();
const mockSelectWhere = jest.fn(() => ({ limit: mockSelectLimit }));
const mockSelectFrom = jest.fn(() => ({ where: mockSelectWhere }));
const mockSelect = jest.fn((..._args: unknown[]) => ({ from: mockSelectFrom }));

const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn((..._args: unknown[]) => ({ set: mockUpdateSet }));

const mockInsertValues = jest.fn().mockResolvedValue(undefined);
const mockInsert = jest.fn((..._args: unknown[]) => ({ values: mockInsertValues }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/acomodacoes', () => ({
  acomodacoes: { id: 'id', proprietarioId: 'proprietario_id' },
}));
jest.mock('../../../../backend/src/db/schema/disponibilidade-acomodacao', () => ({
  disponibilidadeAcomodacao: {
    id: 'id',
    acomodacaoId: 'acomodacao_id',
    data: 'data',
    disponivel: 'disponivel',
    observacao: 'observacao',
  },
}));
jest.mock('../../../../backend/src/db/schema/carteira-corretor', () => ({
  carteiraCorretor: { corretorId: 'corretor_id', proprietarioId: 'proprietario_id', status: 'status' },
}));
jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { id: 'id', status: 'status', metadata: 'metadata' },
}));

jest.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => args,
  eq: (...args: unknown[]) => args,
  desc: (x: unknown) => x,
  inArray: (...args: unknown[]) => args,
  sql: Object.assign((..._args: unknown[]) => ({}), { raw: (x: unknown) => x }),
}));

import {
  anfitriaoService,
  type AuthContext,
} from '../../../../server/modules/acomodacoes/services/anfitriao.service';
import { OBSERVACAO_RESERVADO } from '../../../../server/modules/acomodacoes/services/anfitriao-reservas.util';

const auth: AuthContext = { userId: 1, role: 'anfitriao' };
const unidade = { id: 101, proprietarioId: 1, statusPublicacao: 'publicado' };

describe('anfitriao.service — OBSERVACAO_RESERVADO guards (real service)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(anfitriaoService, 'obterUnidade')
      .mockResolvedValue({ data: unidade } as Awaited<ReturnType<typeof anfitriaoService.obterUnidade>>);
    mockSelectLimit.mockResolvedValue([]);
    mockUpdateWhere.mockResolvedValue(undefined);
    mockInsertValues.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('bulkBloquearDatas rejects observacao=reservado without throwing', async () => {
    await expect(
      anfitriaoService.bulkBloquearDatas(auth, 101, ['2026-08-01'], OBSERVACAO_RESERVADO),
    ).resolves.toEqual({ error: 'invalid_observacao' });
    expect(mockSelectLimit).not.toHaveBeenCalled();
  });

  it('bulkBloquearDatas returns day_reserved_conflict for existing reserved day', async () => {
    mockSelectLimit.mockResolvedValueOnce([
      { id: 9, acomodacaoId: 101, data: '2026-08-01', observacao: OBSERVACAO_RESERVADO },
    ]);

    await expect(
      anfitriaoService.bulkBloquearDatas(auth, 101, ['2026-08-01'], 'bloqueado'),
    ).resolves.toEqual({ error: 'day_reserved_conflict', data: '2026-08-01' });
  });

  it('bulkDesbloquearDatas returns day_reserved for reserved day', async () => {
    mockSelectLimit.mockResolvedValueOnce([
      { id: 9, acomodacaoId: 101, data: '2026-08-02', disponivel: false, observacao: OBSERVACAO_RESERVADO },
    ]);

    await expect(
      anfitriaoService.bulkDesbloquearDatas(auth, 101, ['2026-08-02']),
    ).resolves.toEqual({ error: 'day_reserved', data: '2026-08-02' });
  });

  it('ajustarPrecoDatas returns day_reserved for reserved day', async () => {
    mockSelectLimit.mockResolvedValueOnce([
      { id: 9, acomodacaoId: 101, data: '2026-08-03', observacao: OBSERVACAO_RESERVADO },
    ]);

    await expect(
      anfitriaoService.ajustarPrecoDatas(auth, 101, ['2026-08-03'], 199),
    ).resolves.toEqual({ error: 'day_reserved', data: '2026-08-03' });
  });
});
