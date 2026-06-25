import type { NextApiRequest, NextApiResponse } from 'next';

/** Healthcheck leve para CI/Docker (sem auth, sem backend). */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true, service: 'turismo' });
}
