/**
 * PR-13a — shared auth + rate-limit gate for /api/ai-search/*.
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware, type AuthUser } from '@/lib/advanced-auth';
import {
  AI_SEARCH_MAX_INPUT_CHARS,
  checkAiSearchRateLimit,
  clientIpFromHeaders,
} from '@/lib/ai-search-rate-limit';

export type AiSearchGuardOk = { user: AuthUser; errorResponse?: undefined };
export type AiSearchGuardFail = { user?: undefined; errorResponse: NextResponse };

/**
 * Require Bearer JWT + per-user rate limit. Never fail-open.
 */
export async function requireAiSearchAccess(
  request: NextRequest,
): Promise<AiSearchGuardOk | AiSearchGuardFail> {
  const { user, error } = await advancedAuthMiddleware(request);
  if (error || !user) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 },
      ),
    };
  }

  const ip = clientIpFromHeaders((name) => request.headers.get(name));
  const rl = checkAiSearchRateLimit({ userId: user.id, ip });
  if (!rl.allowed) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Muitas requisições. Tente novamente em breve.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.retryAfterSec) },
        },
      ),
    };
  }

  return { user };
}

/**
 * Validate required string input length (message / query).
 * Returns NextResponse on failure, null when ok.
 */
export function validateAiSearchTextInput(
  value: unknown,
  fieldLabel: string,
): NextResponse | null {
  if (value === undefined || value === null || typeof value !== 'string') {
    return NextResponse.json(
      { success: false, error: `${fieldLabel} é obrigatória` },
      { status: 400 },
    );
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return NextResponse.json(
      { success: false, error: `${fieldLabel} é obrigatória` },
      { status: 400 },
    );
  }
  if (trimmed.length > AI_SEARCH_MAX_INPUT_CHARS) {
    return NextResponse.json(
      {
        success: false,
        error: `${fieldLabel} excede o limite de ${AI_SEARCH_MAX_INPUT_CHARS} caracteres`,
      },
      { status: 400 },
    );
  }
  return null;
}
