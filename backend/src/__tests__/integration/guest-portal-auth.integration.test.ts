import request from 'supertest';
import express from 'express';
import { portalAuthMiddleware } from '../../../../server/modules/guest-portal/middleware/portal-auth.middleware';
import portalRouter from '../../../../server/modules/guest-portal/routes/portal.routes';
import { initPublicLimiter } from '../../../../server/middleware/public-limiter';

jest.mock('../../../../server/modules/guest-portal/services/token.service', () => ({
  tokenService: {
    validateToken: jest.fn(),
    inspectToken: jest.fn(),
  },
}));

jest.mock('../../../../server/modules/guest-portal/services/audit.service', () => ({
  guestPortalAuditService: {
    recordAuthEvent: jest.fn().mockResolvedValue(null),
  },
}));

const { tokenService } = require('../../../../server/modules/guest-portal/services/token.service');
const { guestPortalAuditService } = require('../../../../server/modules/guest-portal/services/audit.service');

describe('guest portal auth middleware', () => {
  beforeAll(async () => {
    // PR-06a: portal.routes mounts publicLimiter — fail-closed until init (H4).
    await initPublicLimiter();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(portalAuthMiddleware);
    app.get('/api/portal/booking', (_req, res) => {
      res.json({ ok: true });
    });
    return app;
  }

  function buildAuditApp() {
    const app = express();
    app.use(express.json());
    app.use('/api/portal', portalRouter);
    return app;
  }

  it('audits missing token before returning 401', async () => {
    tokenService.validateToken.mockResolvedValue(null);

    const response = await request(buildApp()).get('/api/portal/booking');

    expect(response.status).toBe(401);
    expect(guestPortalAuditService.recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'token_missing',
        reason: 'missing_token',
      }),
    );
  });

  it('audits invalid token state before returning 401', async () => {
    tokenService.validateToken.mockResolvedValue(null);
    tokenService.inspectToken.mockResolvedValue({
      state: 'invalid',
      reason: 'not_found',
      token: { id: 1 },
      booking: { id: 42 },
      guest: { id: 7 },
      bookingRef: '42',
    });

    const response = await request(buildApp())
      .get('/api/portal/booking')
      .set('X-Portal-Token', 'portal_does_not_exist_xyz');

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('inválido');
    expect(guestPortalAuditService.recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'token_invalid',
        token: 'portal_does_not_exist_xyz',
        bookingRef: '42',
      }),
    );
  });

  it('accepts public audit auth post and records missing token event', async () => {
    const response = await request(buildAuditApp()).post('/api/portal/audit/auth');

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    expect(guestPortalAuditService.recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'token_missing',
        reason: 'missing_token',
        requestPath: '/api/portal/audit/auth',
      }),
    );
  });

  it('audits valid token and continues request', async () => {
    tokenService.validateToken.mockResolvedValue({
      token: { id: 1 },
      booking: { id: 42 },
      guest: { id: 7 },
    });

    const response = await request(buildApp())
      .get('/api/portal/booking')
      .set('X-Portal-Token', 'valid-token');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(guestPortalAuditService.recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'token_valid',
        token: 'valid-token',
      }),
    );
  });
});
