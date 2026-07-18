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
}));

jest.mock('../../../../server/queues/importacoes.queue', () => ({
  enfileirarImportacao: jest.fn().mockResolvedValue('import-test-job'),
}));

jest.mock('../../../../server/modules/acomodacoes/import/modelo', () => ({
  gerarModeloXlsxBuffer: jest.fn().mockReturnValue(Buffer.from('xlsx-fixture')),
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
import { enfileirarImportacao } from '../../../../server/queues/importacoes.queue';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/acomodacoes/import', importRouter);
  return app;
}

function authHeaders(role: string, userId = 1) {
  return { 'x-test-role': role, 'x-test-user-id': String(userId) };
}

const DENIED_ROLES = ['user', 'anfitriao', 'corretor'] as const;
const ALLOWED_ROLES = ['admin', 'manager'] as const;

describe('D1 — RBAC import acomodações', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each(DENIED_ROLES)('role %s → 403', (role) => {
    it('GET /modelo.xlsx', async () => {
      const res = await request(buildApp())
        .get('/api/v1/acomodacoes/import/modelo.xlsx')
        .set(authHeaders(role));
      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ success: false, error: 'Acesso negado' });
    });

    it('POST /preview', async () => {
      const res = await request(buildApp())
        .post('/api/v1/acomodacoes/import/preview')
        .set(authHeaders(role))
        .attach('file', Buffer.from('codigo_externo\nX'), 't.csv');
      expect(res.status).toBe(403);
      expect(pipelineImportacao).not.toHaveBeenCalled();
    });

    it('POST /commit', async () => {
      const res = await request(buildApp())
        .post('/api/v1/acomodacoes/import/commit')
        .set(authHeaders(role))
        .attach('file', Buffer.from('codigo_externo\nX'), 't.csv');
      expect(res.status).toBe(403);
      expect(enfileirarImportacao).not.toHaveBeenCalled();
      expect(pipelineImportacao).not.toHaveBeenCalled();
    });
  });

  describe.each(ALLOWED_ROLES)('role %s → sucesso', (role) => {
    it('GET /modelo.xlsx → 200', async () => {
      const res = await request(buildApp())
        .get('/api/v1/acomodacoes/import/modelo.xlsx')
        .set(authHeaders(role));
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/spreadsheetml/);
    });

    it('POST /preview → 200', async () => {
      const res = await request(buildApp())
        .post('/api/v1/acomodacoes/import/preview')
        .set(authHeaders(role))
        .attach('file', Buffer.from('codigo_externo\nX'), 't.csv');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(pipelineImportacao).toHaveBeenCalled();
    });

    it('POST /commit async → 202', async () => {
      const res = await request(buildApp())
        .post('/api/v1/acomodacoes/import/commit')
        .set(authHeaders(role))
        .field('async', 'true')
        .attach('file', Buffer.from('codigo_externo\nX'), 't.csv');
      expect(res.status).toBe(202);
      expect(res.body).toMatchObject({
        success: true,
        data: { jobId: 'import-test-job', status: 'enqueued' },
      });
      expect(enfileirarImportacao).toHaveBeenCalled();
    });
  });
});
