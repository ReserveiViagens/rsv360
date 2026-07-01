import { nanoid } from 'nanoid';

/** Token público forte: prefixo rt- + 21 chars URL-safe (~126 bits). */
export function gerarTokenPublicoProposta(): string {
  return `rt-${nanoid(21)}`;
}

module.exports = { gerarTokenPublicoProposta };
