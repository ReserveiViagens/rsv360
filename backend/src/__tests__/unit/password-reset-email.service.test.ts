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
      process.env.PASSWORD_RESET_BASE_URL = 'https://www.reserveiviagens.com.br';
      expect(passwordReset.buildResetUrl('abc123')).toBe(
        'https://www.reserveiviagens.com.br/redefinir-senha?token=abc123'
      );
    });

    it('appends token when base already includes /redefinir-senha', () => {
      process.env.PASSWORD_RESET_BASE_URL = 'http://localhost:3000/redefinir-senha';
      expect(passwordReset.buildResetUrl('tok%2F')).toBe(
        'http://localhost:3000/redefinir-senha?token=tok%252F'
      );
    });

    it('falls back to PASSWORD_RESET_URL_BASE', () => {
      delete process.env.PASSWORD_RESET_BASE_URL;
      process.env.PASSWORD_RESET_URL_BASE = 'http://localhost:3005';
      expect(passwordReset.buildResetUrl('x')).toBe(
        'http://localhost:3005/redefinir-senha?token=x'
      );
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
});
