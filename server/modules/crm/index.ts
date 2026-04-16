const crmRouter = require('./routes/index.ts');
export * from './routes/index.ts';
export * from './services/index.ts';
export * from './db/schema/index.ts';
export * from './db/crm.repository.ts';

export async function registerCrmModule(app: any) {
  const { crmRepository } = await import('./db/crm.repository.ts');
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
