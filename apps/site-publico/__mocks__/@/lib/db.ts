/**
 * Manual Mock para @/lib/db
 * Permite controle total sobre queryDatabase nos testes
 */

import { jest } from '@jest/globals';

// Criar mocks que podem ser controlados externamente
export const mockQueryDatabase = jest.fn();
export const mockGetDbPool = jest.fn();
export const mockSetMockPool = jest.fn();
export const mockCloseDbPool = jest.fn();

// Exportar como módulo @/lib/db
export const queryDatabase = mockQueryDatabase;
export const getDbPool = mockGetDbPool;
export const __setMockPool = mockSetMockPool;
export const closeDbPool = mockCloseDbPool;
