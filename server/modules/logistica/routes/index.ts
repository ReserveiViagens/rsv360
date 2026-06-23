import { Router } from 'express';
import { staffAuth } from '../../../middleware/auth.middleware';
import { logisticaService } from '../services/logistica.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'logistica', status: 'ok' });
});

router.get('/', ...staffAuth, async (_req, res) => {
  try {
    const data = await logisticaService.listSummary();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/transportes', ...staffAuth, async (_req, res) => {
  try {
    const data = await logisticaService.listTransportes();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/transportes', ...staffAuth, async (req, res) => {
  try {
    const created = await logisticaService.createTransporte(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/transportes/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await logisticaService.updateTransporte(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Transporte não encontrado' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/embarques', ...staffAuth, async (req, res) => {
  try {
    const data = await logisticaService.listEmbarques(
      req.query.travel_package_id ? Number(req.query.travel_package_id) : undefined,
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/embarques', ...staffAuth, async (req, res) => {
  try {
    const created = await logisticaService.createEmbarque(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/fornecedores', ...staffAuth, async (_req, res) => {
  try {
    const data = await logisticaService.listFornecedores();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/fornecedores', ...staffAuth, async (req, res) => {
  try {
    const created = await logisticaService.createFornecedor(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/fornecedores/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await logisticaService.updateFornecedor(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Fornecedor não encontrado' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/reservas', ...staffAuth, async (_req, res) => {
  try {
    const data = await logisticaService.listReservas();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/reservas', ...staffAuth, async (req, res) => {
  try {
    const created = await logisticaService.createReserva(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/reservas/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await logisticaService.updateReserva(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Reserva não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/vouchers', ...staffAuth, async (_req, res) => {
  try {
    const data = await logisticaService.listVouchers();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/vouchers', ...staffAuth, async (req, res) => {
  try {
    const created = await logisticaService.createVoucher(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/vouchers/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await logisticaService.updateVoucher(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Voucher não encontrado' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
