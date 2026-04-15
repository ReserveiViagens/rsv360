import { Router } from 'express';
import { guestProfileService } from '../services';

const router = Router();

router.get('/', async (req, res) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  res.json({ success: true, data: await guestProfileService.list(req.query, page, limit) });
});

router.get('/search', async (req, res) => {
  res.json({ success: true, data: await guestProfileService.search(String(req.query.q || ''), req.query.limit ? Number(req.query.limit) : 20) });
});

router.get('/:id/timeline', async (req, res) => {
  res.json({ success: true, data: await guestProfileService.getTimeline(Number(req.params.id)) });
});

router.post('/merge', async (req, res) => {
  const result = await guestProfileService.mergeProfiles(Number(req.body.keepId), Number(req.body.mergeId));
  res.json({ success: true, data: result });
});

router.post('/lifecycle/refresh', async (_req, res) => {
  res.json({ success: true, data: await guestProfileService.refreshAllLifecycles() });
});

router.post('/', async (req, res) => {
  const profile = await guestProfileService.create(req.body);
  res.status(201).json({ success: true, data: profile });
});

router.get('/:id', async (req, res) => {
  const profile = await guestProfileService.get(Number(req.params.id));
  if (!profile) return res.status(404).json({ success: false, error: 'Perfil não encontrado' });
  res.json({ success: true, data: profile });
});

router.put('/:id', async (req, res) => {
  const profile = await guestProfileService.update(Number(req.params.id), req.body);
  if (!profile) return res.status(404).json({ success: false, error: 'Perfil não encontrado' });
  res.json({ success: true, data: profile });
});

router.delete('/:id', async (req, res) => {
  res.json({ success: true, deleted: await guestProfileService.delete(Number(req.params.id)) });
});

router.put('/:id/vip', async (req, res) => {
  const profile = await guestProfileService.update(Number(req.params.id), { is_vip: Boolean(req.body.is_vip ?? true) });
  res.json({ success: true, data: profile });
});

router.put('/:id/blacklist', async (req, res) => {
  const profile = await guestProfileService.update(Number(req.params.id), {
    is_blacklisted: Boolean(req.body.is_blacklisted ?? true),
    blacklist_reason: req.body.blacklist_reason || req.body.reason,
  });
  res.json({ success: true, data: profile });
});

router.post('/:id/lifecycle', async (req, res) => {
  res.json({ success: true, data: await guestProfileService.updateLifecycle(Number(req.params.id)) });
});

export default router;
