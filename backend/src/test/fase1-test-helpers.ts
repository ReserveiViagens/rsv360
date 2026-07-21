const { signJwt } = require('../api/v1/auth/jwt-verify');
const { getJwtSecret } = require('@rsv360/shared');

export function getTestJwtSecret(): string {
  return getJwtSecret();
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
