/**
 * PR-16c — CSP Report-Only collector (Pages Router).
 * Logs structured violation summary without PII; always 204.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

const { handleCspViolationReport } = require('../../../packages/shared/security-headers.cjs') as {
  handleCspViolationReport: (raw: unknown) => { status: number };
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '32kb',
    },
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const raw =
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  const result = handleCspViolationReport(raw);
  return res.status(result.status || 204).end();
}
