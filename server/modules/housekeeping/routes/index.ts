import { Router } from 'express';
import roomsRoutes from './room-status.routes';
import tasksRoutes from './tasks.routes';
import maintenanceRoutes from './maintenance.routes';
import checklistsRoutes from './checklists.routes';

const router = Router();

router.use((req, _res, next) => {
  const propertyId = (req as any).propertyId;
  if (propertyId !== undefined) {
    (req.query as any).property_id = (req.query as any).property_id || String(propertyId);
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      (req.body as any).property_id = (req.body as any).property_id || propertyId;
    }
  }
  next();
});

router.use('/rooms', roomsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/checklists', checklistsRoutes);

router.get('/health', (_req, res) => {
  res.json({
    module: 'housekeeping',
    status: 'ok',
    timestamp: new Date().toISOString(),
    routes: {
      rooms: '/api/housekeeping/rooms',
      tasks: '/api/housekeeping/tasks',
      maintenance: '/api/housekeeping/maintenance',
      checklists: '/api/housekeeping/checklists',
    },
  });
});

export default router;

export { default as roomsRoutes } from './room-status.routes';
export { default as tasksRoutes } from './tasks.routes';
export { default as maintenanceRoutes } from './maintenance.routes';
export { default as checklistsRoutes } from './checklists.routes';

module.exports = router;

