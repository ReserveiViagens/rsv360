import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirecionar URLs com caracteres especiais
  if (pathname === '/fidelização' || pathname === '/fidelizacao') {
    return NextResponse.redirect(new URL('/loyalty', request.url));
  }

  if (pathname === '/gestão') {
    return NextResponse.redirect(new URL('/gestao', request.url));
  }

  if (pathname === '/automação') {
    return NextResponse.redirect(new URL('/automacao', request.url));
  }

  if (pathname === '/editor-voucher' || pathname === '/editor-vouchers') {
    return NextResponse.redirect(new URL('/voucher-editor', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/fidelização',
    '/fidelizacao',
    '/fideliza%C3%A7%C3%A3o',
    '/gestão',
    '/gestao',
    '/automação',
    '/automa%C3%A7%C3%A3o',
    '/editor-voucher',
    '/editor-vouchers',
  ],
}; 