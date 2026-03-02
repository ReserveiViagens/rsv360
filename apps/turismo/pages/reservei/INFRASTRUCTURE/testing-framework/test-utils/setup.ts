import { config } from 'dotenv';
import { setupTestDatabase } from './database-setup';
import { setupTestServer } from './server-setup';

// Carregar variáveis de ambiente para testes
config({ path: '.env.test' });

// Configurações globais para testes
beforeAll(async () => {
  console.log('🚀 Configurando ambiente de testes...');
  
  // Configurar banco de dados de teste
  await setupTestDatabase();
  
  // Configurar servidor de teste
  await setupTestServer();
  
  console.log('✅ Ambiente de testes configurado com sucesso!');
});

afterAll(async () => {
  console.log('🧹 Limpando ambiente de testes...');
  
  // Limpar recursos de teste
  await cleanupTestResources();
  
  console.log('✅ Limpeza concluída!');
});

// Configurações específicas para cada tipo de teste
beforeEach(() => {
  // Reset de mocks antes de cada teste
  jest.clearAllMocks();
});

afterEach(() => {
  // Limpeza após cada teste
  jest.restoreAllMocks();
});

// Função para limpeza de recursos
async function cleanupTestResources() {
  // Implementar limpeza de recursos específicos
  // Ex: fechar conexões de banco, parar servidores, etc.
}

// Configurações de timeout para diferentes tipos de teste
jest.setTimeout(30000); // 30 segundos para testes de integração

// Configurações de ambiente
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'rsvuser';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'rsvpassword';
process.env.DB_NAME = process.env.DB_NAME || 'rsv_ecosystem_test';
