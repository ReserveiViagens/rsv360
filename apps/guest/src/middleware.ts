/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PORTAL_TOKEN_COOKIE } from './lib/portal-session';

const publicRoutes = new Set([
  '/login',
  '/politica-de-privacidade',
  '/politica-de-cookies',
  '/termos-de-uso',
  '/404',
]);

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const token = request.cookies.get(PORTAL_TOKEN_COOKIE)?.value;
  const isPublicRoute = publicRoutes.has(pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    if (searchParams.has('token')) {
      loginUrl.searchParams.set('token', searchParams.get('token') || '');
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
