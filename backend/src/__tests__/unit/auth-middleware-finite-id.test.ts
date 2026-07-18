import express from 'express';
import request from 'supertest';

const { signJwt } = require('../../api/v1/auth/jwt-verify');
const { authenticateJwt, optionalJwt } = require('../../../../server/middleware/auth.middleware');

function buildApp(middleware: typeof authenticateJwt) {
  const app = express();
  app.get('/protected', middleware, (req, res) => {
    res.json({ ok: true, userId: req.user?.id });
  });
  return app;
}

function bearer(userId: string | number) {
  const secret = process.env.JWT_SECRET || 'REDACTED_JWT_SECRET';
  const token = signJwt(
    { userId, email: 't@test.com', name: 'T', role: 'admin', enterpriseId: 'ent_1' },
    secret,
    900,
  );
  return `Bearer ${token}`;
}

describe('auth.middleware — finite user id guard', () => {
  it('authenticateJwt accepts finite numeric userId', async () => {
    const res = await request(buildApp(authenticateJwt))
      .get('/protected')
      .set('Authorization', bearer(42));
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(42);
  });

  it('authenticateJwt rejects non-numeric userId with 401', async () => {
    const res = await request(buildApp(authenticateJwt))
      .get('/protected')
      .set('Authorization', bearer('fb98d44ad750'));
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, error: 'Token inválido ou expirado' });
  });

  it('optionalJwt rejects non-numeric userId with 401 when token present', async () => {
    const res = await request(buildApp(optionalJwt))
      .get('/protected')
      .set('Authorization', bearer('not-a-number'));
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, error: 'Token inválido ou expirado' });
  });

  it('optionalJwt allows missing token', async () => {
    const res = await request(buildApp(optionalJwt)).get('/protected');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.userId).toBeUndefined();
  });
});
