/**
 * Contrato canônico de oferta normalizada (Hub de Fornecedores + comparativo_cache).
 * Tipos apenas — validação Zod fica no backend (fornecedores-hub).
 */
export type OfertaNormalizada = {
  fornecedor: string;
  tipo: 'hospedagem' | 'ingresso' | 'transporte';
  titulo: string;
  preco: number;
  moeda: 'BRL';
  imagens: string[];
  descricao: string;
  /** URL/origem para comprovação (CDC/CONAR) */
  fonte: string;
  /** ISO datetime — preço datado */
  capturadoEm: string;
};
