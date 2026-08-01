import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { requireRole } from '../middleware/hk-auth.middleware';
import { tasksService } from '../services/tasks.service';
import {
  HkAssignSchema,
  HkTaskCompleteSchema,
  HkTaskCreateSchema,
  HkTaskInspectSchema,
  HkTaskUpdateSchema,
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
    const body = HkTaskCreateSchema.parse(req.body);
    res.json(await tasksService.createTask(body));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const task = await tasksService.getTaskById(id);
    res.json(task);
  } catch (error) {
    if (error instanceof ZodError) return badRequest(res, error);
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = HkTaskUpdateSchema.parse(req.body);
    res.json(await tasksService.updateTask(id, body));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/assign', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const { userId } = HkAssignSchema.parse(req.body);
    res.json(await tasksService.assignTask(id, userId));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/start', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json(await tasksService.startTask(id));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = HkTaskCompleteSchema.parse(req.body ?? {});
    res.json(await tasksService.completeTask(id, body.checklistResults, body.notes));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/inspect', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = HkTaskInspectSchema.parse(req.body);
    res.json(await tasksService.inspectTask(id, body.rating, body.inspectorId, body.notes));
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;

module.exports = router;
