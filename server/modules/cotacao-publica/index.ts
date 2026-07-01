import type { Express, Request, Response } from 'express';
import cotacaoPublicaRouter from './routes/index';
import { cotacaoPublicaService } from './services/cotacao-publica.service';
import { publicLimiter } from '../../middleware/public-limiter';

async function handlePublicPropostaByToken(req: Request, res: Response) {
  try {
    const data = await cotacaoPublicaService.getPropostaByToken(req.params.token);
    if (!data) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}

export function registerCotacaoPublicaModule(app: Express) {
  app.use('/api/v1/cotacao-publica', cotacaoPublicaRouter);
  app.get('/api/v1/p/:token', publicLimiter, handlePublicPropostaByToken);
  console.log('[MODULE] Cotação Pública (wizard) + alias /api/v1/p registrado ✓');
}

module.exports = { registerCotacaoPublicaModule, cotacaoPublicaRouter };
