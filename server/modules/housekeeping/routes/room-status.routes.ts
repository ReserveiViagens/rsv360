import { Router } from 'express';
import { requireRole } from '../middleware/hk-auth.middleware';
import { roomStatusService } from '../services/room-status.service';

const router = Router();
const auth = requireRole('admin', 'manager', 'staff', 'housekeeper');

router.get('/', auth, async (req, res) => {
  try {
    res.json(await roomStatusService.listRooms(req.query as Record<string, any>));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    res.json(await roomStatusService.getRoomById(req.params.id));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const result = await roomStatusService.updateStatus(req.params.id, req.body.status, req.body.notes);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/bulk-status', auth, async (req, res) => {
  try {
    const updated = await roomStatusService.bulkUpdate(req.body.ids || [], req.body.status);
    res.json({ updated });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

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

export default router;

module.exports = router;
