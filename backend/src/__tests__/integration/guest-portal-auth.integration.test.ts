import request from 'supertest';
import express from 'express';
import { portalAuthMiddleware } from '../../../../server/modules/guest-portal/middleware/portal-auth.middleware';

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
      state: 'expired',
      reason: 'expired_at:2026-05-05T00:00:00.000Z',
      token: { id: 1 },
      booking: { id: 42 },
      guest: { id: 7 },
      bookingRef: '42',
    });

    const response = await request(buildApp())
      .get('/api/portal/booking')
      .set('X-Portal-Token', 'expired-token');

    expect(response.status).toBe(401);
    expect(guestPortalAuditService.recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'token_expired',
        token: 'expired-token',
        bookingRef: '42',
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
