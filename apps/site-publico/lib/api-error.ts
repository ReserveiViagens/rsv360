/**
 * PR-05a — generic API error response (never leak error.message to clients).
 */
import { NextResponse } from 'next/server';

export const INTERNAL_SERVER_ERROR_BODY = {
  success: false as const,
  error: 'Internal server error' as const,
};

/** Log server-side detail; return opaque 500 JSON. */
export function jsonInternalError(
  error: unknown,
  context: string = 'api_error',
): NextResponse {
  const detail =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { message: String(error) };
  console.error(
    JSON.stringify({
      level: 'error',
      context,
      ...detail,
    }),
  );
  return NextResponse.json(INTERNAL_SERVER_ERROR_BODY, { status: 500 });
}
