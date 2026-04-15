const housekeepingRouter = require('./routes');
export * from './routes';
export * from './services';
export * from './middleware/hk-auth.middleware';
export * from './db/schema';
export * from './db/housekeeping.repository';

export function registerHousekeepingModule(app: any) {
  app.use('/api/housekeeping', housekeepingRouter);
}

export default housekeepingRouter;

module.exports = {
  registerHousekeepingModule,
  housekeepingRouter,
};
