const { signJwt } = require('../api/v1/auth/jwt-verify');

export function getTestJwtSecret(): string {
  return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
}

export function signStaffToken(overrides?: {
  userId?: number;
  role?: string;
  email?: string;
  name?: string;
}): string {
  return signJwt(
    {
      userId: overrides?.userId ?? 1,
      email: overrides?.email ?? 'agent@test.local',
      name: overrides?.name ?? 'Agent Test',
      role: overrides?.role ?? 'admin',
    },
    getTestJwtSecret(),
    3600,
  );
}

export function authHeader(token?: string): { Authorization: string } {
  return { Authorization: `Bearer ${token ?? signStaffToken()}` };
}
