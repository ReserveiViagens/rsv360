import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import type { PricingRule } from '../db/schema';
import { pricingEngineService } from '../services';
import {
  EngineCalculateSchema,
  EngineCalculateStaySchema,
  EngineOptimalSchema,
  EngineSimulateSchema,
} from '../schemas/revenue-write.schema';

const router = Router();

function badRequest(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: error.flatten() });
  }
  return res.status(400).json({ success: false, error: (error as Error).message });
}

router.post('/calculate', async (req, res) => {
  try {
    const { roomTypeId, date, ...options } = EngineCalculateSchema.parse(req.body);
    const result = await pricingEngineService.calculateDynamicPrice(roomTypeId, date, options);
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/calculate-stay', async (req, res) => {
  try {
    const { roomTypeId, checkIn, checkOut, ...options } = EngineCalculateStaySchema.parse(req.body);
    const result = await pricingEngineService.calculateStayPrice(roomTypeId, checkIn, checkOut, options);
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/optimal-price', async (req, res) => {
  try {
    const { roomTypeId, date } = EngineOptimalSchema.parse(req.body);
    const result = await pricingEngineService.getOptimalPrice(roomTypeId, date);
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/simulate', async (req, res) => {
  try {
    const { roomTypeId, date, rules } = EngineSimulateSchema.parse(req.body);
    const result = await pricingEngineService.simulatePrice(
      roomTypeId,
      date,
      (rules || []) as PricingRule[],
    );
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
