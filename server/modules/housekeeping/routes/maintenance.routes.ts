import { Router } from 'express';
import { requireRole } from '../middleware/hk-auth.middleware';
import { maintenanceService } from '../services/maintenance.service';
import { asRequiredString } from '../../../lib/parse';

const router = Router();
const auth = requireRole('admin', 'manager', 'staff', 'housekeeper');

router.get('/', auth, async (req, res) => {
  try {
    res.json(await maintenanceService.listMaintenanceOrders(req.query as Record<string, any>));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    res.json(await maintenanceService.createOrder(req.body));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/stats', auth, async (_req, res) => {
  try {
    res.json(await maintenanceService.getStats());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    res.json(await maintenanceService.getMaintenanceOrderById(asRequiredString(req.params.id)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    res.json(await maintenanceService.updateMaintenanceOrder(asRequiredString(req.params.id), req.body));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/assign', auth, async (req, res) => {
  try {
    res.json(await maintenanceService.assignOrder(asRequiredString(req.params.id), req.body.userId));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/start', auth, async (req, res) => {
  try {
    res.json(await maintenanceService.startOrder(asRequiredString(req.params.id)));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    res.json(await maintenanceService.completeOrder(asRequiredString(req.params.id), req.body.resolution, req.body.actualCost));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/cancel', auth, async (req, res) => {
  try {
    res.json(await maintenanceService.cancelOrder(asRequiredString(req.params.id), req.body.reason));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;

module.exports = router;

