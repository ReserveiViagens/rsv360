import { Router } from 'express';
import propertiesRoutes from './properties.routes';

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

router.use('/', propertiesRoutes);

router.get('/health', (_req, res) => {
  res.json({
    module: 'multi-property',
    status: 'ok',
    timestamp: new Date().toISOString(),
    routes: {
      properties: '/api/properties',
      consolidated: '/api/properties/consolidated',
    },
  });
});

export function registerPropertyRoutes(app: any) {
  app.use('/api/properties', router);
}

export default router;

module.exports = router;
