import request from 'supertest';
import crypto from 'crypto';
import express from 'express';
import { authRouter } from '../../api/v1/auth/routes';

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth pilot numeric userId (pre PR-C 4a)', () => {
  const app = buildAuthApp();
  const originalDbUrl = process.env.DATABASE_URL;
  const originalPilot = process.env.AUTH_PILOT_ENABLED;

  afterEach(() => {
    if (originalDbUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDbUrl;
    }
    process.env.AUTH_PILOT_ENABLED = originalPilot;
  });

  it('emits finite numeric userId stable for the same email', async () => {
    delete process.env.DATABASE_URL;
    process.env.AUTH_PILOT_ENABLED = 'true';

    const email = 'Pilot.User@Example.COM';
    const expectedId = parseInt(
      crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 12),
      16,
    );

    const first = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'secret' });
    const second = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'secret' });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const id1 = first.body.data.user.id;
    const id2 = second.body.data.user.id;
    expect(typeof id1).toBe('number');
    expect(Number.isFinite(id1)).toBe(true);
    expect(id1).toBe(expectedId);
    expect(id2).toBe(id1);
    expect(id1).toBeGreaterThan(1e12);
  });
});
