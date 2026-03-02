const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

async function checkUsers() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'users'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Tabela users existe');
      return true;
    } else {
      console.log('❌ Tabela users NÃO existe');
      return false;
    }
  } catch (error) {
    console.error('Erro:', error.message);
    return false;
  } finally {
    client.release();
    await pool.end();
  }
}

checkUsers();

