import type { NextApiRequest, NextApiResponse } from 'next';

/** Healthcheck leve para CI/Docker (sem auth, sem backend). */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      ok: false,
      status: 'error',
      error: 'Method not allowed',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    ok: true,
    status: 'ok',
    service: 'turismo',
    message: 'RSV 360 Frontend está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
}
