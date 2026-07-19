jest.mock('../../../../server/modules/acomodacoes/import/pipeline', () => ({
  pipelineImportacao: jest.fn().mockResolvedValue({
    dryRun: true,
    total: 1,
    sucesso: 1,
    erros: 0,
    linhas: [],
    formato: 'csv',
    errosNormalizacao: [],
    ignorados: 0,
  }),
  ImportVazioError: class ImportVazioError extends Error {
    readonly code = 'IMPORT_VAZIO';
    readonly statusCode = 422;
  },
}));

jest.mock('../../../../server/queues/importacoes.queue', () => ({
  enfileirarImportacao: jest.fn().mockResolvedValue('job-e4'),
}));

jest.mock('../../../../server/modules/acomodacoes/import/modelo', () => ({
  gerarModeloXlsxBuffer: jest.fn().mockReturnValue(Buffer.from('xlsx')),
}));

jest.mock('../../../../server/middleware/auth.middleware', () => ({
  authenticateJwt: (
    req: { headers: Record<string, string | undefined>; user?: unknown },
    res: { status: (n: number) => { json: (b: unknown) => void } },
    next: () => void,
  ) => {
    const role = req.headers['x-test-role'];
    const userId = req.headers['x-test-user-id'];
    if (!role || !userId) {
      return res.status(401).json({ success: false, error: 'Token ausente' });
    }
    req.user = { id: Number(userId), role, email: 't@test.com', name: 'Test' };
    next();
  },
  requireRole:
    (...roles: string[]) =>
    (
      req: { user?: { role?: string } },
      res: { status: (n: number) => { json: (b: unknown) => void } },
      next: () => void,
    ) => {
      if (!req.user?.role || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }
      next();
    },
}));

import express from 'express';
import request from 'supertest';
import importRouter from '../../../../server/modules/acomodacoes/routes/import.routes';
import { pipelineImportacao } from '../../../../server/modules/acomodacoes/import/pipeline';

describe('E4=A — import dead partner code removed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('admin preview não envia maxLinhasParceiro nem proprietarioId implícito de role', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/acomodacoes/import', importRouter);

    const res = await request(app)
      .post('/api/v1/acomodacoes/import/preview')
      .set({ 'x-test-role': 'admin', 'x-test-user-id': '9' })
      .attach('file', Buffer.from('codigo_externo\nX'), 't.csv');

    expect(res.status).toBe(200);
    expect(pipelineImportacao).toHaveBeenCalled();
    const opts = (pipelineImportacao as jest.Mock).mock.calls[0][2];
    expect(opts).not.toHaveProperty('maxLinhasParceiro');
    expect(opts.proprietarioId).toBeNull();
  });

  it('anfitriao continua 403 (RBAC D1 intacto)', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1/acomodacoes/import', importRouter);

    const res = await request(app)
      .post('/api/v1/acomodacoes/import/preview')
      .set({ 'x-test-role': 'anfitriao', 'x-test-user-id': '3' })
      .attach('file', Buffer.from('codigo_externo\nX'), 't.csv');

    expect(res.status).toBe(403);
    expect(pipelineImportacao).not.toHaveBeenCalled();
  });
});
