/**
 * Regression: broken relative imports in importacoes.worker.ts prevented the
 * module from loading (worker never started since PR 19.1 / 420c91c8).
 * ADR BullMQ: do NOT call startImportacoesWorker here — load-only check.
 */
describe('importacoes.worker — module load (real, no mock)', () => {
  it('loads without throwing and exports worker lifecycle helpers', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('../../../../server/modules/acomodacoes/importacoes.worker');

    expect(typeof mod.startImportacoesWorker).toBe('function');
    expect(typeof mod.stopImportacoesWorker).toBe('function');
    expect(typeof mod.processImportJob).toBe('function');
  });
});
