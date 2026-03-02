/**
 * ✅ SETUP JEST
 * Configurações globais para testes
 */

// Polyfills para Node.js
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock de variáveis de ambiente
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock de fetch global
global.fetch = jest.fn();

// Mock de Request e Response do Next.js (para api-auth.test.ts)
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(url, init) {
      Object.defineProperty(this, 'url', {
        value: url,
        writable: false,
        configurable: true,
      });
      this.init = init;
      this.headers = new Map();
    }
    get(key) {
      return this.headers.get(key) || null;
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = (init && init.status) || 200;
      this.statusText = (init && init.statusText) || 'OK';
      this.headers = new Map();
    }
    json() {
      return Promise.resolve(JSON.parse(this.body || '{}'));
    }
    text() {
      return Promise.resolve(this.body || '');
    }
  };
}

// ✅ Mock automático do módulo pg (usando __mocks__/pg.js)
// Este mock previne conexões reais ao banco durante os testes
// Para sobrescrever em um teste específico, use jest.mock('pg', ...) no teste
jest.mock('pg');

// ✅ Mock automático do módulo pg (usando __mocks__/pg.js)
// Este mock previne conexões reais ao banco durante os testes
// Para sobrescrever em um teste específico, use jest.mock('pg', ...) no teste
jest.mock('pg');

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Timeout global
jest.setTimeout(10000);

// Polyfill para TransformStream (necessário para Playwright em Node.js < 18)
if (typeof TransformStream === 'undefined') {
  global.TransformStream = class TransformStream {
    constructor(transformer) {
      this.readable = {
        getReader: () => ({
          read: () => Promise.resolve({ done: true, value: undefined }),
          cancel: () => Promise.resolve(),
          releaseLock: () => {},
        }),
        locked: false,
      };
      this.writable = {
        getWriter: () => ({
          write: () => Promise.resolve(),
          close: () => Promise.resolve(),
          abort: () => Promise.resolve(),
          releaseLock: () => {},
        }),
        locked: false,
      };
    }
  };
}
