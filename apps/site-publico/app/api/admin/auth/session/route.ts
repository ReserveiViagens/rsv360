import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-token'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const payload = await verifyAdminToken(token)

  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    role: payload.role,
    sub: payload.sub,
  })
}
