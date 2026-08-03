/**
 * PR-16c — CSP Report-Only collector (App Router).
 * Logs structured violation summary without PII; always 204.
 */
import { NextRequest, NextResponse } from 'next/server';

// Shared CJS helper (same module next.config.js requires).
const { handleCspViolationReport } = require('../../../../../packages/shared/security-headers.cjs') as {
  handleCspViolationReport: (raw: unknown) => { status: number };
};

export async function POST(request: NextRequest) {
  const text = await request.text().catch(() => '');
  const result = handleCspViolationReport(text);
  return new NextResponse(null, { status: result.status || 204 });
}

export async function GET() {
  return new NextResponse(null, { status: 405 });
}
