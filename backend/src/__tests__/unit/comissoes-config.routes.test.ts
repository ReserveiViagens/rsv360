const mockGetConfig = jest.fn();
const mockSalvarConfig = jest.fn();
const mockSolicitarAprovacao = jest.fn();
const mockAprovarSugestao = jest.fn();
const mockRejeitarSugestao = jest.fn();
const mockSugerir = jest.fn();

jest.mock('../../../../server/modules/comissoes/services/comissoes.service', () => ({
  comissoesService: {
    getConfig: (...args: unknown[]) => mockGetConfig(...args),
    salvarConfig: (...args: unknown[]) => mockSalvarConfig(...args),
    solicitarAprovacao: (...args: unknown[]) => mockSolicitarAprovacao(...args),
    aprovarSugestao: (...args: unknown[]) => mockAprovarSugestao(...args),
    rejeitarSugestao: (...args: unknown[]) => mockRejeitarSugestao(...args),
  },
}));

jest.mock('../../../../server/modules/comissoes/services/comissoes-ia-suggest', () => ({
  sugerirPercentuaisComissoes: (...args: unknown[]) => mockSugerir(...args),
}));

jest.mock('../../../../server/middleware/auth.middleware', () => ({
  authenticateJwt: (req: { user?: { id: number } }, _res: unknown, next: () => void) => {
    req.user = { id: 2, role: 'admin' } as { id: number; role: string };
    next();
  },
  requireRole: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import express from 'express';
import request from 'supertest';
import comissoesRouter from '../../../../server/modules/comissoes/routes/index';

describe('comissoes /config admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfig.mockResolvedValue({
      comissoesModuloAtivo: false,
      taxaPlataformaPct: 20,
      taxaCorretorPct: 5,
      margemProprietarioPct: 75,
      governanca: { confiancaMinima: 0.75, aprovacaoDuasEtapas: true },
    });
    mockSalvarConfig.mockResolvedValue({
      comissoesModuloAtivo: true,
      taxaPlataformaPct: 20,
      taxaCorretorPct: 5,
      margemProprietarioPct: 75,
      regraAplicada: {
        fonte: 'manual',
        atualizadoEm: new Date().toISOString(),
        marca: 'Reservei Viagens / RSV360',
        split: { plataforma: 20, corretor: 5, proprietario: 75 },
      },
      governanca: { confiancaMinima: 0.75, aprovacaoDuasEtapas: true },
    });
    mockSugerir.mockResolvedValue({
      taxaPlataformaPct: 20,
      taxaCorretorPct: 5,
      margemProprietarioPct: 75,
      fonte: 'oficial_reservei',
      confianca: 0.95,
      motivo: 'Split oficial Reservei.',
    });
    mockSolicitarAprovacao.mockResolvedValue({
      sugestaoPendente: {
        taxaPlataformaPct: 18,
        taxaCorretorPct: 7,
        margemProprietarioPct: 75,
        fonte: 'heuristica',
        confianca: 0.82,
        motivo: 'Captar corretores',
        solicitadoPorUserId: 2,
        solicitadoEm: new Date().toISOString(),
        status: 'pendente_aprovacao',
      },
    });
    mockAprovarSugestao.mockResolvedValue({
      comissoesModuloAtivo: true,
      taxaPlataformaPct: 18,
      taxaCorretorPct: 7,
      margemProprietarioPct: 75,
    });
    mockRejeitarSugestao.mockResolvedValue({
      comissoesModuloAtivo: false,
      taxaPlataformaPct: 20,
      taxaCorretorPct: 5,
      margemProprietarioPct: 75,
    });
  });

  it('PUT rejeita soma plataforma+corretor > 100', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/comissoes', comissoesRouter);

    const res = await request(app)
      .put('/api/v1/comissoes/config')
      .send({ taxaPlataformaPct: 90, taxaCorretorPct: 20 });

    expect(res.status).toBe(400);
    expect(mockSalvarConfig).not.toHaveBeenCalled();
  });

  it('PUT rejeita fonte ia (governança duas etapas)', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/comissoes', comissoesRouter);

    const res = await request(app)
      .put('/api/v1/comissoes/config')
      .send({ taxaPlataformaPct: 18, taxaCorretorPct: 7, fonte: 'ia', motivoIa: 'teste' });

    expect(res.status).toBe(400);
    expect(mockSalvarConfig).not.toHaveBeenCalled();
  });

  it('PUT salva percentuais manualmente', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/comissoes', comissoesRouter);

    const res = await request(app)
      .put('/api/v1/comissoes/config')
      .send({ taxaPlataformaPct: 20, taxaCorretorPct: 5, fonte: 'manual' });

    expect(res.status).toBe(200);
    expect(mockSalvarConfig).toHaveBeenCalledWith(
      expect.objectContaining({ taxaPlataformaPct: 20, taxaCorretorPct: 5, comissoesModuloAtivo: false }),
      expect.objectContaining({ fonte: 'manual' }),
    );
  });

  it('POST sugerir-percentuais retorna sugestao IA', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/comissoes', comissoesRouter);

    const res = await request(app)
      .post('/api/v1/comissoes/sugerir-percentuais')
      .send({ objetivo: 'padrao' });

    expect(res.status).toBe(200);
    expect(res.body.data.taxaPlataformaPct).toBe(20);
    expect(mockSugerir).toHaveBeenCalled();
  });

  it('POST solicitar-aprovacao persiste pendência', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/comissoes', comissoesRouter);

    const res = await request(app).post('/api/v1/comissoes/solicitar-aprovacao').send({
      taxaPlataformaPct: 18,
      taxaCorretorPct: 7,
      margemProprietarioPct: 75,
      fonte: 'heuristica',
      confianca: 0.82,
      motivo: 'Captar corretores',
    });

    expect(res.status).toBe(200);
    expect(mockSolicitarAprovacao).toHaveBeenCalledWith(
      expect.objectContaining({ taxaPlataformaPct: 18, taxaCorretorPct: 7 }),
      2,
    );
  });

  it('POST aprovar-sugestao exige confirmouDiff', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/comissoes', comissoesRouter);

    const res = await request(app).post('/api/v1/comissoes/aprovar-sugestao').send({});

    expect(res.status).toBe(400);
    expect(mockAprovarSugestao).not.toHaveBeenCalled();
  });

  it('POST aprovar-sugestao com diff confirmado', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/comissoes', comissoesRouter);

    const res = await request(app)
      .post('/api/v1/comissoes/aprovar-sugestao')
      .send({ confirmouDiff: true });

    expect(res.status).toBe(200);
    expect(mockAprovarSugestao).toHaveBeenCalledWith(2, { confirmouDiff: true, overrideBaixaConfianca: false });
  });
});
