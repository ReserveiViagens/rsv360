const revenueRouter = require('./routes');

export * from './routes';
export * from './services';
export * from './db/schema';
export * from './db/revenue.repository';

export function registerRevenueModule(app: any) {
  app.use('/api/revenue', revenueRouter);
}

export default revenueRouter;

module.exports = {
  registerRevenueModule,
  revenueRouter,
};
