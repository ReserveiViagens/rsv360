import { Router } from 'express';
import { PaymentService } from '../services/payment.service';

const router = Router();
const paymentService = new PaymentService();

router.post('/', async (req, res) => {
  try {
    const result = await paymentService.createPayment(req.body.enterpriseId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const result = await paymentService.listPayments(filters as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await paymentService.getPayment(req.params.id);
    if (!result) return res.status(404).json({ error: 'Payment not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const result = await paymentService.cancelPayment(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/booking/:bookingId', async (req, res) => {
  try {
    const result = await paymentService.getPaymentsByBooking(req.params.bookingId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/customer/:customerId', async (req, res) => {
  try {
    const result = await paymentService.getPaymentsByCustomer(req.params.customerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await paymentService.getPaymentStats(req.query.enterpriseId as string);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/checkout/session', async (req, res) => {
  // Stripe checkout session
  res.json({ message: 'Not implemented' });
});

export default router;