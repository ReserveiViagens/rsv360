/**
 * PR-06a — admin login: timing-safe password compare + in-memory rate limit/lockout.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminTokenMaxAgeSeconds, signAdminToken } from '@/lib/admin-token'
import { safeEqualPassword } from '@/lib/safe-equal-password'

const isDev = process.env.NODE_ENV === 'development'

const LOGIN_LIMIT = isDev
  ? { maxAttempts: 50, windowMs: 15 * 60 * 1000, blockDurationMs: 60 * 1000 }
  : { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 }

type Bucket = { count: number; windowStart: number; blockedUntil: number | null }

const buckets = new Map<string, Bucket>()

/** Test helper */
export function clearAdminLoginRateLimitStoreForTests() {
  buckets.clear()
}

export { safeEqualPassword }

function clientIp(request: NextRequest): string {
  const xf = request.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim() || 'unknown'
  return 'unknown'
}

function enforceAdminLoginRateLimit(ip: string): {
  allowed: boolean
  blockedUntil?: Date
} {
  const key = `admin-login:${ip}`
  const now = Date.now()
  let entry = buckets.get(key)

  if (!entry) {
    buckets.set(key, { count: 1, windowStart: now, blockedUntil: null })
    return { allowed: true }
  }

  if (entry.blockedUntil && entry.blockedUntil > now) {
    return { allowed: false, blockedUntil: new Date(entry.blockedUntil) }
  }

  if (entry.blockedUntil && entry.blockedUntil <= now) {
    entry = { count: 1, windowStart: now, blockedUntil: null }
    buckets.set(key, entry)
    return { allowed: true }
  }

  if (now - entry.windowStart > LOGIN_LIMIT.windowMs) {
    entry = { count: 1, windowStart: now, blockedUntil: null }
    buckets.set(key, entry)
    return { allowed: true }
  }

  if (entry.count >= LOGIN_LIMIT.maxAttempts) {
    entry.blockedUntil = now + LOGIN_LIMIT.blockDurationMs
    buckets.set(key, entry)
    return { allowed: false, blockedUntil: new Date(entry.blockedUntil) }
  }

  entry.count += 1
  buckets.set(key, entry)
  return { allowed: true }
}

function resetAdminLoginRateLimit(ip: string) {
  buckets.delete(`admin-login:${ip}`)
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request)
    const limit = enforceAdminLoginRateLimit(ip)
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Muitas tentativas. Tente novamente mais tarde.',
          blocked_until: limit.blockedUntil?.toISOString(),
        },
        { status: 429 },
      )
    }

    const body = await request.json()
    const password = String(body?.password ?? '')

    const configuredPassword = String(process.env.ADMIN_LOGIN_PASSWORD ?? '').trim()
    if (!configuredPassword) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_LOGIN_PASSWORD nao configurado no servidor.' },
        { status: 503 },
      )
    }

    if (!password || !safeEqualPassword(password, configuredPassword)) {
      return NextResponse.json({ success: false, error: 'Credenciais invalidas.' }, { status: 401 })
    }

    resetAdminLoginRateLimit(ip)

    const token = await signAdminToken({
      sub: 'admin',
      role: 'admin',
      email: process.env.ADMIN_LOGIN_EMAIL || 'admin@local',
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: getAdminTokenMaxAgeSeconds(),
    })
    return response
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao realizar login admin.' }, { status: 500 })
  }
}
