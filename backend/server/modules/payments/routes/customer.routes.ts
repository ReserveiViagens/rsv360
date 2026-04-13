import { Router } from 'express';
import { CustomerService } from '../services/customer.service';

const router = Router();
const customerService = new CustomerService();

router.post('/', async (req, res) => {
  try {
    const result = await customerService.createCustomer(req.body.enterpriseId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await customerService.listCustomers(req.query.enterpriseId as string);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await customerService.getCustomer(req.params.id);
    if (!result) return res.status(404).json({ error: 'Customer not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await customerService.updateCustomer(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/email/:email', async (req, res) => {
  try {
    const result = await customerService.findByEmail(req.params.email);
    if (!result) return res.status(404).json({ error: 'Customer not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/sync', async (req, res) => {
  try {
    const result = await customerService.syncWithProvider(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

// CommonJS export for compatibility
module.exports = router;