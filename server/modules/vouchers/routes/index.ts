import { Router } from 'express';
import { publicLimiter } from '../../../middleware/public-limiter';
import { verificarVoucherPorQrToken, isQrVoucherError } from '../../propostas/services/qr-voucher.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'vouchers', status: 'ok' });
});

router.get('/verificar/:qrToken', publicLimiter, async (req, res) => {
  try {
    const data = await verificarVoucherPorQrToken(req.params.qrToken);
    res.json({ success: true, data });
  } catch (error) {
    if (isQrVoucherError(error)) {
      const err = error as Error & { statusCode?: number };
      return res.status(err.statusCode ?? 403).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;

module.exports = router;
