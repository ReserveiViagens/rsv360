/**
 * Manual Mock para socket.io
 * Permite testes sem necessidade de socket.io real
 */

import { jest } from '@jest/globals';

export const Server = jest.fn(() => ({
  on: jest.fn(),
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  sockets: {
    emit: jest.fn(),
  },
}));

export default {
  Server,
};

