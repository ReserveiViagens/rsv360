import { Router } from 'express';
import { requireRole } from '../middleware/hk-auth.middleware';
import { checklistsService } from '../services/checklists.service';
import { asRequiredString } from '../../../lib/parse';

const router = Router();
const auth = requireRole('admin', 'manager', 'staff', 'housekeeper');

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
    res.json(await checklistsService.createChecklist(req.body));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    res.json(await checklistsService.getChecklistById(asRequiredString(req.params.id)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    res.json(await checklistsService.updateChecklist(asRequiredString(req.params.id), req.body));
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await checklistsService.deleteChecklist(asRequiredString(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;

module.exports = router;

