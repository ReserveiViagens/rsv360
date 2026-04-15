import { Router } from 'express';
import { propertyService } from '../services';

const router = Router();

router.get('/', async (req, res) => {
  const userId = Number((req as any).user?.id || req.query.userId || 1);
  res.json({ success: true, data: await propertyService.listMyProperties(userId) });
});

router.get('/consolidated', async (req, res) => {
  const userId = Number((req as any).user?.id || req.query.userId || 1);
  res.json({ success: true, data: await propertyService.getConsolidated(userId) });
});

router.post('/switch', async (req, res) => {
  const userId = Number((req as any).user?.id || req.body.userId || req.body.user_id || 1);
  const propertyId = Number(req.body.propertyId || req.body.property_id || 1);
  res.json({ success: true, data: { userId, propertyId } });
});

router.post('/', async (req, res) => {
  const ownerId = Number((req as any).user?.id || req.body.ownerId || req.body.owner_id || 1);
  const property = await propertyService.create(ownerId, req.body);
  res.status(201).json({ success: true, data: property });
});

router.get('/:id', async (req, res) => {
  const property = await propertyService.get(Number(req.params.id));
  if (!property) return res.status(404).json({ success: false, error: 'Propriedade não encontrada' });
  res.json({ success: true, data: property });
});

router.put('/:id', async (req, res) => {
  const property = await propertyService.update(Number(req.params.id), req.body);
  if (!property) return res.status(404).json({ success: false, error: 'Propriedade não encontrada' });
  res.json({ success: true, data: property });
});

router.delete('/:id', async (req, res) => {
  res.json({ success: true, deleted: await propertyService.delete(Number(req.params.id)) });
});

router.get('/:id/stats', async (req, res) => {
  res.json({ success: true, data: await propertyService.getStats(Number(req.params.id)) });
});

router.get('/:id/users', async (req, res) => {
  res.json({ success: true, data: await propertyService.listUsers(Number(req.params.id)) });
});

router.post('/:id/users', async (req, res) => {
  const user = await propertyService.addUser(Number(req.params.id), Number(req.body.userId || req.body.user_id), String(req.body.role || 'staff'));
  res.status(201).json({ success: true, data: user });
});

router.put('/:id/users/:uid', async (req, res) => {
  const user = await propertyService.updateUserRole(Number(req.params.id), Number(req.params.uid), String(req.body.role || 'staff'));
  if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
  res.json({ success: true, data: user });
});

router.delete('/:id/users/:uid', async (req, res) => {
  res.json({ success: true, deleted: await propertyService.removeUser(Number(req.params.id), Number(req.params.uid)) });
});

router.get('/:id/settings', async (req, res) => {
  const property = await propertyService.get(Number(req.params.id));
  res.json({ success: true, data: property?.settings || {} });
});

router.put('/:id/settings', async (req, res) => {
  const property = await propertyService.update(Number(req.params.id), { settings: req.body.settings || req.body });
  res.json({ success: true, data: property?.settings || {} });
});

export default router;
