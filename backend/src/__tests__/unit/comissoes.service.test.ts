import { calcularSplitComissoes } from '../../../../server/modules/comissoes/services/comissoes.service';

const mockSelectLimit = jest.fn();
const mockSelectWhere = jest.fn(() => ({ limit: mockSelectLimit }));
const mockSelectFrom = jest.fn(() => ({ where: mockSelectWhere }));
const mockSelect = jest.fn(() => ({ from: mockSelectFrom }));

const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn(() => ({ set: mockUpdateSet }));

const mockInsertValues = jest.fn().mockResolvedValue(undefined);
const mockInsert = jest.fn(() => ({ values: mockInsertValues }));

const mockInsertReturning = jest.fn().mockResolvedValue([{ id: 99 }]);
const mockInsertLancValues = jest.fn(() => ({ returning: mockInsertReturning }));
const mockInsertLanc = jest.fn(() => ({ values: mockInsertLancValues }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => {
      const stack = new Error().stack ?? '';
      if (stack.includes('gerarLancamentos') || stack.includes('comissoesLancamento')) {
        return mockInsertLanc(...args);
      }
      return mockInsert(...args);
    },
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/configuracoes-sistema', () => ({
  configuracoesSistema: { chave: 'chave', valores: 'valores' },
}));
jest.mock('../../../../backend/src/db/schema/comissoes-lancamento', () => ({
  comissoesLancamento: {
    id: 'id',
    propostaId: 'proposta_id',
    beneficiarioUserId: 'beneficiario_user_id',
    papel: 'papel',
  },
}));
jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { id: 'id', status: 'status', valorTotal: 'valor_total', metadata: 'metadata' },
}));
jest.mock('../../../../backend/src/db/schema/acomodacoes', () => ({
  acomodacoes: { id: 'id', proprietarioId: 'proprietario_id' },
}));

jest.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => args,
  eq: (...args: unknown[]) => args,
  desc: (x: unknown) => x,
}));

import { comissoesService } from '../../../../server/modules/comissoes/services/comissoes.service';

describe('comissoes.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectLimit.mockResolvedValue([]);
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  describe('calcularSplitComissoes', () => {
    it('divide base entre plataforma, corretor e proprietário', () => {
      const split = calcularSplitComissoes(1000, { taxaPlataformaPct: 20, taxaCorretorPct: 5 }, { temCorretor: true });
      expect(split.plataforma).toEqual({ percentual: 20, valor: 200 });
      expect(split.corretor).toEqual({ percentual: 5, valor: 50 });
      expect(split.proprietario).toEqual({ percentual: 75, valor: 750 });
    });

    it('sem corretor: repasse proprietário absorve fatia do corretor', () => {
      const split = calcularSplitComissoes(1000, { taxaPlataformaPct: 20, taxaCorretorPct: 5 }, { temCorretor: false });
      expect(split.corretor.valor).toBe(0);
      expect(split.proprietario).toEqual({ percentual: 80, valor: 800 });
    });
  });

  describe('gerarLancamentos', () => {
    it('retorna module_disabled quando flag off', async () => {
      mockSelectLimit.mockResolvedValueOnce([{ valores: { comissoes_modulo_ativo: false } }]);
      const result = await comissoesService.gerarLancamentos(1);
      expect(result).toEqual({ generated: false, reason: 'module_disabled' });
    });

    it('retorna proposta_not_paid quando status não é paid', async () => {
      mockSelectLimit
        .mockResolvedValueOnce([{ valores: { comissoes_modulo_ativo: true, taxa_plataforma_pct: 20, taxa_corretor_pct: 5 } }])
        .mockResolvedValueOnce([{ id: 1, status: 'accepted', valorTotal: '1000.00', metadata: { acomodacaoId: 10 } }]);
      const result = await comissoesService.gerarLancamentos(1);
      expect(result).toEqual({ generated: false, reason: 'proposta_not_paid' });
    });
  });

  describe('governança IA', () => {
    it('aprovarSugestao bloqueia mesmo usuário (duas etapas)', async () => {
      mockSelectLimit.mockResolvedValueOnce([
        {
          valores: {
            taxa_plataforma_pct: 20,
            taxa_corretor_pct: 5,
            sugestao_pendente: {
              taxa_plataforma_pct: 18,
              taxa_corretor_pct: 7,
              margem_proprietario_pct: 75,
              fonte: 'heuristica',
              confianca: 0.82,
              motivo: 'teste',
              solicitado_por_user_id: 1,
              solicitado_em: new Date().toISOString(),
              status: 'pendente_aprovacao',
            },
          },
        },
      ]);

      await expect(
        comissoesService.aprovarSugestao(1, { confirmouDiff: true }),
      ).rejects.toThrow('outro administrador');
    });

    it('aprovarSugestao bloqueia baixa confiança sem override', async () => {
      mockSelectLimit.mockResolvedValueOnce([
        {
          valores: {
            taxa_plataforma_pct: 20,
            taxa_corretor_pct: 5,
            sugestao_pendente: {
              taxa_plataforma_pct: 22,
              taxa_corretor_pct: 5,
              margem_proprietario_pct: 73,
              fonte: 'heuristica',
              confianca: 0.6,
              motivo: 'baixa',
              solicitado_por_user_id: 1,
              solicitado_em: new Date().toISOString(),
              status: 'pendente_aprovacao',
            },
          },
        },
      ]);

      await expect(
        comissoesService.aprovarSugestao(2, { confirmouDiff: true }),
      ).rejects.toThrow('Override explícito');
    });

    it('solicitarAprovacao persiste sugestao_pendente', async () => {
      mockSelectLimit
        .mockResolvedValueOnce([{ valores: { taxa_plataforma_pct: 20, taxa_corretor_pct: 5 } }])
        .mockResolvedValueOnce([{ valores: { taxa_plataforma_pct: 20, taxa_corretor_pct: 5 } }]);

      const result = await comissoesService.solicitarAprovacao(
        {
          taxaPlataformaPct: 18,
          taxaCorretorPct: 7,
          fonte: 'heuristica',
          confianca: 0.82,
          motivo: 'Captar corretores',
        },
        5,
      );

      expect(result.sugestaoPendente?.taxaPlataformaPct).toBe(18);
      expect(result.sugestaoPendente?.solicitadoPorUserId).toBe(5);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
