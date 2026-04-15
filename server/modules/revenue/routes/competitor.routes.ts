import { Router } from 'express';
import { competitorService } from '../services';

const router = Router();

router.get('/', async (req, res) => {
  const data = await competitorService.listCompetitorRates({
    competitor_name: req.query.competitor_name as string | undefined,
    date: req.query.date as string | undefined,
    source: req.query.source as string | undefined,
    property_id: req.query.property_id ? Number(req.query.property_id) : undefined,
  });
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const data = await competitorService.createCompetitorRate(req.body);
  res.status(201).json({ success: true, data });
});

router.post('/bulk', async (req, res) => {
  const data = await competitorService.bulkImport(req.body.entries || []);
  res.json({ success: true, data });
});

router.get('/comparison', async (req, res) => {
  const data = await competitorService.getComparisonReport(String(req.query.start || req.query.startDate || ''), String(req.query.end || req.query.endDate || ''), req.query.roomTypeId ? Number(req.query.roomTypeId) : 1);
  res.json({ success: true, data });
});

router.get('/summary', async (_req, res) => {
  res.json({ success: true, data: await competitorService.getCompetitorSummary() });
});

router.get('/:id', async (req, res) => {
  const item = await competitorService.getCompetitorRateById(Number(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: 'Rate not found' });
  res.json({ success: true, data: item });
});

router.put('/:id', async (req, res) => {
  const item = await competitorService.updateCompetitorRate(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ success: false, error: 'Rate not found' });
  res.json({ success: true, data: item });
});

router.delete('/:id', async (req, res) => {
  await competitorService.deleteCompetitorRate(Number(req.params.id));
  res.json({ success: true });
});

export default router;
