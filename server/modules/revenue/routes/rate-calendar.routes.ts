import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { rateCalendarService } from '../services';
import {
  DateRangeBodySchema,
  RateBulkOverrideSchema,
  RateOverrideRemoveSchema,
  RateOverrideSchema,
} from '../schemas/revenue-write.schema';
import { badRequest as badRequestShared } from '../../../lib/bad-request';

const router = Router();

function badRequest(res: import('express').Response, error: unknown) {
  return badRequestShared(res, error, { successEnvelope: true });
}

router.get('/', async (req, res) => {
  const start = String(req.query.start || req.query.startDate || '');
  const end = String(req.query.end || req.query.endDate || '');
  const roomTypeId = req.query.roomTypeId ? Number(req.query.roomTypeId) : undefined;
  const entries = await rateCalendarService.getRateCalendar(start, end, roomTypeId);
  res.json({ success: true, data: entries });
});

router.post('/generate', async (req, res) => {
  try {
    const body = DateRangeBodySchema.parse(req.body);
    const result = await rateCalendarService.generateRateCalendar(
      String(body.startDate || body.start),
      String(body.endDate || body.end),
      body.roomTypeId,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/summary', async (req, res) => {
  const now = new Date();
  const month = req.query.month ? Number(req.query.month) : now.getUTCMonth() + 1;
  const year = req.query.year ? Number(req.query.year) : now.getUTCFullYear();
  const result = await rateCalendarService.getCalendarSummary(
    month,
    year,
    req.query.roomTypeId ? Number(req.query.roomTypeId) : undefined,
  );
  res.json({ success: true, data: result });
});

router.put('/override', async (req, res) => {
  try {
    const body = RateOverrideSchema.parse(req.body);
    const result = await rateCalendarService.overridePrice(body.roomTypeId, body.date, body.price);
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.delete('/override', async (req, res) => {
  try {
    const merged = {
      roomTypeId: req.body?.roomTypeId ?? req.query.roomTypeId,
      date: req.body?.date ?? req.query.date,
    };
    const body = RateOverrideRemoveSchema.parse(merged);
    const result = await rateCalendarService.removeOverride(body.roomTypeId, body.date);
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/bulk-override', async (req, res) => {
  try {
    const body = RateBulkOverrideSchema.parse(req.body);
    const result = await rateCalendarService.bulkOverridePrices(body.updates);
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
