import { testClient } from '../test-utils/database-setup';

describe('CRM System - Unit Tests', () => {
  beforeAll(async () => {
    // Configurar dados de teste específicos para CRM
    await setupCRMTestData();
  });

  afterAll(async () => {
    // Limpar dados de teste
    await cleanupCRMTestData();
  });

  describe('User Management', () => {
    test('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const result = await testClient.query(
        'INSERT INTO crm_test.test_users (name, email) VALUES ($1, $2) RETURNING *',
        [userData.name, userData.email]
      );

      expect(result.rows[0]).toMatchObject({
        name: userData.name,
        email: userData.email
      });
      expect(result.rows[0].id).toBeDefined();
    });

    test('should retrieve user by email', async () => {
      const email = 'test@example.com';
      
      const result = await testClient.query(
        'SELECT * FROM crm_test.test_users WHERE email = $1',
        [email]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe(email);
    });

    test('should update user information', async () => {
      const userId = 1;
      const newName = 'Updated Test User';

      const result = await testClient.query(
        'UPDATE crm_test.test_users SET name = $1 WHERE id = $2 RETURNING *',
        [newName, userId]
      );

      expect(result.rows[0].name).toBe(newName);
    });
  });

  describe('Customer Management', () => {
    test('should create a new customer', async () => {
      const customerData = {
        user_id: 1,
        company_name: 'Test Company',
        contact_person: 'John Doe',
        email: 'john@testcompany.com',
        phone: '+1234567890'
      };

      const result = await testClient.query(
        `INSERT INTO crm_test.test_customers 
         (user_id, company_name, contact_person, email, phone) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          customerData.user_id,
          customerData.company_name,
          customerData.contact_person,
          customerData.email,
          customerData.phone
        ]
      );

      expect(result.rows[0]).toMatchObject({
        company_name: customerData.company_name,
        contact_person: customerData.contact_person,
        email: customerData.email,
        phone: customerData.phone
      });
    });
  });

  describe('Lead Management', () => {
    test('should create a new lead', async () => {
      const leadData = {
        source: 'Website',
        status: 'New',
        contact_name: 'Jane Doe',
        contact_email: 'jane@example.com'
      };

      const result = await testClient.query(
        `INSERT INTO crm_test.test_leads 
         (source, status, contact_name, contact_email) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [
          leadData.source,
          leadData.status,
          leadData.contact_name,
          leadData.contact_email
        ]
      );

      expect(result.rows[0]).toMatchObject({
        source: leadData.source,
        status: leadData.status,
        contact_name: leadData.contact_name,
        contact_email: leadData.contact_email
      });
    });

    test('should update lead status', async () => {
      const leadId = 1;
      const newStatus = 'Qualified';

      const result = await testClient.query(
        'UPDATE crm_test.test_leads SET status = $1 WHERE id = $2 RETURNING *',
        [newStatus, leadId]
      );

      expect(result.rows[0].status).toBe(newStatus);
    });
  });
});

// Funções auxiliares para configuração de testes
async function setupCRMTestData() {
  // Criar tabelas de teste se não existirem
  await testClient.query(`
    CREATE TABLE IF NOT EXISTS crm_test.test_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await testClient.query(`
    CREATE TABLE IF NOT EXISTS crm_test.test_customers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES crm_test.test_users(id),
      company_name VARCHAR(255),
      contact_person VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await testClient.query(`
    CREATE TABLE IF NOT EXISTS crm_test.test_leads (
      id SERIAL PRIMARY KEY,
      source VARCHAR(255),
      status VARCHAR(50),
      contact_name VARCHAR(255),
      contact_email VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function cleanupCRMTestData() {
  await testClient.query('TRUNCATE TABLE crm_test.test_leads CASCADE;');
  await testClient.query('TRUNCATE TABLE crm_test.test_customers CASCADE;');
  await testClient.query('TRUNCATE TABLE crm_test.test_users CASCADE;');
}
