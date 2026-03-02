// Script Node.js para criar tabelas users e user_profiles
// Sistema RSV 360 - Perfil de Usuario Completo

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuracoes do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

async function createUsersTable(pool) {
  const createUsersSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        document VARCHAR(50),
        password_hash VARCHAR(255),
        role VARCHAR(20) DEFAULT 'customer',
        status VARCHAR(20) DEFAULT 'active',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
  `;

  try {
    await pool.query(createUsersSQL);
    console.log('Tabela users criada/verificada com sucesso!');
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Tabela users ja existe');
      return true;
    }
    throw error;
  }
}

async function createUserProfilesTable(pool) {
  const sqlPath = path.join(__dirname, 'create-user-profiles-table.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  try {
    await pool.query(sqlContent);
    console.log('Script user_profiles executado com sucesso!');
    return true;
  } catch (error) {
    if (error.message && (
      error.message.includes('already exists') ||
      error.message.includes('duplicate')
    )) {
      console.log('Alguns objetos ja existem, continuando...');
      return true;
    }
    throw error;
  }
}

async function verifyTables(pool) {
  // Verificar users
  const usersCheck = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'"
  );
  
  // Verificar user_profiles
  const profilesCheck = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles'"
  );

  console.log('');
  console.log('Verificacao das tabelas:');
  console.log('  - users:', usersCheck.rows.length > 0 ? 'EXISTE' : 'NAO EXISTE');
  console.log('  - user_profiles:', profilesCheck.rows.length > 0 ? 'EXISTE' : 'NAO EXISTE');
  console.log('');

  if (profilesCheck.rows.length > 0) {
    const columns = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'user_profiles'
       ORDER BY ordinal_position`
    );

    console.log('Estrutura da tabela user_profiles:');
    console.log('Total de colunas:', columns.rows.length);
    console.log('');
    console.log('Primeiras 15 colunas:');
    columns.rows.slice(0, 15).forEach(col => {
      console.log(`  - ${col.column_name.padEnd(30)} ${col.data_type}`);
    });
    if (columns.rows.length > 15) {
      console.log(`  ... e mais ${columns.rows.length - 15} colunas`);
    }
    console.log('');
  }
}

async function execute() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('========================================');
    console.log('CRIAR TABELAS USERS E USER_PROFILES');
    console.log('========================================');
    console.log('');
    console.log('Conectando ao banco:', dbConfig.database);
    console.log('');

    // 1. Criar tabela users primeiro
    console.log('Passo 1: Criando tabela users...');
    await createUsersTable(pool);
    console.log('');

    // 2. Criar tabela user_profiles
    console.log('Passo 2: Criando tabela user_profiles...');
    await createUserProfilesTable(pool);
    console.log('');

    // 3. Verificar
    await verifyTables(pool);

    console.log('Pronto! As tabelas estao criadas.');
    console.log('');
    console.log('Proximos passos:');
    console.log('1. Atualizar APIs para usar os novos campos');
    console.log('2. Atualizar interface de perfil do usuario');
    console.log('3. Criar formulario de edicao de perfil completo');
    console.log('');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('ERRO ao executar script:');
    console.error(error.message);
    console.error('');
    await pool.end();
    process.exit(1);
  }
}

// Executar
execute();

