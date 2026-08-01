import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { requireRole } from '../middleware/hk-auth.middleware';
import { checklistsService } from '../services/checklists.service';
import {
  HkChecklistCreateSchema,
  HkChecklistUpdateSchema,
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
    res.json(await checklistsService.listChecklists(req.query as Record<string, any>));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/seed', auth, async (_req, res) => {
  try {
    const templates = await checklistsService.seedDefaults();
    res.json({ total: templates.length, templates });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const body = HkChecklistCreateSchema.parse(req.body);
    res.json(await checklistsService.createChecklist(body));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json(await checklistsService.getChecklistById(id));
  } catch (error) {
    if (error instanceof ZodError) return badRequest(res, error);
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = HkChecklistUpdateSchema.parse(req.body);
    res.json(await checklistsService.updateChecklist(id, body));
  } catch (error) {
    return badRequest(res, error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    await checklistsService.deleteChecklist(id);
    res.json({ success: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;

module.exports = router;
