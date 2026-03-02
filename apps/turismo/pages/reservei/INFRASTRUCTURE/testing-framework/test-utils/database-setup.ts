import { Client } from 'pg';
import { config } from 'dotenv';

config({ path: '.env.test' });

const testDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'rsvuser',
  password: process.env.DB_PASSWORD || 'rsvpassword',
  database: process.env.DB_NAME || 'rsv_ecosystem_test'
};

let testClient: Client;

export async function setupTestDatabase() {
  console.log('🗄️ Configurando banco de dados de teste...');
  
  try {
    // Conectar ao banco de teste
    testClient = new Client(testDbConfig);
    await testClient.connect();
    console.log('✅ Conectado ao banco de dados de teste');
    
    // Criar banco de teste se não existir
    await createTestDatabaseIfNotExists();
    
    // Aplicar schemas de teste
    await applyTestSchemas();
    
    // Inserir dados de teste
    await insertTestData();
    
    console.log('✅ Banco de dados de teste configurado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de teste:', error);
    throw error;
  }
}

export async function cleanupTestDatabase() {
  console.log('🧹 Limpando banco de dados de teste...');
  
  try {
    if (testClient) {
      // Limpar dados de teste
      await clearTestData();
      
      // Fechar conexão
      await testClient.end();
      console.log('✅ Conexão com banco de teste fechada');
    }
  } catch (error) {
    console.error('❌ Erro ao limpar banco de teste:', error);
    throw error;
  }
}

async function createTestDatabaseIfNotExists() {
  const adminClient = new Client({
    host: testDbConfig.host,
    port: testDbConfig.port,
    user: testDbConfig.user,
    password: testDbConfig.password,
    database: 'postgres'
  });
  
  try {
    await adminClient.connect();
    
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${testDbConfig.database}'`;
    const dbExists = await adminClient.query(checkDbQuery);
    
    if (dbExists.rows.length === 0) {
      console.log(`📝 Criando banco de teste: ${testDbConfig.database}`);
      await adminClient.query(`CREATE DATABASE "${testDbConfig.database}"`);
      console.log('✅ Banco de teste criado');
    } else {
      console.log('✅ Banco de teste já existe');
    }
  } finally {
    await adminClient.end();
  }
}

async function applyTestSchemas() {
  console.log('📋 Aplicando schemas de teste...');
  
  // Aplicar schemas básicos para testes
  const schemas = [
    `CREATE SCHEMA IF NOT EXISTS crm_test;`,
    `CREATE SCHEMA IF NOT EXISTS booking_test;`,
    `CREATE SCHEMA IF NOT EXISTS financial_test;`,
    `CREATE SCHEMA IF NOT EXISTS product_test;`,
    `CREATE SCHEMA IF NOT EXISTS marketing_test;`,
    `CREATE SCHEMA IF NOT EXISTS analytics_test;`,
    `CREATE SCHEMA IF NOT EXISTS admin_test;`,
    `CREATE SCHEMA IF NOT EXISTS inventory_test;`,
    `CREATE SCHEMA IF NOT EXISTS payment_test;`,
    `CREATE SCHEMA IF NOT EXISTS public_test;`
  ];
  
  for (const schema of schemas) {
    await testClient.query(schema);
  }
  
  console.log('✅ Schemas de teste aplicados');
}

async function insertTestData() {
  console.log('📊 Inserindo dados de teste...');
  
  // Inserir dados básicos para testes
  const testData = [
    `INSERT INTO crm_test.test_users (name, email) VALUES 
     ('Test User 1', 'test1@example.com'),
     ('Test User 2', 'test2@example.com')
     ON CONFLICT (email) DO NOTHING;`,
    
    `INSERT INTO booking_test.test_hotels (name, location) VALUES 
     ('Test Hotel 1', 'Test Location 1'),
     ('Test Hotel 2', 'Test Location 2')
     ON CONFLICT (name) DO NOTHING;`
  ];
  
  for (const query of testData) {
    try {
      await testClient.query(query);
    } catch (error) {
      // Ignorar erros de tabelas que não existem ainda
      console.log('⚠️ Tabela de teste não encontrada, será criada durante os testes');
    }
  }
  
  console.log('✅ Dados de teste inseridos');
}

async function clearTestData() {
  console.log('🧹 Limpando dados de teste...');
  
  const clearQueries = [
    'TRUNCATE TABLE crm_test.test_users CASCADE;',
    'TRUNCATE TABLE booking_test.test_hotels CASCADE;',
    'TRUNCATE TABLE financial_test.test_transactions CASCADE;',
    'TRUNCATE TABLE product_test.test_products CASCADE;',
    'TRUNCATE TABLE marketing_test.test_campaigns CASCADE;',
    'TRUNCATE TABLE analytics_test.test_events CASCADE;',
    'TRUNCATE TABLE admin_test.test_users CASCADE;',
    'TRUNCATE TABLE inventory_test.test_items CASCADE;',
    'TRUNCATE TABLE payment_test.test_payments CASCADE;',
    'TRUNCATE TABLE public_test.test_visitors CASCADE;'
  ];
  
  for (const query of clearQueries) {
    try {
      await testClient.query(query);
    } catch (error) {
      // Ignorar erros de tabelas que não existem
    }
  }
  
  console.log('✅ Dados de teste limpos');
}

export { testClient };
