import { SignJWT, jwtVerify } from 'jose'

export interface AdminTokenPayload {
  sub: string
  role: 'admin'
  email?: string
}

const ADMIN_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 12

function getSecretKey() {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

export function getAdminTokenMaxAgeSeconds() {
  return ADMIN_TOKEN_MAX_AGE_SECONDS
}

export async function signAdminToken(payload: AdminTokenPayload) {
  const secretKey = getSecretKey()
  if (!secretKey) {
    throw new Error('ADMIN_JWT_SECRET nao configurado')
  }

  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_TOKEN_MAX_AGE_SECONDS}s`)
    .sign(secretKey)
}

export async function verifyAdminToken(token: string | undefined | null) {
  if (!token) return null
  const secretKey = getSecretKey()
  if (!secretKey) return null

  try {
    const { payload } = await jwtVerify(token, secretKey)
    if (payload.role !== 'admin') return null
    return payload
  } catch {
    return null
  }
}
