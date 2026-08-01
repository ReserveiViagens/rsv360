import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { requireRole } from '../middleware/hk-auth.middleware';
import { roomStatusService } from '../services/room-status.service';
import {
  HkRoomBulkStatusSchema,
  HkRoomStatusUpdateSchema,
  parsePositiveIntId,
} from '../schemas/housekeeping-write.schema';
import { badRequest as badRequestShared } from '../../../lib/bad-request';

const router = Router();
const auth = requireRole('admin', 'manager', 'staff', 'housekeeper');

function badRequest(res: import('express').Response, error: unknown) {
  return badRequestShared(res, error);
}

router.get('/', auth, async (req, res) => {
  try {
    res.json(await roomStatusService.listRooms(req.query as Record<string, any>));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Static paths before /:id (same pattern as PR-07b route reordering)
router.get('/floor-map', auth, async (_req, res) => {
  try {
    res.json(await roomStatusService.getFloorMap());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/dashboard', auth, async (_req, res) => {
  try {
    res.json(await roomStatusService.getDashboard());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/bulk-status', auth, async (req, res) => {
  try {
    const body = HkRoomBulkStatusSchema.parse(req.body);
    const updated = await roomStatusService.bulkUpdate(body.ids, body.status);
    res.json({ updated });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json(await roomStatusService.getRoomById(id));
  } catch (error) {
    if (error instanceof ZodError) return badRequest(res, error);
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = HkRoomStatusUpdateSchema.parse(req.body);
    const result = await roomStatusService.updateStatus(id, body.status, body.notes);
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;

module.exports = router;
