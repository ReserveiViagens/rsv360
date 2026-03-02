/**
 * Script para comparar migrations executadas vs disponíveis
 * 
 * Execute: node scripts/compare-migrations.js
 * ou: npm run db:compare
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

async function compareMigrations() {
  try {
    console.log('📊 Comparando migrations...\n');

    // Verificar se tabela schema_migrations existe
    const tableExists = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schema_migrations'
      )`
    );

    let executedVersions = [];
    
    if (tableExists.rows[0].exists) {
      // Obter migrations do banco
      const { rows: executedMigrations } = await pool.query(
        'SELECT version FROM schema_migrations ORDER BY version'
      );
      executedVersions = executedMigrations.map(row => row.version);
    }

    console.log(`✅ Migrations executadas no banco: ${executedVersions.length}`);

    // Obter migrations disponíveis
    const scriptsDir = path.join(__dirname, '.');
    const files = fs.readdirSync(scriptsDir)
      .filter(f => f.startsWith('migration-') && f.endsWith('.sql'))
      .sort();

    console.log(`📁 Migrations disponíveis: ${files.length}\n`);

    // Encontrar pendentes
    const pendingMigrations = files.filter(file => {
      const match = file.match(/migration-(\d+)/);
      const version = match ? match[1] : null;
      return version && !executedVersions.includes(version);
    });

    // Encontrar executadas mas não encontradas nos arquivos
    const executedButMissing = executedVersions.filter(version => {
      return !files.some(file => file.includes(`migration-${version}`));
    });

    if (pendingMigrations.length === 0 && executedButMissing.length === 0) {
      console.log('✅ SUCESSO! Todas as migrations foram executadas!\n');
      console.log('Resumo:');
      console.log(`  - Total: ${files.length}`);
      console.log(`  - Executadas: ${executedVersions.length}`);
      console.log(`  - Pendentes: 0`);
    } else {
      if (pendingMigrations.length > 0) {
        console.log('⚠️  ATENÇÃO: Migrations pendentes!\n');
        console.log('Migrations pendentes:');
        pendingMigrations.forEach(file => {
          console.log(`  - ${file}`);
        });
        console.log('\nExecute: npm run migrate');
      }

      if (executedButMissing.length > 0) {
        console.log('\n⚠️  ATENÇÃO: Migrations executadas mas arquivos não encontrados!\n');
        console.log('Versões executadas sem arquivo:');
        executedButMissing.forEach(version => {
          console.log(`  - migration-${version}.sql`);
        });
      }
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

compareMigrations();

