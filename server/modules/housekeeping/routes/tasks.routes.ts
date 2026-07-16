import { Router } from 'express';
import { requireRole } from '../middleware/hk-auth.middleware';
import { tasksService } from '../services/tasks.service';
import { asRequiredString } from '../../../lib/parse';

const router = Router();
const auth = requireRole('admin', 'manager', 'staff', 'housekeeper');

router.get('/', auth, async (req, res) => {
  try {
    res.json(await tasksService.listTasks(req.query as Record<string, any>));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/today', auth, async (_req, res) => {
  try {
    res.json(await tasksService.getTodayTasks());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/workload', auth, async (_req, res) => {
  try {
    res.json(await tasksService.getWorkload());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    res.json(await tasksService.getTaskStats(req.query as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    res.json(await tasksService.createTask(req.body));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await tasksService.getTaskById(asRequiredString(req.params.id));
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    res.json(await tasksService.updateTask(asRequiredString(req.params.id), req.body));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/assign', auth, async (req, res) => {
  try {
    res.json(await tasksService.assignTask(asRequiredString(req.params.id), req.body.userId));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/start', auth, async (req, res) => {
  try {
    res.json(await tasksService.startTask(asRequiredString(req.params.id)));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    res.json(await tasksService.completeTask(asRequiredString(req.params.id), req.body.checklistResults, req.body.notes));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/inspect', auth, async (req, res) => {
  try {
    res.json(await tasksService.inspectTask(asRequiredString(req.params.id), Number(req.body.rating), req.body.inspectorId, req.body.notes));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;

module.exports = router;

