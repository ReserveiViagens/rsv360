import { Router } from 'express';
import { publicLimiter } from '../../../middleware/public-limiter';
import { getPontosByToken } from '../roteiro-pontos.service';

const router = Router();

router.get('/:token/pontos', publicLimiter, async (req, res) => {
  try {
    const token = String(req.params.token ?? '').trim();
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token inválido' });
    }

    const result = await getPontosByToken(token);

    if (result.kind === 'not_found') {
      return res.status(404).json({ success: false, error: 'Roteiro não encontrado' });
    }

    if (result.kind === 'forbidden') {
      return res.status(403).json({
        success: false,
        error: 'Acesso ao roteiro premium requer proposta aceita ou paga',
        propostaStatus: result.propostaStatus,
      });
    }

    return res.json({ success: true, data: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;

module.exports = router;
