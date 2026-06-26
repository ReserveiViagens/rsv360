import type { Express } from 'express';
import fornecedoresHubRouter from './routes/index';
import { makeGenericHotelAdapter } from './adapters/generic-hotel.adapter';
import { registrarAdapterFactory } from './registry';

let bootstrapped = false;

export function bootstrapFornecedoresAdapters() {
  if (bootstrapped) return;
  registrarAdapterFactory('generic-hotel', (cfg) => makeGenericHotelAdapter(cfg));
  bootstrapped = true;
}

export function registerFornecedoresHubModule(app: Express) {
  bootstrapFornecedoresAdapters();
  app.use('/api/v1/fornecedores-api', fornecedoresHubRouter);
  console.log('[MODULE] Fornecedores Hub (Cotação v2) registrado ✓');
}

export default fornecedoresHubRouter;
module.exports = { registerFornecedoresHubModule, fornecedoresHubRouter, bootstrapFornecedoresAdapters };
