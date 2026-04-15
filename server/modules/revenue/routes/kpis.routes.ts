import { Router } from 'express';
import { revenueKpisService } from '../services';

const router = Router();

router.get('/', async (req, res) => {
  const data = await revenueKpisService.getRevenueKPIs(String(req.query.start || req.query.startDate || ''), String(req.query.end || req.query.endDate || ''));
  res.json({ success: true, data });
});

router.get('/by-room-type', async (req, res) => {
  const data = await revenueKpisService.getRevenueByRoomType(String(req.query.start || req.query.startDate || ''), String(req.query.end || req.query.endDate || ''));
  res.json({ success: true, data });
});

router.get('/by-channel', async (req, res) => {
  const data = await revenueKpisService.getRevenueByChannel(String(req.query.start || req.query.startDate || ''), String(req.query.end || req.query.endDate || ''));
  res.json({ success: true, data });
});

router.get('/monthly-trend', async (req, res) => {
  const months = req.query.months ? Number(req.query.months) : 12;
  res.json({ success: true, data: await revenueKpisService.getMonthlyTrend(months) });
});

router.get('/daily', async (req, res) => {
  const data = await revenueKpisService.getDailyRevenue(String(req.query.start || req.query.startDate || ''), String(req.query.end || req.query.endDate || ''));
  res.json({ success: true, data });
});

export default router;
