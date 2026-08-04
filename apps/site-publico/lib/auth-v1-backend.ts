import { NextRequest, NextResponse } from 'next/server';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TRANSPORT_HEADER,
  getRefreshTokenCookieOptions,
  stripRefreshTokenFromAuthPayload,
} from '@rsv360/shared';

/** Server-only: backend base URL for auth v1 BFF proxy (T1.8). */
export function getAuthBackendBaseUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3002'
  );
}

function shouldManageRefreshCookie(path: string): boolean {
  return (
    path === '/api/v1/auth/login' ||
    path === '/api/v1/auth/refresh' ||
    path === '/api/v1/auth/logout'
  );
}

function extractRefreshFromJson(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const root = payload as Record<string, unknown>;
  if (typeof root.refresh_token === 'string' && root.refresh_token.trim()) {
    return root.refresh_token;
  }
  if (root.data && typeof root.data === 'object') {
    const data = root.data as Record<string, unknown>;
    if (typeof data.refresh_token === 'string' && data.refresh_token.trim()) {
      return data.refresh_token;
    }
  }
  return undefined;
}

/**
 * BFF proxy for /api/v1/auth/* (T1.8 + PR-10c-pré-a HttpOnly refresh cookie).
 * - Forwards cookie → body to backend with X-RSV-Refresh-Transport
 * - Sets/clears rsv360_refresh_token on login/refresh/logout
 * - Strips refresh_token from JSON returned to the browser
 */
export async function proxyAuthV1(
  path: string,
  request: NextRequest,
  options?: { method?: string },
): Promise<NextResponse> {
  const backend = getAuthBackendBaseUrl().replace(/\/$/, '');
  const url = `${backend}${path}`;
  const method = options?.method ?? request.method;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  } else if (method !== 'GET' && method !== 'HEAD') {
    headers.set('Content-Type', 'application/json');
  }
  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.set('Authorization', authorization);
  }
  // PR-10c-a2 — forward DPoP so AS can bind cnf.jkt (htu is upstream URL from client).
  const dpop = request.headers.get('dpop');
  if (dpop) {
    headers.set('DPoP', dpop);
  }

  let body: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const raw = await request.text();
    if (path === '/api/v1/auth/refresh' || path === '/api/v1/auth/logout') {
      let parsed: Record<string, unknown> = {};
      if (raw.trim()) {
        try {
          parsed = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          parsed = {};
        }
      }
      const cookieRefresh = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
      const bodyRefresh =
        typeof parsed.refresh_token === 'string' && parsed.refresh_token.trim()
          ? parsed.refresh_token
          : undefined;

      if (cookieRefresh) {
        parsed.refresh_token = cookieRefresh;
        headers.set(REFRESH_TRANSPORT_HEADER, 'bff-cookie');
      } else if (bodyRefresh) {
        headers.set(REFRESH_TRANSPORT_HEADER, 'bff-body-legacy');
      }
      body = JSON.stringify(parsed);
    } else {
      body = raw || undefined;
    }
  }

  const upstream = await fetch(url, { method, headers, body });
  const responseBody = await upstream.text();
  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) {
    responseHeaders.set('Content-Type', upstreamType);
  }

  let outBody = responseBody;
  let setRefresh: string | undefined;
  let clearRefresh = false;

  if (shouldManageRefreshCookie(path) && upstreamType?.includes('json')) {
    try {
      const json = JSON.parse(responseBody) as unknown;
      const ok =
        upstream.ok &&
        !(
          json &&
          typeof json === 'object' &&
          (json as { success?: boolean }).success === false
        );

      if (path === '/api/v1/auth/logout') {
        clearRefresh = true;
      } else if (ok) {
        setRefresh = extractRefreshFromJson(json);
      }

      outBody = JSON.stringify(stripRefreshTokenFromAuthPayload(json));
    } catch {
      // Non-JSON or parse error — pass through upstream body.
    }
  }

  const response = new NextResponse(outBody, {
    status: upstream.status,
    headers: responseHeaders,
  });

  if (setRefresh) {
    response.cookies.set(
      REFRESH_TOKEN_COOKIE_NAME,
      setRefresh,
      getRefreshTokenCookieOptions(),
    );
  }
  if (clearRefresh) {
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, '', {
      ...getRefreshTokenCookieOptions(),
      maxAge: 0,
    });
  }

  return response;
}
