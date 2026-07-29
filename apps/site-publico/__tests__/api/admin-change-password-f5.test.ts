/**
 * F5 — admin change-password proxy binds email from cookie (anti-IDOR).
 */
import type { NextRequest } from 'next/server'

const verifyAdminApiRequest = jest.fn()

jest.mock('@/lib/admin-api-auth', () => ({
  verifyAdminApiRequest: (...args: unknown[]) => verifyAdminApiRequest(...args),
}))

function mockRequest(body: Record<string, unknown>): NextRequest {
  return {
    json: async () => body,
    headers: {
      get: (name: string) => {
        const key = name.toLowerCase()
        if (key === 'x-forwarded-for') return '127.0.0.1'
        if (key === 'user-agent') return 'jest'
        return null
      },
    },
    cookies: { get: () => undefined },
  } as unknown as NextRequest
}

describe('POST /api/admin/auth/change-password (F5)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    verifyAdminApiRequest.mockReset()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns 401 without admin session', async () => {
    verifyAdminApiRequest.mockResolvedValue(null)
    const { POST } = await import('@/app/api/admin/auth/change-password/route')
    const res = await POST(
      mockRequest({
        current_password: 'x',
        new_password: 'yyyyyyyy',
        totp_code: '123456',
      }),
    )
    expect(res.status).toBe(401)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('forwards email from JWT, never from body', async () => {
    verifyAdminApiRequest.mockResolvedValue({
      sub: '40',
      role: 'admin',
      email: 'owner@example.com',
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'Senha alterada. Faça login novamente.' }),
    })

    const { POST } = await import('@/app/api/admin/auth/change-password/route')
    const res = await POST(
      mockRequest({
        email: 'attacker@evil.example',
        current_password: 'current-secret',
        new_password: 'new-secret-ok',
        totp_code: '654321',
      }),
    )
    expect(res.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [, init] = (global.fetch as jest.Mock).mock.calls[0]
    const sent = JSON.parse(String(init.body))
    expect(sent.email).toBe('owner@example.com')
    expect(sent.email).not.toBe('attacker@evil.example')
  })
})
