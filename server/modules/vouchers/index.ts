import type { Express } from 'express';
import vouchersRouter from './routes/index';

export function registerVouchersModule(app: Express) {
  app.use('/api/v1/vouchers', vouchersRouter);
  console.log('[MODULE] Vouchers (QR verificação) registrado ✓');
}

export default vouchersRouter;

module.exports = { registerVouchersModule, vouchersRouter };
