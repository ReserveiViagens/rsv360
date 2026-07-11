const crmRouter = require('./routes/index');
export * from './routes/index';
export * from './services/index';
export * from './db/schema/index';
export * from './db/crm.repository';

const { crmRepository } = require('./db/crm.repository');

export async function registerCrmModule(app: any) {
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
