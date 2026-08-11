import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import {
  LLM_GATEWAY_HARD_MAX_TOKENS,
  llmChatCompletion,
  type LlmChatGatewayDeps,
} from '@rsv360/shared';
import type { AcomodacaoImportDTO, FormatoImportacao } from './acomodacao-import.types';
import { acomodacaoImportSchema } from './acomodacao-import.types';

/** Import docs are larger than chat prompts; keep prior 120k ceiling. */
const ACOM_IMPORT_MAX_INPUT_CHARS = 120_000;
const ACOM_IMPORT_SYSTEM_PROMPT =
  'Extraia acomodações do texto e retorne JSON {"itens":[...]} com campos snake_case: codigo_externo, empreendimento, tipo, titulo, quartos, capacidade_max, config_sala, config_banheiro, preco_diaria, utensilios, eletrodomesticos, amenidades (listas). Use enums config_sala: nenhum|cama_na_sala|sofa_cama e config_banheiro: suite_wc_social|so_suite|so_wc_social.';

/** Strip control chars without collapsing whitespace (document structure). */
function sanitizeImportDocumentText(texto: string): string {
  return texto
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .slice(0, ACOM_IMPORT_MAX_INPUT_CHARS);
}

const EXT_POR_FORMATO: Record<string, FormatoImportacao> = {
  xlsx: 'xlsx',
  xls: 'xlsx',
  csv: 'csv',
  docx: 'docx',
  pdf: 'pdf',
  md: 'md',
  markdown: 'md',
};

export function detectarFormato(
  nomeArquivo: string,
  buffer?: Buffer,
): FormatoImportacao {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? '';
  if (EXT_POR_FORMATO[ext]) return EXT_POR_FORMATO[ext];

  if (buffer && buffer.length >= 4) {
    if (buffer[0] === 0x50 && buffer[1] === 0x4b) return 'xlsx';
    if (buffer.slice(0, 4).toString() === '%PDF') return 'pdf';
  }

  return 'desconhecido';
}

export function parseExcel(buffer: Buffer, formato: 'xlsx' | 'csv' = 'xlsx'): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    raw: false,
    cellDates: false,
  });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });

  if (formato === 'csv') {
    return rows;
  }
  return rows;
}

async function extrairPdf(buffer: Buffer): Promise<string> {
  // pdf-parse ^2.x exposes PDFParse class (no callable default).
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  try {
    const parsed = await parser.getText();
    let texto = parsed.text?.trim() ?? '';

    if (texto.length < 80 && process.env.IMPORT_OCR_ENABLED === 'true') {
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('por');
        const { data } = await worker.recognize(buffer);
        await worker.terminate();
        if (data.text?.trim()) texto = data.text.trim();
      } catch {
        /* OCR opcional — ignora falha (tesseract.js not a runtime dep) */
      }
    }

    return texto;
  } finally {
    await parser.destroy();
  }
}

export async function extrairTexto(buffer: Buffer, formato: FormatoImportacao): Promise<string> {
  if (formato === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }
  if (formato === 'pdf') {
    return extrairPdf(buffer);
  }
  if (formato === 'md') {
    return buffer.toString('utf8').trim();
  }
  throw new Error(`Formato ${formato} não suporta extração de texto`);
}

function mapLlmItem(item: Record<string, unknown>): AcomodacaoImportDTO {
  const parsed = acomodacaoImportSchema.parse({
    codigoExterno: item.codigo_externo ?? item.codigoExterno,
    empreendimento: item.empreendimento ?? item.hotel,
    tipo: item.tipo,
    titulo: item.titulo ?? item.nome,
    quartos: item.quartos,
    capacidadeMax: item.capacidade_max ?? item.capacidadeMax,
    capacidadeBase: item.capacidade_base ?? item.capacidadeBase,
    configSala: item.config_sala ?? item.configSala,
    configBanheiro: item.config_banheiro ?? item.configBanheiro,
    precoDiaria: item.preco_diaria ?? item.precoDiaria,
    utensilios: item.utensilios,
    eletrodomesticos: item.eletrodomesticos,
    amenidades: item.amenidades,
    midia: item.midia,
  });
  return parsed;
}

export async function extrairViaLLM(
  texto: string,
  deps: LlmChatGatewayDeps = {},
): Promise<Record<string, unknown>[]> {
  const jsonInline = texto.match(/\[[\s\S]*\]/);
  if (jsonInline) {
    try {
      const arr = JSON.parse(jsonInline[0]) as Record<string, unknown>[];
      if (Array.isArray(arr)) return arr;
    } catch {
      /* segue para LLM */
    }
  }

  const apiKey = (deps.apiKey ?? process.env.OPENAI_API_KEY ?? '').trim();
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY ausente — necessária para importar .md/.docx/.pdf não estruturados',
    );
  }

  // PR-13e-followup-b: shared gateway (timeout / budget / safe logs).
  // sanitizeUser=false: chat cap (2k) + whitespace collapse would break import docs.
  const result = await llmChatCompletion(
    {
      surface: 'acomodacoes-import',
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0,
      maxTokens: LLM_GATEWAY_HARD_MAX_TOKENS,
      maxOutputChars: 20_000,
      jsonObject: true,
      sanitizeUser: false,
      messages: [
        { role: 'system', content: ACOM_IMPORT_SYSTEM_PROMPT },
        { role: 'user', content: sanitizeImportDocumentText(texto) },
      ],
    },
    { ...deps, apiKey },
  );

  if (!result.ok) {
    const statusPart = result.status ? ` (${result.status})` : '';
    throw new Error(`LLM falhou: ${result.error}${statusPart}`);
  }

  const content = result.content || '{"itens":[]}';
  let parsed: { itens?: Record<string, unknown>[] } | Record<string, unknown>[];
  try {
    parsed = JSON.parse(content) as { itens?: Record<string, unknown>[] };
  } catch {
    throw new Error('LLM falhou: empty');
  }
  const itens =
    (parsed as { itens?: Record<string, unknown>[] }).itens ??
    (Array.isArray(parsed) ? parsed : []);
  return itens.map((item) => {
    try {
      return mapLlmItem(item) as unknown as Record<string, unknown>;
    } catch {
      return item;
    }
  });
}

export async function parseArquivo(
  buffer: Buffer,
  nomeArquivo: string,
): Promise<Record<string, unknown>[]> {
  const formato = detectarFormato(nomeArquivo, buffer);

  if (formato === 'xlsx' || formato === 'csv') {
    return parseExcel(buffer, formato);
  }

  if (formato === 'docx' || formato === 'pdf' || formato === 'md') {
    const texto = await extrairTexto(buffer, formato);
    return extrairViaLLM(texto);
  }

  throw new Error(`Formato não suportado: ${formato}`);
}

module.exports = {
  detectarFormato,
  parseExcel,
  extrairTexto,
  extrairViaLLM,
  parseArquivo,
};
