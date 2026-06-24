import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-token';
import {
  buildPrimarySiteUrl,
  isLabApiPath,
  isLabUiPath,
  isMarketingLabMode,
  isStaticAssetPath,
} from '@/lib/app-mode';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isStaticAssetPath(pathname)) {
    return NextResponse.next();
  }

  // Corrigir URL malformada: group-travel + http://... (concatenação incorreta)
  if (pathname.includes('group-travelhttp')) {
    const correctPathMatch = pathname.match(/.*(\/group-travel\/[^?]*)/);
    if (correctPathMatch) {
      const url = req.nextUrl.clone();
      url.pathname = correctPathMatch[1];
      return NextResponse.redirect(url);
    }
  }

  if (isMarketingLabMode()) {
    if (isLabApiPath(pathname)) {
      return NextResponse.next();
    }

    if (pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/lab';
      return NextResponse.redirect(url);
    }

    if (!isLabUiPath(pathname)) {
      return NextResponse.redirect(buildPrimarySiteUrl(pathname, search));
    }
  }

  // Protect admin area except the login page
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = req.cookies.get('admin_token')?.value;
    const adminPayload = await verifyAdminToken(adminToken);
    if (!adminPayload) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  const userProtectedRoutes = [
    '/perfil',
    '/minhas-reservas',
    '/dashboard',
    '/dashboard-rsv',
    '/pricing/dashboard',
  ];
  const requiresUserAuth = userProtectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (requiresUserAuth) {
    const userToken = req.cookies.get('auth_token')?.value;
    const adminToken = req.cookies.get('admin_token')?.value;
    const adminPayload = await verifyAdminToken(adminToken);
    const hasAccess = Boolean(userToken || adminPayload);
    if (!hasAccess) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
