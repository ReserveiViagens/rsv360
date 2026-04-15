import { Router } from 'express';
import { forecastService } from '../services';

const router = Router();

router.get('/', async (req, res) => {
  const entries = await forecastService.getForecast(String(req.query.start || req.query.startDate || ''), String(req.query.end || req.query.endDate || ''));
  res.json({ success: true, data: entries });
});

router.post('/generate', async (req, res) => {
  const result = await forecastService.generateForecast(req.body.startDate || req.body.start, req.body.endDate || req.body.end);
  res.json({ success: true, data: result });
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
