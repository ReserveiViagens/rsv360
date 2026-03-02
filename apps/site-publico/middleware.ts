import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-token'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const response = NextResponse.next()

  // Corrigir URL malformada: group-travel + http://... (concatenação incorreta)
  // Ex: /group-travelhttp:/localhost:3000/group-travel/trip-planning -> /group-travel/trip-planning
  if (pathname.includes('group-travelhttp')) {
    const correctPathMatch = pathname.match(/.*(\/group-travel\/[^?]*)/)
    if (correctPathMatch) {
      const url = req.nextUrl.clone()
      url.pathname = correctPathMatch[1]
      return NextResponse.redirect(url)
    }
  }

  // Protect admin area except the login page
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = req.cookies.get('admin_token')?.value
    const adminPayload = await verifyAdminToken(adminToken)
    if (!adminPayload) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  const userProtectedRoutes = ['/perfil', '/minhas-reservas', '/dashboard', '/dashboard-rsv', '/pricing/dashboard']
  const requiresUserAuth = userProtectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (requiresUserAuth) {
    const userToken = req.cookies.get('auth_token')?.value
    const adminToken = req.cookies.get('admin_token')?.value
    const adminPayload = await verifyAdminToken(adminToken)
    const hasAccess = Boolean(userToken || adminPayload)
    if (!hasAccess) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Nota: Métricas removidas do middleware porque prom-client não é compatível com Edge Runtime
  // As métricas devem ser coletadas nas rotas de API usando withMetrics() diretamente
  return response
}

export const config = {
  // Proteger apenas rotas sensíveis
  matcher: [
    '/admin/:path*',
    '/perfil',
    '/minhas-reservas',
    '/dashboard/:path*',
    '/dashboard-rsv',
    '/pricing/dashboard/:path*',
  ],
}
