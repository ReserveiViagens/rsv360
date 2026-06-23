import { NextRequest, NextResponse } from 'next/server';

/** Server-only backend base URL for Fase 1 BFF proxy. */
export function getFase1BackendBaseUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3002'
  ).replace(/\/$/, '');
}

export async function proxyFase1V1(
  modulePath: string,
  request: NextRequest,
  options?: { method?: string },
): Promise<NextResponse> {
  const backend = getFase1BackendBaseUrl();
  const url = `${backend}${modulePath}`;
  const method = options?.method ?? request.method;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const authorization = request.headers.get('authorization');
  if (authorization) headers.set('Authorization', authorization);

  let body: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await request.text();
  }

  const upstream = await fetch(url, { method, headers, body });
  const responseBody = await upstream.text();
  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) responseHeaders.set('Content-Type', upstreamType);

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
