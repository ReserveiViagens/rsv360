import {
  ImportVazioError,
  IMPORT_VAZIO_CODE,
  pipelineImportacao,
} from '../../../../server/modules/acomodacoes/import/pipeline';
import { processImportJob } from '../../../../server/modules/acomodacoes/importacoes.worker';

jest.mock('../../../../server/modules/acomodacoes/import/normalizar', () => ({
  normalizarLote: jest.fn(async (linhas: unknown[]) => ({
    validos: linhas,
    erros: [],
    ignorados: [],
  })),
}));

jest.mock('../../../../server/modules/acomodacoes/import/importar', () => ({
  processarImport: jest.fn(async (dtos: unknown[], options: { dryRun?: boolean }) => ({
    dryRun: options.dryRun !== false,
    total: dtos.length,
    sucesso: dtos.length,
    erros: 0,
    linhas: dtos.map((_, i) => ({
      linha: i + 1,
      status: 'ok',
      acao: options.dryRun !== false ? 'preview' : 'insert',
    })),
  })),
}));

const LIXO_XLSX = Buffer.from('not-a-real-xlsx');

describe('D2 — import vazio falha explícito', () => {
  it('pipeline: xlsx de bytes lixo → ImportVazioError (não completed 0/0/0)', async () => {
    await expect(
      pipelineImportacao(LIXO_XLSX, 'lixo.xlsx', { dryRun: true }),
    ).rejects.toBeInstanceOf(ImportVazioError);

    try {
      await pipelineImportacao(LIXO_XLSX, 'lixo.xlsx', { dryRun: true });
    } catch (err) {
      expect(err).toMatchObject({
        code: IMPORT_VAZIO_CODE,
        statusCode: 422,
        message: expect.stringMatching(/sem linhas/i),
      });
    }
  });

  it('pipeline: CSV com cabeçalho e zero linhas de dados → ImportVazioError', async () => {
    const csvVazio = Buffer.from('codigo_externo,empreendimento,tipo,titulo\n', 'utf8');
    await expect(
      pipelineImportacao(csvVazio, 'vazio.csv', { dryRun: true }),
    ).rejects.toBeInstanceOf(ImportVazioError);
  });

  it('pipeline: caminho feliz com 1 linha permanece ok', async () => {
    const csv = Buffer.from(
      'codigo_externo,empreendimento,tipo,titulo,quartos,capacidade_max\n' +
        'EXT-1,Hotel Teste,Apartamento,Apto 101,2,4\n',
      'utf8',
    );
    const relatorio = await pipelineImportacao(csv, 'ok.csv', { dryRun: true });
    expect(relatorio.total).toBeGreaterThan(0);
    expect(relatorio.sucesso).toBeGreaterThan(0);
  });

  it('worker async: bytes lixo → rejeita (job failed, nunca completed 0/0/0)', async () => {
    await expect(
      processImportJob({
        data: {
          jobId: 'job-empty-d2',
          nomeArquivo: 'lixo.xlsx',
          bufferBase64: LIXO_XLSX.toString('base64'),
        },
      }),
    ).rejects.toMatchObject({
      code: IMPORT_VAZIO_CODE,
      message: expect.stringMatching(/sem linhas/i),
    });
  });
});
