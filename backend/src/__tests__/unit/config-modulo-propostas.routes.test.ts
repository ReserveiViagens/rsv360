const mockObter = jest.fn();
const mockSalvar = jest.fn();

jest.mock('../../../../server/modules/configuracoes/config.service', () => ({
  ConfigService: {
    obterRegrasCotacao: (...args: unknown[]) => mockObter(...args),
    salvarRegrasCotacao: (...args: unknown[]) => mockSalvar(...args),
  },
}));

jest.mock('../../../../server/middleware/auth.middleware', () => ({
  authenticateJwt: (_req: unknown, _res: unknown, next: () => void) => next(),
  requireRole: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import express from 'express';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import request from 'supertest';
import configuracoesRouter from '../../../../server/modules/configuracoes/routes/index';

describe('configuracoes /modulo-propostas RBAC e API', () => {
  it('rotas modulo-propostas usam adminAuth (requireRole admin)', () => {
    const routesPath = resolve(
      __dirname,
      '../../../../server/modules/configuracoes/routes/index.ts',
    );
    const source = readFileSync(routesPath, 'utf8');
    expect(source).toContain("requireRole('admin')");
    expect(source).toContain("'/modulo-propostas', ...adminAuth");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockObter.mockResolvedValue({
      validadeCotacaoHoras: 48,
      urgenciaEstilo: 'countdown',
      avisoExpiracaoHoras: 2,
      permitirApenasHotel: true,
      disparoAutomatizadoCaldasAi: true,
      delayDisparoMinutos: 120,
    });
    mockSalvar.mockResolvedValue({
      validadeCotacaoHoras: 24,
      urgenciaEstilo: 'badge',
      avisoExpiracaoHoras: 2,
      permitirApenasHotel: true,
      disparoAutomatizadoCaldasAi: true,
      delayDisparoMinutos: 120,
    });
  });

  it('PUT rejeita urgenciaEstilo inválido', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/configuracoes', configuracoesRouter);

    const res = await request(app)
      .put('/api/v1/configuracoes/modulo-propostas')
      .send({ urgenciaEstilo: 'timer-fixo' });

    expect(res.status).toBe(400);
    expect(mockSalvar).not.toHaveBeenCalled();
  });

  it('GET /modulo-propostas retorna config de configuracoes_sistema', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/configuracoes', configuracoesRouter);

    const res = await request(app).get('/api/v1/configuracoes/modulo-propostas');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.validadeCotacaoHoras).toBe(48);
    expect(mockObter).toHaveBeenCalled();
  });

  it('PUT /modulo-propostas persiste partial e retorna merged', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/configuracoes', configuracoesRouter);

    const res = await request(app)
      .put('/api/v1/configuracoes/modulo-propostas')
      .send({ validadeCotacaoHoras: 24, urgenciaEstilo: 'badge' });

    expect(res.status).toBe(200);
    expect(res.body.data.validadeCotacaoHoras).toBe(24);
    expect(mockSalvar).toHaveBeenCalledWith({
      validadeCotacaoHoras: 24,
      urgenciaEstilo: 'badge',
    });
  });
});
