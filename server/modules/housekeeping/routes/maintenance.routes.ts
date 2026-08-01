import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { requireRole } from '../middleware/hk-auth.middleware';
import { maintenanceService } from '../services/maintenance.service';
import {
  HkAssignSchema,
  HkMaintenanceCancelSchema,
  HkMaintenanceCompleteSchema,
  HkMaintenanceCreateSchema,
  HkMaintenanceUpdateSchema,
  parsePositiveIntId,
} from '../schemas/housekeeping-write.schema';

const router = Router();
const auth = requireRole('admin', 'manager', 'staff', 'housekeeper');

function badRequest(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: error.flatten() });
  }
  return res.status(400).json({ error: (error as Error).message });
}

router.get('/', auth, async (req, res) => {
  try {
    res.json(await maintenanceService.listMaintenanceOrders(req.query as Record<string, any>));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const body = HkMaintenanceCreateSchema.parse(req.body);
    res.json(await maintenanceService.createOrder(body));
  } catch (error) {
    return badRequest(res, error);
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
    const id = parsePositiveIntId(req.params.id);
    res.json(await maintenanceService.getMaintenanceOrderById(id));
  } catch (error) {
    if (error instanceof ZodError) return badRequest(res, error);
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = HkMaintenanceUpdateSchema.parse(req.body);
    res.json(await maintenanceService.updateMaintenanceOrder(id, body));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/assign', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const { userId } = HkAssignSchema.parse(req.body);
    res.json(await maintenanceService.assignOrder(id, userId));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/start', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json(await maintenanceService.startOrder(id));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = HkMaintenanceCompleteSchema.parse(req.body);
    res.json(await maintenanceService.completeOrder(id, body.resolution, body.actualCost));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = HkMaintenanceCancelSchema.parse(req.body);
    res.json(await maintenanceService.cancelOrder(id, body.reason));
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;

module.exports = router;
