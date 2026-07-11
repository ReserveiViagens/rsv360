const mockGetConfig = jest.fn();
const mockSalvarConfig = jest.fn();
const mockSugerir = jest.fn();

jest.mock('../../../../server/modules/comissoes/services/comissoes.service', () => ({
  comissoesService: {
    getConfig: (...args: unknown[]) => mockGetConfig(...args),
    salvarConfig: (...args: unknown[]) => mockSalvarConfig(...args),
  },
}));

jest.mock('../../../../server/modules/comissoes/services/comissoes-ia-suggest', () => ({
  sugerirPercentuaisComissoes: (...args: unknown[]) => mockSugerir(...args),
}));

jest.mock('../../../../server/middleware/auth.middleware', () => ({
  authenticateJwt: (_req: unknown, _res: unknown, next: () => void) => next(),
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
    });
    mockSugerir.mockResolvedValue({
      taxaPlataformaPct: 20,
      taxaCorretorPct: 5,
      margemProprietarioPct: 75,
      fonte: 'oficial_reservei',
      confianca: 0.95,
      motivo: 'Split oficial Reservei.',
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
});
