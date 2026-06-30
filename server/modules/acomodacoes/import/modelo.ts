import * as XLSX from 'xlsx';

export const COLUNAS_MODELO = [
  'codigo_externo',
  'empreendimento',
  'tipo',
  'titulo',
  'quartos',
  'capacidade_max',
  'config_sala',
  'config_banheiro',
  'preco_diaria',
  'utensilios',
  'eletrodomesticos',
  'amenidades',
] as const;

const LINHA_EXEMPLO: Record<string, string | number> = {
  codigo_externo: 'APT-101',
  empreendimento: 'hotel-demo-1',
  tipo: 'apto',
  titulo: 'Apartamento Família 2Q',
  quartos: 2,
  capacidade_max: 6,
  config_sala: 'nenhum',
  config_banheiro: 'so_wc_social',
  preco_diaria: 350,
  utensilios: 'panela;frigideira;copos',
  eletrodomesticos: 'geladeira;micro-ondas',
  amenidades: 'ar_condicionado;wifi',
};

export function gerarModeloXlsxBuffer(): Buffer {
  const exemplo = { ...LINHA_EXEMPLO };

  const sheet = XLSX.utils.json_to_sheet([exemplo], { header: [...COLUNAS_MODELO] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'acomodacoes');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

module.exports = { COLUNAS_MODELO, gerarModeloXlsxBuffer };
