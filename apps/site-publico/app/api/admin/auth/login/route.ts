import { NextRequest, NextResponse } from 'next/server'
import { getAdminTokenMaxAgeSeconds, signAdminToken } from '@/lib/admin-token'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const password = String(body?.password ?? '').trim()

    const configuredPassword = String(process.env.ADMIN_LOGIN_PASSWORD ?? '').trim()
    if (!configuredPassword) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_LOGIN_PASSWORD nao configurado no servidor.' },
        { status: 503 }
      )
    }

    if (!password || password !== configuredPassword) {
      return NextResponse.json({ success: false, error: 'Credenciais invalidas.' }, { status: 401 })
    }

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
