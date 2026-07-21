import express from 'express';
import request from 'supertest';

const { signJwt } = require('../../api/v1/auth/jwt-verify');
const { authenticateJwt, requireRole } = require('../../../../server/middleware/auth.middleware');
const { requireRole: hkRequireRole } = require('../../../../server/modules/housekeeping/middleware/hk-auth.middleware');

const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function bearer(role: string, userId = 42) {
  const token = signJwt(
    { userId, email: 't@test.com', name: 'T', role, enterpriseId: 'ent_1' },
    secret,
    900,
  );
  return `Bearer ${token}`;
}

/** Minimal fail-closed router mirroring PR-01 pattern (staff). */
function buildStaffApp(path = '/resource') {
  const app = express();
  const router = express.Router();
  router.get('/health', (_req, res) => res.json({ ok: true }));
  router.use(authenticateJwt);
  router.use(requireRole('admin', 'manager'));
  router.get(path, (_req, res) => res.json({ ok: true }));
  app.use('/api/mod', router);
  return app;
}

/** Housekeeping: JWT then role from token only (header spoof ignored). */
function buildHkApp() {
  const app = express();
  const router = express.Router();
  router.get('/health', (_req, res) => res.json({ ok: true }));
  router.use(authenticateJwt);
  const auth = hkRequireRole('admin', 'manager', 'staff', 'housekeeper');
  router.get('/tasks', auth, (_req, res) => res.json({ ok: true }));
  app.use('/api/housekeeping', router);
  return app;
}

describe('PR-01 — crit routes auth (fail-closed + negative asserts)', () => {
  describe('staff modules (payments/crm/revenue/multi-property/admin-portal pattern)', () => {
    const app = buildStaffApp();

    it('explicit public health → 200 without token', async () => {
      const res = await request(app).get('/api/mod/health');
      expect(res.status).toBe(200);
    });

    it('no token → 401', async () => {
      const res = await request(app).get('/api/mod/resource');
      expect(res.status).toBe(401);
    });

    it('wrong role (user) → 403', async () => {
      const res = await request(app)
        .get('/api/mod/resource')
        .set('Authorization', bearer('user'));
      expect(res.status).toBe(403);
    });

    it('valid staff token (admin) → 200', async () => {
      const res = await request(app)
        .get('/api/mod/resource')
        .set('Authorization', bearer('admin'));
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('housekeeping — ignore x-user-role spoof', () => {
    const app = buildHkApp();

    it('no token → 401 even with x-user-role: admin', async () => {
      const res = await request(app)
        .get('/api/housekeeping/tasks')
        .set('x-user-role', 'admin');
      expect(res.status).toBe(401);
    });

    it('token role=user + spoofed x-user-role: admin → 403', async () => {
      const res = await request(app)
        .get('/api/housekeeping/tasks')
        .set('Authorization', bearer('user'))
        .set('x-user-role', 'admin');
      expect(res.status).toBe(403);
    });

    it('valid housekeeper JWT → 200 (header not required)', async () => {
      const res = await request(app)
        .get('/api/housekeeping/tasks')
        .set('Authorization', bearer('housekeeper'));
      expect(res.status).toBe(200);
    });
  });
});
