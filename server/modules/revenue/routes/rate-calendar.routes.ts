import { Router } from 'express';
import { rateCalendarService } from '../services';

const router = Router();

router.get('/', async (req, res) => {
  const start = String(req.query.start || req.query.startDate || '');
  const end = String(req.query.end || req.query.endDate || '');
  const roomTypeId = req.query.roomTypeId ? Number(req.query.roomTypeId) : undefined;
  const entries = await rateCalendarService.getRateCalendar(start, end, roomTypeId);
  res.json({ success: true, data: entries });
});

router.post('/generate', async (req, res) => {
  const result = await rateCalendarService.generateRateCalendar(req.body.startDate || req.body.start, req.body.endDate || req.body.end, req.body.roomTypeId);
  res.json({ success: true, data: result });
});

router.get('/summary', async (req, res) => {
  const now = new Date();
  const month = req.query.month ? Number(req.query.month) : now.getUTCMonth() + 1;
  const year = req.query.year ? Number(req.query.year) : now.getUTCFullYear();
  const result = await rateCalendarService.getCalendarSummary(month, year, req.query.roomTypeId ? Number(req.query.roomTypeId) : undefined);
  res.json({ success: true, data: result });
});

router.put('/override', async (req, res) => {
  const result = await rateCalendarService.overridePrice(Number(req.body.roomTypeId), String(req.body.date), Number(req.body.price));
  res.json({ success: true, data: result });
});

router.delete('/override', async (req, res) => {
  const result = await rateCalendarService.removeOverride(Number(req.body.roomTypeId || req.query.roomTypeId), String(req.body.date || req.query.date));
  res.json({ success: true, data: result });
});

router.post('/bulk-override', async (req, res) => {
  const result = await rateCalendarService.bulkOverridePrices(req.body.updates || []);
  res.json({ success: true, data: result });
});

export default router;
