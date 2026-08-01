import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { competitorService } from '../services';
import {
  CompetitorBulkSchema,
  CompetitorRateCreateSchema,
  CompetitorRateUpdateSchema,
  parsePositiveIntId,
} from '../schemas/revenue-write.schema';

const router = Router();

function badRequest(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: error.flatten() });
  }
  return res.status(400).json({ success: false, error: (error as Error).message });
}

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
  try {
    const body = CompetitorRateCreateSchema.parse(req.body);
    const data = await competitorService.createCompetitorRate(body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const body = CompetitorBulkSchema.parse(req.body);
    const data = await competitorService.bulkImport(body.entries);
    res.json({ success: true, data });
  } catch (error) {
    return badRequest(res, error);
  }
});

// Static paths before /:id
router.get('/comparison', async (req, res) => {
  const data = await competitorService.getComparisonReport(
    String(req.query.start || req.query.startDate || ''),
    String(req.query.end || req.query.endDate || ''),
    req.query.roomTypeId ? Number(req.query.roomTypeId) : 1,
  );
  res.json({ success: true, data });
});

router.get('/summary', async (_req, res) => {
  res.json({ success: true, data: await competitorService.getCompetitorSummary() });
});

router.get('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const item = await competitorService.getCompetitorRateById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Rate not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = CompetitorRateUpdateSchema.parse(req.body);
    const item = await competitorService.updateCompetitorRate(id, body);
    if (!item) return res.status(404).json({ success: false, error: 'Rate not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    return badRequest(res, error);
  }
});

/** SKIP body: delete has no req.body mass-assignment surface. */
router.delete('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    await competitorService.deleteCompetitorRate(id);
    res.json({ success: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
