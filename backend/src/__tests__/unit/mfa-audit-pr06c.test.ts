/**
 * PR-06c — MFA audit emits required events without secrets.
 */
describe('mfa-audit (PR-06c)', () => {
  it('emits all 8 event names as structured JSON without code/secret fields', () => {
    jest.resetModules();
    const info = jest.spyOn(console, 'info').mockImplementation(() => {});
    const { emitMfaAudit, MFA_EVENTS } = require('../../api/v1/auth/mfa-audit');

    expect(MFA_EVENTS).toHaveLength(8);

    for (const event of MFA_EVENTS) {
      emitMfaAudit(event, {
        userId: 42,
        role: 'admin',
        ip: '203.0.113.10',
        userAgent: 'jest',
        surface: 'staff-db',
        // Attempt to smuggle secrets — must not appear as dedicated fields in schema
        code: '123456',
        secret: 'SHOULD_NOT_LOG',
        backup_code: 'abcd-efgh',
      });
    }

    expect(info).toHaveBeenCalledTimes(8);
    for (const call of info.mock.calls) {
      const line = String(call[0]);
      expect(line).toContain('[AUTH][MFA-AUDIT]');
      expect(line).not.toContain('SHOULD_NOT_LOG');
      expect(line).not.toContain('abcd-efgh');
      // payload is JSON after prefix
      const json = line.replace('[AUTH][MFA-AUDIT] ', '');
      const parsed = JSON.parse(json);
      expect(parsed.userId).toBe('42');
      expect(parsed.role).toBe('admin');
      expect(parsed.ip).toBe('203.0.113.10');
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.code).toBeUndefined();
      expect(parsed.secret).toBeUndefined();
      expect(parsed.backup_code).toBeUndefined();
    }

    info.mockRestore();
  });
});
