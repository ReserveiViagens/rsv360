/**
 * Manual Mock para jsonwebtoken
 * Permite controle total sobre verify e sign nos testes
 */

import { jest } from '@jest/globals';

// Criar mocks que podem ser controlados externamente
export const mockVerify = jest.fn();
export const mockSign = jest.fn();
export const mockDecode = jest.fn();

// Exportar como módulo jsonwebtoken (named exports e default export)
export const verify = mockVerify;
export const sign = mockSign;
export const decode = mockDecode;

// Default export para compatibilidade com import * as jwt
const jsonwebtoken = {
  verify: mockVerify,
  sign: mockSign,
  decode: mockDecode,
};

export default jsonwebtoken;

