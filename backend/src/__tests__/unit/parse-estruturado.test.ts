import * as XLSX from 'xlsx';
import { detectarFormato, parseExcel } from '../../../../server/modules/acomodacoes/import/parse';

function criarXlsxBuffer(rows: Record<string, unknown>[]): Buffer {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Sheet1');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

describe('parse-estruturado', () => {
  it('detecta .xlsx e .csv por extensão', () => {
    expect(detectarFormato('inventario.xlsx')).toBe('xlsx');
    expect(detectarFormato('inventario.csv')).toBe('csv');
    expect(detectarFormato('doc.pdf')).toBe('pdf');
  });

  it('parseExcel retorna linhas determinísticas do .xlsx', () => {
    const buffer = criarXlsxBuffer([
      {
        codigo_externo: 'A1',
        empreendimento: 'hotel-demo-1',
        tipo: 'apto',
        titulo: 'Suite',
        quartos: 2,
        capacidade_max: 4,
        config_sala: 'nenhum',
        config_banheiro: 'so_wc_social',
        preco_diaria: 300,
      },
    ]);

    const rows = parseExcel(buffer, 'xlsx');
    expect(rows).toHaveLength(1);
    expect(rows[0].codigo_externo).toBe('A1');
    expect(rows[0].titulo).toBe('Suite');
    expect(Number(rows[0].capacidade_max)).toBe(4);
  });

  it('parseExcel lê .csv via SheetJS', () => {
    const csv = [
      'codigo_externo,empreendimento,tipo,titulo,quartos,capacidade_max,config_sala,config_banheiro,preco_diaria',
      'B2,hotel-demo-2,casa,Casa 3Q,3,8,nenhum,so_suite,500',
    ].join('\n');
    const buffer = Buffer.from(csv, 'utf8');
    const rows = parseExcel(buffer, 'csv');
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].codigo_externo).toBe('B2');
    expect(rows[0].titulo).toBe('Casa 3Q');
  });
});
