const crmRouter = require('./routes');
export * from './routes';
export * from './services';
export * from './db/schema';
export * from './db/crm.repository';

export async function registerCrmModule(app: any) {
  const { crmRepository } = await import('./db/crm.repository');
  await crmRepository.init();
  app.use('/api/crm', crmRouter);
  console.log('[CRM] Módulo CRM & Loyalty registrado ✓');
  return { repo: crmRepository };
}

export default crmRouter;

module.exports = {
  registerCrmModule,
  crmRouter,
};
