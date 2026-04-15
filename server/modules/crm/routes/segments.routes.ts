import { Router } from 'express';
import { segmentService } from '../services';

const router = Router();

router.get('/', async (req, res) => {
  res.json({ success: true, data: await segmentService.list(Number(req.query.userId || 0)) });
});

router.get('/:id', async (req, res) => {
  const item = await segmentService.get(Number(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: 'Segmento não encontrado' });
  res.json({ success: true, data: item });
});

router.post('/', async (req, res) => {
  const item = await segmentService.create(Number(req.body.userId || 1), req.body);
  res.status(201).json({ success: true, data: item });
});

router.put('/:id', async (req, res) => {
  const item = await segmentService.update(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ success: false, error: 'Segmento não encontrado' });
  res.json({ success: true, data: item });
});

router.delete('/:id', async (req, res) => {
  res.json({ success: true, deleted: await segmentService.delete(Number(req.params.id)) });
});

router.post('/preview', async (req, res) => {
  res.json({ success: true, data: await segmentService.preview(req.body.filter || req.body) });
});

router.post('/refresh', async (_req, res) => {
  res.json({ success: true, data: await segmentService.refreshDynamicSegments() });
});

export default router;
