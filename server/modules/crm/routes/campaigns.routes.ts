import { Router } from 'express';
import { campaignService } from '../services';

const router = Router();

router.get('/', async (req, res) => {
  res.json({ success: true, data: await campaignService.list(req.query, req.query.page ? Number(req.query.page) : 1, req.query.limit ? Number(req.query.limit) : 20) });
});

router.get('/:id', async (req, res) => {
  const item = await campaignService.get(Number(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: 'Campanha não encontrada' });
  res.json({ success: true, data: item });
});

router.post('/', async (req, res) => {
  const item = await campaignService.create(Number(req.body.userId || 1), req.body);
  res.status(201).json({ success: true, data: item });
});

router.put('/:id', async (req, res) => {
  const item = await campaignService.update(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ success: false, error: 'Campanha não encontrada' });
  res.json({ success: true, data: item });
});

router.delete('/:id', async (req, res) => {
  res.json({ success: true, deleted: await campaignService.delete(Number(req.params.id)) });
});

router.post('/:id/audience', async (req, res) => {
  const campaign = await campaignService.get(Number(req.params.id));
  const filter = req.body.filter || campaign?.segment_filter || {};
  res.json({ success: true, data: await campaignService.buildAudience(filter) });
});

router.post('/:id/schedule', async (req, res) => {
  res.json({ success: true, data: await campaignService.schedule(Number(req.params.id), String(req.body.scheduledAt || req.body.scheduled_at)) });
});

router.post('/:id/send', async (req, res) => {
  res.json({ success: true, data: await campaignService.send(Number(req.params.id)) });
});

router.get('/:id/stats', async (req, res) => {
  res.json({ success: true, data: await campaignService.getStats(Number(req.params.id)) });
});

export default router;
