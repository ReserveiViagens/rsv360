import { Router } from 'express';
import { badRequest as badRequestShared } from '../../../lib/bad-request';
import { propertyService } from '../services';
import {
  PropertyAddUserSchema,
  PropertyCreateSchema,
  PropertySettingsWriteSchema,
  PropertySwitchSchema,
  PropertyUpdateSchema,
  PropertyUpdateUserRoleSchema,
  parsePositiveIntId,
  parsePositiveIntParam,
} from '../schemas/multi-property-write.schema';

const router = Router();

function badRequest(res: import('express').Response, error: unknown) {
  return badRequestShared(res, error, { successEnvelope: true });
}

router.get('/', async (req, res) => {
  const userId = Number((req as any).user?.id || req.query.userId || 1);
  res.json({ success: true, data: await propertyService.listMyProperties(userId) });
});

router.get('/consolidated', async (req, res) => {
  const userId = Number((req as any).user?.id || req.query.userId || 1);
  res.json({ success: true, data: await propertyService.getConsolidated(userId) });
});

router.post('/switch', async (req, res) => {
  try {
    const body = PropertySwitchSchema.parse(req.body);
    const userId = Number(
      (req as any).user?.id || body.userId || body.user_id || 1,
    );
    const propertyId = Number(body.propertyId ?? body.property_id);
    res.json({ success: true, data: { userId, propertyId } });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const ownerId = Number((req as any).user?.id || 1);
    const body = PropertyCreateSchema.parse(req.body);
    const property = await propertyService.create(ownerId, body);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const property = await propertyService.get(id);
    if (!property) return res.status(404).json({ success: false, error: 'Propriedade não encontrada' });
    res.json({ success: true, data: property });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = PropertyUpdateSchema.parse(req.body);
    const property = await propertyService.update(id, body);
    if (!property) return res.status(404).json({ success: false, error: 'Propriedade não encontrada' });
    res.json({ success: true, data: property });
  } catch (error) {
    return badRequest(res, error);
  }
});

/** SKIP body: DELETE property — soft-delete flag only. */
router.delete('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, deleted: await propertyService.delete(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id/stats', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, data: await propertyService.getStats(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id/users', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, data: await propertyService.listUsers(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/users', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = PropertyAddUserSchema.parse(req.body);
    const userId = Number(body.userId ?? body.user_id);
    const user = await propertyService.addUser(id, userId, body.role || 'staff');
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/users/:uid', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const uid = parsePositiveIntParam(req.params.uid, 'uid');
    const body = PropertyUpdateUserRoleSchema.parse(req.body);
    const user = await propertyService.updateUserRole(id, uid, body.role);
    if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    res.json({ success: true, data: user });
  } catch (error) {
    return badRequest(res, error);
  }
});

/** SKIP body: DELETE user link — no write payload. */
router.delete('/:id/users/:uid', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const uid = parsePositiveIntParam(req.params.uid, 'uid');
    res.json({ success: true, deleted: await propertyService.removeUser(id, uid) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id/settings', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const property = await propertyService.get(id);
    res.json({ success: true, data: property?.settings || {} });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/settings', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = PropertySettingsWriteSchema.parse(req.body ?? {});
    const property = await propertyService.update(id, {
      settings: (body as { settings: Record<string, unknown> }).settings,
    });
    res.json({ success: true, data: property?.settings || {} });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
