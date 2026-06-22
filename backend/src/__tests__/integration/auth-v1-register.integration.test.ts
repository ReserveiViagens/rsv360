import request from 'supertest';
import express from 'express';
import { authRouter } from '../../api/v1/auth/routes';

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  return app;
}

describe('auth v1 register', () => {
  const app = buildAuthApp();
  const originalDbUrl = process.env.DATABASE_URL;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalDbUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDbUrl;
    }
  });

  it('returns 501 when DATABASE_URL is unset', async () => {
    delete process.env.DATABASE_URL;

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Novo', email: 'new@test.com', password: 'secret123' });

    expect(response.status).toBe(501);
  });

  it('returns 400 when required fields are missing', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const register = require('../../api/v1/auth/register.service');
    jest.spyOn(register, 'registerWithDatabase').mockResolvedValue({
      error: 'validation',
      status: 400,
      message: 'Nome, e-mail e senha são obrigatórios',
    });

    const response = await request(app).post('/api/v1/auth/register').send({ email: 'a@test.com' });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns 409 when email already exists', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const register = require('../../api/v1/auth/register.service');
    jest.spyOn(register, 'registerWithDatabase').mockResolvedValue({
      error: 'email_exists',
      status: 409,
      message: 'E-mail já cadastrado',
    });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dup',
        email: 'dup@test.com',
        password: 'secret123',
        password_confirmation: 'secret123',
      });

    expect(response.status).toBe(409);
  });

  it('returns 201 with user on success', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const register = require('../../api/v1/auth/register.service');
    jest.spyOn(register, 'registerWithDatabase').mockResolvedValue({
      user: {
        id: 42,
        name: 'Novo User',
        email: 'novo@test.com',
        role: 'user',
        enterpriseId: 'ent_1',
        status: 'active',
        two_factor_enabled: false,
        created_at: '2026-06-22T00:00:00.000Z',
        updated_at: '2026-06-22T00:00:00.000Z',
      },
    });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Novo User',
        email: 'novo@test.com',
        password: 'secret123',
        password_confirmation: 'secret123',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('novo@test.com');
    expect(response.body.data.access_token).toBeUndefined();
  });
});
