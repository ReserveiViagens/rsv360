import { Router } from 'express';
import { pricingEngineService } from '../services';

const router = Router();

router.post('/calculate', async (req, res) => {
  const result = await pricingEngineService.calculateDynamicPrice(Number(req.body.roomTypeId), String(req.body.date), req.body);
  res.json({ success: true, data: result });
});

router.post('/calculate-stay', async (req, res) => {
  const result = await pricingEngineService.calculateStayPrice(Number(req.body.roomTypeId), String(req.body.checkIn), String(req.body.checkOut), req.body);
  res.json({ success: true, data: result });
});

router.post('/optimal-price', async (req, res) => {
  const result = await pricingEngineService.getOptimalPrice(Number(req.body.roomTypeId), String(req.body.date));
  res.json({ success: true, data: result });
});

router.post('/simulate', async (req, res) => {
  const result = await pricingEngineService.simulatePrice(Number(req.body.roomTypeId), String(req.body.date), req.body.rules || []);
  res.json({ success: true, data: result });
});

export default router;
