import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { forecastService } from '../services';
import { DateRangeBodySchema } from '../schemas/revenue-write.schema';
import { badRequest as badRequestShared } from '../../../lib/bad-request';

const router = Router();

function badRequest(res: import('express').Response, error: unknown) {
  return badRequestShared(res, error, { successEnvelope: true });
}

router.get('/', async (req, res) => {
  const entries = await forecastService.getForecast(
    String(req.query.start || req.query.startDate || ''),
    String(req.query.end || req.query.endDate || ''),
  );
  res.json({ success: true, data: entries });
});

router.post('/generate', async (req, res) => {
  try {
    const body = DateRangeBodySchema.parse(req.body);
    const result = await forecastService.generateForecast(
      String(body.startDate || body.start),
      String(body.endDate || body.end),
    );
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/seasonality', async (_req, res) => {
  res.json({ success: true, data: await forecastService.getSeasonalityFactors() });
});

router.get('/day-of-week', async (_req, res) => {
  res.json({ success: true, data: await forecastService.getDayOfWeekFactors() });
});

router.get('/booking-pace', async (req, res) => {
  const targetDate = String(req.query.targetDate || req.query.date || '');
  res.json({ success: true, data: await forecastService.getBookingPace(targetDate) });
});

export default router;
