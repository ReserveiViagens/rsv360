import { Router } from 'express';
import { PIXService } from '../services/pix.service';

const router = Router();
const pixService = new PIXService();

router.post('/', async (req, res) => {
  try {
    const result = await pixService.createPIXCharge(req.body.enterpriseId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pixService.getPIXCharge(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const result = await pixService.cancelPIXCharge(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id/qrcode', async (req, res) => {
  try {
    const charge = await pixService.getPIXCharge(req.params.id);
    const qrCode = await pixService.generateQRCode(charge.qrCode);
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id/status', async (req, res) => {
  try {
    const status = await pixService.checkPIXStatus(req.params.id);
    res.json({ status });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pixService.listPIXCharges();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;