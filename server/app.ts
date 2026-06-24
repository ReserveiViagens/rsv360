import type { Express } from 'express';
import type { Server } from 'socket.io';
import { registerOrcamentosModule } from './modules/orcamentos';
import { registerPropostasModule } from './modules/propostas';
import { registerPassageirosModule } from './modules/passageiros';
import { registerFinanceiroModule } from './modules/financeiro';
import { registerCampanhasModule } from './modules/campanhas';
import { registerLogisticaModule } from './modules/logistica';
import { registerRelatoriosModule } from './modules/relatorios';

/**
 * Registra os 7 módulos backend da Fase 1 (migração Sistema A → B).
 * Propostas inclui WebSocket Chat HITL quando `io` é fornecido.
 */
export function registerMigracaoFase1Modules(app: Express, io?: Server) {
  registerOrcamentosModule(app);
  registerPropostasModule(app, io);
  registerPassageirosModule(app);
  registerFinanceiroModule(app);
  registerCampanhasModule(app);
  registerLogisticaModule(app);
  registerRelatoriosModule(app);
  console.log('[BOOT] Módulos Fase 1 (7/7) registrados ✓');
}

module.exports = { registerMigracaoFase1Modules };
