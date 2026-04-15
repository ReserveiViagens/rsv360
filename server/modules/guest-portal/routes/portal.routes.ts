import { Router } from 'express';
import { portalAuthMiddleware } from '../middleware/portal-auth.middleware';
import { checkInService } from '../services/checkin.service';
import { checkOutService } from '../services/checkout.service';
import { feedbackService } from '../services/feedback.service';
import { requestsService } from '../services/requests.service';
import { getBookingIdentifier } from '../db/portal.repository';

const router = Router();

router.use(portalAuthMiddleware);

function requireBookingId(portalBooking: any) {
  const bookingId = getBookingIdentifier(portalBooking);
  if (!bookingId) {
    throw new Error('Reserva não encontrada');
  }

  return String(bookingId);
}

router.get('/booking', async (req, res) => {
  return res.json({
    booking: (req as any).portalBooking,
    guest: (req as any).portalGuest,
  });
});

router.post('/checkin', async (req, res) => {
  try {
    const bookingId = requireBookingId((req as any).portalBooking);
    const result = await checkInService.performOnlineCheckIn(bookingId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const bookingId = requireBookingId((req as any).portalBooking);
    const result = await checkOutService.performOnlineCheckOut(bookingId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/requests', async (req, res) => {
  try {
    const bookingId = requireBookingId((req as any).portalBooking);
    const result = await requestsService.listRequests(bookingId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/requests', async (req, res) => {
  try {
    const bookingId = requireBookingId((req as any).portalBooking);
    const result = await requestsService.submitRequest(bookingId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/requests/:id', async (req, res) => {
  try {
    const bookingId = requireBookingId((req as any).portalBooking);
    const result = await requestsService.cancelRequest(req.params.id, bookingId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const bookingId = requireBookingId((req as any).portalBooking);
    const result = await feedbackService.submitFeedback(bookingId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/feedback', async (req, res) => {
  try {
    const bookingId = requireBookingId((req as any).portalBooking);
    const result = await feedbackService.getFeedback(bookingId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

module.exports = router;
