import { formatImportJobFailedLog } from '../../../../server/modules/acomodacoes/importacoes.worker';

describe('D3 — import worker failed log', () => {
  it('formats tentativa 1/1 when BullMQ default (opts.attempts unset/0)', () => {
    expect(
      formatImportJobFailedLog(
        { id: 'import-x', attemptsMade: 1, opts: { attempts: 0 } },
        { message: 'Invalid PDF structure.' },
      ),
    ).toEqual({
      jobId: 'import-x',
      tentativa: '1/1',
      attemptsMade: 1,
      maxAttempts: 1,
      error: 'Invalid PDF structure.',
    });
  });

  it('formats tentativa X/Y when retries are configured', () => {
    expect(
      formatImportJobFailedLog(
        { id: 'import-y', attemptsMade: 2, opts: { attempts: 3 } },
        { message: 'boom' },
      ),
    ).toMatchObject({
      jobId: 'import-y',
      tentativa: '2/3',
      attemptsMade: 2,
      maxAttempts: 3,
    });
  });
});
