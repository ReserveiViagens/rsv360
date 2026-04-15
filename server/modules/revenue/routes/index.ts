import { Router } from 'express';
import pricingRulesRoutes from './pricing-rules.routes';
import rateCalendarRoutes from './rate-calendar.routes';
import forecastRoutes from './forecast.routes';
import competitorRoutes from './competitor.routes';
import kpisRoutes from './kpis.routes';
import engineRoutes from './engine.routes';

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

router.use('/rules', pricingRulesRoutes);
router.use('/calendar', rateCalendarRoutes);
router.use('/forecast', forecastRoutes);
router.use('/competitors', competitorRoutes);
router.use('/kpis', kpisRoutes);
router.use('/engine', engineRoutes);

router.get('/health', (_req, res) => {
  res.json({
    module: 'revenue',
    status: 'ok',
    timestamp: new Date().toISOString(),
    routes: {
      rules: '/api/revenue/rules',
      calendar: '/api/revenue/calendar',
      forecast: '/api/revenue/forecast',
      competitors: '/api/revenue/competitors',
      kpis: '/api/revenue/kpis',
      engine: '/api/revenue/engine',
    },
  });
});

export default router;

export { default as pricingRulesRoutes } from './pricing-rules.routes';
export { default as rateCalendarRoutes } from './rate-calendar.routes';
export { default as forecastRoutes } from './forecast.routes';
export { default as competitorRoutes } from './competitor.routes';
export { default as kpisRoutes } from './kpis.routes';
export { default as engineRoutes } from './engine.routes';

module.exports = router;
