describe('password reset email (D2.8)', () => {
  const emailService = require('../../api/v1/auth/password-reset-email.service');
  const passwordReset = require('../../api/v1/auth/password-reset.service');

  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  describe('buildResetUrl', () => {
    it('uses PASSWORD_RESET_BASE_URL with /redefinir-senha path', () => {
      expect(
        passwordReset.buildResetUrl('abc123', {
          PASSWORD_RESET_BASE_URL: 'https://www.reserveiviagens.com.br',
        })
      ).toBe('https://www.reserveiviagens.com.br/redefinir-senha?token=abc123');
    });

    it('appends token when base already includes /redefinir-senha', () => {
      expect(
        passwordReset.buildResetUrl('tok%2F', {
          PASSWORD_RESET_BASE_URL: 'http://localhost:3000/redefinir-senha',
        })
      ).toBe('http://localhost:3000/redefinir-senha?token=tok%252F');
    });

    it('falls back to PASSWORD_RESET_URL_BASE (legacy alias of specific slot)', () => {
      expect(
        passwordReset.buildResetUrl('x', {
          PASSWORD_RESET_URL_BASE: 'http://localhost:3005',
        })
      ).toBe('http://localhost:3005/redefinir-senha?token=x');
    });

    it('falls back to NEXT_PUBLIC_PRIMARY_SITE_URL when specific base absent', () => {
      expect(
        passwordReset.buildResetUrl('x', {
          NEXT_PUBLIC_PRIMARY_SITE_URL: 'https://primary.example',
        })
      ).toBe('https://primary.example/redefinir-senha?token=x');
    });

    it('PASSWORD_RESET_BASE_URL wins over PRIMARY_SITE_URL', () => {
      expect(
        passwordReset.buildResetUrl('x', {
          PASSWORD_RESET_BASE_URL: 'https://reset.example',
          NEXT_PUBLIC_PRIMARY_SITE_URL: 'https://primary.example',
          PRIMARY_SITE_URL: 'https://primary-server.example',
        })
      ).toBe('https://reset.example/redefinir-senha?token=x');
    });

    it('ignores forged Host / X-Forwarded-Host style keys (never request Host)', () => {
      expect(
        passwordReset.buildResetUrl('x', {
          PASSWORD_RESET_BASE_URL: 'https://canonical.example',
          HOST: 'evil.example',
          HTTP_HOST: 'evil.example',
          X_FORWARDED_HOST: 'evil.example',
        })
      ).toBe('https://canonical.example/redefinir-senha?token=x');
    });

    it('production without base throws fail-closed (no localhost link)', () => {
      expect(() =>
        passwordReset.buildResetUrl('x', { NODE_ENV: 'production' })
      ).toThrow(passwordReset.PasswordResetBaseMissingError);

      let caught: unknown;
      try {
        passwordReset.buildResetUrl('x', { NODE_ENV: 'production' });
      } catch (error: unknown) {
        caught = error;
      }
      expect(caught).toMatchObject({
        code: 'PASSWORD_RESET_BASE_MISSING',
        name: 'PasswordResetBaseMissingError',
      });
      expect(caught).toEqual(
        expect.not.objectContaining({
          message: expect.stringMatching(/localhost/),
        })
      );
    });

    it('dev without base falls back to localhost:3000', () => {
      expect(
        passwordReset.buildResetUrl('x', { NODE_ENV: 'development' })
      ).toBe('http://localhost:3000/redefinir-senha?token=x');
    });

    it('does not use FRONTEND_URL (removed from chain; doc-only divergence)', () => {
      expect(
        passwordReset.buildResetUrl('x', {
          NODE_ENV: 'development',
          FRONTEND_URL: 'https://frontend-should-not-win.example',
        })
      ).toBe('http://localhost:3000/redefinir-senha?token=x');
    });
  });

  describe('sendPasswordResetEmail', () => {
    const baseArgs = {
      email: 'user@test.local',
      name: 'Test User',
      resetUrl: 'http://localhost:3000/redefinir-senha?token=secret',
      token: 'secret-token-value',
    };

    it('uses webhook when PASSWORD_RESET_EMAIL_WEBHOOK is set', async () => {
      process.env.PASSWORD_RESET_EMAIL_WEBHOOK = 'https://hooks.example.com/reset';
      process.env.PASSWORD_RESET_EMAIL_WEBHOOK_SECRET = 'hook-secret';
      delete process.env.SMTP_HOST;

      const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
      global.fetch = fetchMock as typeof fetch;

      const result = await emailService.sendPasswordResetEmail(baseArgs);

      expect(result).toEqual({ sent: true, mode: 'webhook' });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe('POST');
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer hook-secret');
      const body = JSON.parse(String(init.body));
      expect(body.to).toBe('user@test.local');
      expect(body.resetUrl).toContain('/redefinir-senha');
      expect(body.html).toContain('Redefinir senha');
    });

    it('uses SMTP when configured and webhook absent', async () => {
      delete process.env.PASSWORD_RESET_EMAIL_WEBHOOK;
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_USER = 'smtp-user';
      process.env.SMTP_PASS = 'smtp-pass';
      process.env.SMTP_FROM = 'noreply@rsv360.dev';

      const nodemailer = require('nodemailer');
      const sendMail = jest.fn().mockResolvedValue({ messageId: 'msg-1' });
      nodemailer.createTransport.mockReturnValue({ sendMail });

      const result = await emailService.sendPasswordResetEmail(baseArgs);

      expect(result.sent).toBe(true);
      expect(result.mode).toBe('smtp');
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.local',
          subject: expect.stringContaining('Recuperação'),
        })
      );
    });

    it('falls back to log mode when no transport configured', async () => {
      delete process.env.PASSWORD_RESET_EMAIL_WEBHOOK;
      delete process.env.SMTP_HOST;
      const logSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

      const result = await emailService.sendPasswordResetEmail(baseArgs);

      expect(result).toEqual({ sent: true, mode: 'log' });
      expect(logSpy).toHaveBeenCalled();
    });

    it('returns error mode without throwing when webhook fails', async () => {
      process.env.PASSWORD_RESET_EMAIL_WEBHOOK = 'https://hooks.example.com/fail';
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 502, text: async () => 'bad gateway' });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await emailService.sendPasswordResetEmail(baseArgs);

      expect(result.sent).toBe(false);
      expect(result.mode).toBe('error');
    });
  });

  describe('requestPasswordReset anti-enumeration (PR-16a)', () => {
    it('prod without base returns 503 before querying users', async () => {
      jest.resetModules();
      const queryDatabase = jest.fn();
      jest.doMock('../../api/v1/auth/refresh-token.service', () => ({
        queryDatabase,
        isDbRefreshEnabled: () => true,
        revokeAllUserTokens: jest.fn(),
      }));
      jest.doMock('../../api/v1/auth/password-reset-email.service', () => ({
        sendPasswordResetEmail: jest.fn(),
      }));

      delete process.env.PASSWORD_RESET_BASE_URL;
      delete process.env.PASSWORD_RESET_URL_BASE;
      delete process.env.NEXT_PUBLIC_PRIMARY_SITE_URL;
      delete process.env.PRIMARY_SITE_URL;
      delete process.env.FRONTEND_URL;
      process.env.NODE_ENV = 'production';

      jest.spyOn(console, 'error').mockImplementation(() => {});
      const { requestPasswordReset } = require('../../api/v1/auth/password-reset.service');
      const result = await requestPasswordReset('anyone@test.local');

      expect(result).toEqual({
        error: 'config',
        status: 503,
        message: 'Serviço de redefinição temporariamente indisponível',
      });
      expect(queryDatabase).not.toHaveBeenCalled();
    });
  });
});
