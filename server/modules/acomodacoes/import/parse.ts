import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import type { AcomodacaoImportDTO, FormatoImportacao } from './acomodacao-import.types';
import { acomodacaoImportSchema } from './acomodacao-import.types';

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
  const pdfParse = (await import('pdf-parse')).default;
  const parsed = await pdfParse(buffer);
  let texto = parsed.text?.trim() ?? '';

  if (texto.length < 80 && process.env.IMPORT_OCR_ENABLED === 'true') {
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('por');
      const { data } = await worker.recognize(buffer);
      await worker.terminate();
      if (data.text?.trim()) texto = data.text.trim();
    } catch {
      /* OCR opcional — ignora falha */
    }
  }

  return texto;
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

export async function extrairViaLLM(texto: string): Promise<Record<string, unknown>[]> {
  const jsonInline = texto.match(/\[[\s\S]*\]/);
  if (jsonInline) {
    try {
      const arr = JSON.parse(jsonInline[0]) as Record<string, unknown>[];
      if (Array.isArray(arr)) return arr;
    } catch {
      /* segue para LLM */
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY ausente — necessária para importar .md/.docx/.pdf não estruturados',
    );
  }

  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Extraia acomodações do texto e retorne JSON {"itens":[...]} com campos snake_case: codigo_externo, empreendimento, tipo, titulo, quartos, capacidade_max, config_sala, config_banheiro, preco_diaria, utensilios, eletrodomesticos, amenidades (listas). Use enums config_sala: nenhum|cama_na_sala|sofa_cama e config_banheiro: suite_wc_social|so_suite|so_wc_social.',
        },
        { role: 'user', content: texto.slice(0, 120_000) },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM falhou: ${err.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content ?? '{"itens":[]}';
  const parsed = JSON.parse(content) as { itens?: Record<string, unknown>[] };
  const itens = parsed.itens ?? (Array.isArray(parsed) ? parsed : []);
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
