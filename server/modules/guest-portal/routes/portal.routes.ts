import { Router } from 'express';
import { portalAuthMiddleware } from '../middleware/portal-auth.middleware';
import { checkInService } from '../services/checkin.service';
import { checkOutService } from '../services/checkout.service';
import { feedbackService } from '../services/feedback.service';
import { requestsService } from '../services/requests.service';
import { getBookingIdentifier, portalRepository } from '../db/portal.repository';
import { PortalBookingUpdateSchema } from '../schemas/portal-booking-write.schema';
import { z } from 'zod';

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

router.post('/booking', async (req, res) => {
  try {
    const payload = PortalBookingUpdateSchema.parse(req.body);
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        error: 'validation',
        details: { formErrors: ['Informe ao menos um campo editável'] },
      });
    }

    const portalBooking = (req as any).portalBooking;
    const portalToken = (req as any).portalToken;
    const bookingId = requireBookingId(portalBooking);

    const before = await portalRepository.getBookingById(bookingId);
    if (!before) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updated = await portalRepository.updateBookingFromPortal(bookingId, payload);

    await portalRepository.recordPortalAudit({
      bookingId,
      tokenId: String(portalToken?.id ?? ''),
      action: 'update',
      fieldsChanged: Object.keys(payload),
      beforePayload: {
        specialRequests: before.special_requests ?? before.specialRequests ?? null,
      },
      afterPayload: {
        specialRequests: updated.special_requests ?? updated.specialRequests ?? null,
      },
    });

    return res.json({ booking: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'validation', details: error.flatten() });
    }

    return res.status(400).json({ error: (error as Error).message });
  }
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
