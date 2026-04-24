import propertiesRouter from './routes';
import { propertyRepository } from './db/property.repository';
import { createTenantMiddleware } from './middleware/tenant.middleware';
import { propertyService } from './services';

export async function registerMultiPropertyModule(app: any, _knex?: any) {
  await propertyRepository.init();
  app.use('/api/properties', propertiesRouter);
  const tenantMiddleware = createTenantMiddleware(propertyRepository);
  console.log('[MULTI-PROPERTY] Módulo Multi-property registrado ✓');
  return { repo: propertyRepository, tenantMiddleware, propertyService };
}

export { createTenantMiddleware } from './middleware/tenant.middleware';
export * from './db/schema';
export * from './services';
export * from './helpers/with-property';

export default { registerMultiPropertyModule };

module.exports = {
  registerMultiPropertyModule,
  createTenantMiddleware,
};
