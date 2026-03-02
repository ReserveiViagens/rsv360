/**
 * Script para verificar status das migrations
 * 
 * Execute: node scripts/check-migrations.js
 * ou: npm run db:check
 * 
 * Adaptado do guia "Novas Att RSV 360"
 */

require('dotenv').config();

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Configuração do pool usando variáveis do projeto
// Suporta tanto DATABASE_URL quanto variáveis individuais
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'onboarding_rsv_db',
      user: process.env.DB_USER || 'onboarding_rsv',
      password: process.env.DB_PASSWORD || 'senha_segura_123',
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
    };

const pool = new Pool(poolConfig);

async function checkMigrations() {
  try {
    console.log('🔍 Verificando migrations...\n');

    // 1. Verificar conexão
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco estabelecida');
    console.log(`   Timestamp: ${connectionTest.rows[0].now}\n`);

    // 2. Verificar se tabela schema_migrations existe
    const tableExists = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schema_migrations'
      )`
    );

    if (!tableExists.rows[0].exists) {
      console.log('⚠️  Tabela schema_migrations não existe');
      console.log('   Criando tabela...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          executed_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('✅ Tabela schema_migrations criada\n');
    } else {
      console.log('✅ Tabela schema_migrations existe\n');
    }

    // 3. Listar migrations executadas
    const executedMigrations = await pool.query(
      'SELECT version, executed_at FROM schema_migrations ORDER BY version'
    );

    console.log(`📋 Migrations executadas: ${executedMigrations.rows.length}`);
    if (executedMigrations.rows.length > 0) {
      executedMigrations.rows.forEach((row) => {
        console.log(`   ✓ ${row.version} - ${row.executed_at}`);
      });
    }
    console.log('');

    // 4. Listar migrations disponíveis
    const scriptsDir = path.join(__dirname, '.');
    const files = fs.readdirSync(scriptsDir)
      .filter(f => f.startsWith('migration-') && f.endsWith('.sql'))
      .sort();

    console.log(`📁 Migrations disponíveis: ${files.length}`);
    if (files.length > 0) {
      files.slice(0, 10).forEach((file) => {
        console.log(`   - ${file}`);
      });
      if (files.length > 10) {
        console.log(`   ... e mais ${files.length - 10} migrations`);
      }
    }

    // 5. Comparação
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO');
    console.log('='.repeat(50));
    console.log(`Total de migrations: ${files.length}`);
    console.log(`Executadas: ${executedMigrations.rows.length}`);
    console.log(`Pendentes: ${files.length - executedMigrations.rows.length}`);

    if (files.length === executedMigrations.rows.length) {
      console.log('\n✅ Todas as migrations foram executadas!');
    } else {
      console.log('\n⚠️  Existem migrations pendentes!');
      console.log('Execute: npm run migrate');
    }

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.message.includes('autenticação') || error.message.includes('password')) {
      console.error('\n⚠️  Erro de autenticação no banco de dados.');
      console.error('   Verifique as variáveis de ambiente:');
      console.error('   - DB_HOST');
      console.error('   - DB_PORT');
      console.error('   - DB_NAME');
      console.error('   - DB_USER');
      console.error('   - DB_PASSWORD');
      console.error('\n   Ou configure DATABASE_URL');
    }
    
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        // Ignorar erro ao fechar pool
      }
    }
    process.exit(1);
  }
}

checkMigrations();

