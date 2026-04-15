import portalRouter from './portal.routes';
import adminRouter from './admin.routes';

const applyPropertyContext = (router: any) => {
  router.use((req: any, _res: any, next: any) => {
    const propertyId = req.propertyId;
    if (propertyId !== undefined) {
      req.query.property_id = req.query.property_id || String(propertyId);
      if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
        req.body.property_id = req.body.property_id || propertyId;
      }
    }
    next();
  });
  return router;
};

applyPropertyContext(portalRouter);
applyPropertyContext(adminRouter);

export { portalRouter, adminRouter };

module.exports = { portalRouter, adminRouter };

