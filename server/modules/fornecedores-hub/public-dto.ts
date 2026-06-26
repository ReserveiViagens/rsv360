import type { FornecedorApi } from '../../../backend/src/db/schema/fornecedores-api';

/** Nunca expõe api_key (nem criptografada) nas respostas HTTP. */
export function toPublicFornecedorApi(row: FornecedorApi) {
  const { apiKey: _omit, ...rest } = row;
  return { ...rest, hasApiKey: Boolean(_omit) };
}
