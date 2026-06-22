import { NextRequest, NextResponse } from 'next/server';

/** Server-only: backend base URL for auth v1 BFF proxy (T1.8). */
export function getAuthBackendBaseUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3002'
  );
}

export async function proxyAuthV1(
  path: string,
  request: NextRequest,
  options?: { method?: string }
): Promise<NextResponse> {
  const backend = getAuthBackendBaseUrl().replace(/\/$/, '');
  const url = `${backend}${path}`;
  const method = options?.method ?? request.method;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.set('Authorization', authorization);
  }

  let body: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await request.text();
  }

  const upstream = await fetch(url, { method, headers, body });
  const responseBody = await upstream.text();
  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) {
    responseHeaders.set('Content-Type', upstreamType);
  }

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
