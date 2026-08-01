import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { segmentService } from '../services';
import {
  SegmentCreateSchema,
  SegmentPreviewBodySchema,
  SegmentUpdateSchema,
  parsePositiveIntId,
} from '../schemas/crm-write.schema';

const router = Router();

function badRequest(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: error.flatten() });
  }
  return res.status(400).json({ success: false, error: (error as Error).message });
}

router.get('/', async (req, res) => {
  res.json({ success: true, data: await segmentService.list(Number(req.query.userId || 0)) });
});

router.post('/preview', async (req, res) => {
  try {
    const filter = SegmentPreviewBodySchema.parse(req.body ?? {});
    res.json({ success: true, data: await segmentService.preview(filter) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/refresh', async (_req, res) => {
  res.json({ success: true, data: await segmentService.refreshDynamicSegments() });
});

router.post('/', async (req, res) => {
  try {
    const body = SegmentCreateSchema.parse(req.body);
    const userId = Number(body.userId || body.user_id || 1);
    const item = await segmentService.create(userId, body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const item = await segmentService.get(id);
    if (!item) return res.status(404).json({ success: false, error: 'Segmento não encontrado' });
    res.json({ success: true, data: item });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = SegmentUpdateSchema.parse(req.body);
    const item = await segmentService.update(id, body);
    if (!item) return res.status(404).json({ success: false, error: 'Segmento não encontrado' });
    res.json({ success: true, data: item });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, deleted: await segmentService.delete(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
