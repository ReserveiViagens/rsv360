import ExcelJS from 'exceljs';

// Propriedade intelectual: Reservei Viagens (RSV 360° / NEXUS TRAVEL 360°) - Douglas P Figueiredo.

type ExcelRow = Record<string, unknown>;

interface ExcelSheetInput {
  name: string;
  data: unknown;
}

const DEFAULT_COLUMN_WIDTH = 18;
const MAX_COLUMN_WIDTH = 48;

function normalizeRows(data: unknown): ExcelRow[] {
  if (!Array.isArray(data)) {
    if (data && typeof data === 'object') return [data as ExcelRow];
    return [];
  }

  return data.filter((row) => row && typeof row === 'object') as ExcelRow[];
}

function collectHeaders(rows: ExcelRow[]): string[] {
  const headers = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => headers.add(key));
  });

  return Array.from(headers);
}

function toCellValue(value: unknown): ExcelJS.CellValue {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return JSON.stringify(value);
}

function getColumnWidth(header: string): number {
  return Math.min(Math.max(header.length + 4, DEFAULT_COLUMN_WIDTH), MAX_COLUMN_WIDTH);
}

export async function createExcelWorkbookBuffer(sheets: ExcelSheetInput[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach(({ name, data }) => {
    const worksheet = workbook.addWorksheet(name);
    const rows = normalizeRows(data);

    if (rows.length === 0) return;

    const headers = collectHeaders(rows);
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: getColumnWidth(header),
    }));

    rows.forEach((row) => {
      const normalizedRow: Record<string, ExcelJS.CellValue> = {};
      headers.forEach((header) => {
        normalizedRow[header] = toCellValue(row[header]);
      });
      worksheet.addRow(normalizedRow);
    });
  });

  const rawBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(rawBuffer) ? rawBuffer : Buffer.from(rawBuffer);
}
