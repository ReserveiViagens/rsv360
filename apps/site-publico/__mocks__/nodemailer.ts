/**
 * Manual Mock para nodemailer
 * Permite testes sem necessidade de nodemailer real
 */

import { jest } from '@jest/globals';

export const createTransport = jest.fn(() => ({
  sendMail: jest.fn().mockResolvedValue({
    messageId: 'mock-message-id',
    accepted: [],
    rejected: [],
    pending: [],
    response: '250 OK',
  }),
  verify: jest.fn().mockResolvedValue(true),
}));

export default {
  createTransport,
};

