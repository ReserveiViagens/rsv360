import { pipelineImportacao } from '../../../../server/modules/acomodacoes/import/pipeline';

jest.mock('../../../../server/modules/acomodacoes/import/parse', () => ({
  parseArquivo: jest.fn(async () => Array.from({ length: 51 }, (_, i) => ({ linha: i + 1 }))),
}));

jest.mock('../../../../server/modules/acomodacoes/import/normalizar', () => ({
  normalizarLote: jest.fn(async () => ({
    validos: [] as unknown[],
    erros: [] as Array<{ linha: number; motivo: string }>,
  })),
}));

jest.mock('../../../../server/modules/acomodacoes/import/importar', () => ({
  processarImport: jest.fn(async () => ({
    dryRun: true,
    total: 0,
    sucesso: 0,
    erros: 0,
    linhas: [] as Array<{ linha: number; status: string; acao: string }>,
  })),
}));

describe('pipelineImportacao limite parceiro (PR 24C)', () => {
  it('rejeita mais de 50 linhas para parceiro', async () => {
    await expect(
      pipelineImportacao(Buffer.from('x'), 'test.csv', { maxLinhasParceiro: 50, dryRun: true }),
    ).rejects.toThrow(/limitado a 50 linhas/);
  });
});
