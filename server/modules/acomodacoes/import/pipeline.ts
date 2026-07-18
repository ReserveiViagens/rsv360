import { parseArquivo } from './parse';
import { normalizarLote } from './normalizar';
import { processarImport } from './importar';
import type {
  ProcessarImportOptions,
  RelatorioImportacao,
} from './acomodacao-import.types';

export const IMPORT_VAZIO_CODE = 'IMPORT_VAZIO' as const;

export class ImportVazioError extends Error {
  readonly code = IMPORT_VAZIO_CODE;
  readonly statusCode = 422;

  constructor(message = 'Arquivo sem linhas de acomodação para importar') {
    super(message);
    this.name = 'ImportVazioError';
  }
}

export interface PipelineImportResult extends RelatorioImportacao {
  formato: string;
  errosNormalizacao: Array<{ linha: number; erros: string[] }>;
}

export async function pipelineImportacao(
  buffer: Buffer,
  nomeArquivo: string,
  options: ProcessarImportOptions = {},
): Promise<PipelineImportResult> {
  const linhasBrutas = await parseArquivo(buffer, nomeArquivo);

  if (linhasBrutas.length === 0) {
    throw new ImportVazioError();
  }

  if (options.maxLinhasParceiro != null && linhasBrutas.length > options.maxLinhasParceiro) {
    throw new Error(
      `Import parceiro limitado a ${options.maxLinhasParceiro} linhas (arquivo tem ${linhasBrutas.length})`,
    );
  }
  const { validos, erros: errosNormalizacao, ignorados } = await normalizarLote(linhasBrutas, {
    criarTipoSeAusente: options.criarTipoSeAusente,
  });

  const relatorio = await processarImport(validos, options);

  const linhasIgnorados = ignorados.map((e) => ({
    linha: e.linha,
    status: 'ignorado' as const,
    acao: 'skip' as const,
    erros: e.erros,
  }));

  const linhasErroNorm = errosNormalizacao.map((e) => ({
    linha: e.linha,
    status: 'erro' as const,
    erros: e.erros,
  }));

  return {
    ...relatorio,
    formato: nomeArquivo.split('.').pop()?.toLowerCase() ?? 'desconhecido',
    errosNormalizacao,
    ignorados: ignorados.length,
    total: relatorio.total + errosNormalizacao.length + ignorados.length,
    erros: relatorio.erros + errosNormalizacao.length,
    linhas: [...linhasIgnorados, ...linhasErroNorm, ...relatorio.linhas],
  };
}

module.exports = { pipelineImportacao, ImportVazioError, IMPORT_VAZIO_CODE };
