/**
 * Script para executar migrations pendentes
 * 
 * Execute: node scripts/run-migrations.js
 * ou: npm run migrate
 * 
 * Executa todas as migrations SQL pendentes em ordem
 */

require('dotenv').config();

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Configuração do pool
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

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Executando migrations...\n');

    // 1. Criar tabela schema_migrations se não existir (fora de transação)
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Obter migrations já executadas
    const executedResult = await client.query(
      'SELECT version FROM schema_migrations ORDER BY version'
    );
    const executedVersions = executedResult.rows.map(row => row.version);

    // 3. Listar migrations disponíveis
    const scriptsDir = path.join(__dirname, '.');
    const migrationFiles = fs.readdirSync(scriptsDir)
      .filter(f => f.startsWith('migration-') && f.endsWith('.sql'))
      .sort();

    // 4. Filtrar migrations pendentes
    const pendingMigrations = migrationFiles.filter(file => {
      const match = file.match(/migration-(\d+)/);
      const version = match ? match[1] : null;
      return version && !executedVersions.includes(version);
    });

    if (pendingMigrations.length === 0) {
      console.log('✅ Todas as migrations já foram executadas!\n');
      return;
    }

    console.log(`📋 Migrations pendentes: ${pendingMigrations.length}\n`);

    // 5. Executar migrations pendentes (cada uma em sua própria transação)
    let successCount = 0;
    let errorCount = 0;

    for (const file of pendingMigrations) {
      const match = file.match(/migration-(\d+)/);
      const version = match ? match[1] : null;
      
      if (!version) {
        console.log(`⚠️  Pulando ${file} (número de migration inválido)`);
        continue;
      }

      const filePath = path.join(scriptsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Cada migration em sua própria transação
      try {
        await client.query('BEGIN');
        
        console.log(`📄 Executando ${file}...`);
        
        // Executar SQL
        await client.query(sql);
        
        // Registrar execução
        await client.query(
          'INSERT INTO schema_migrations (version, executed_at) VALUES ($1, NOW())',
          [version]
        );

        await client.query('COMMIT');

        successCount++;
        console.log(`   ✅ ${file} executada com sucesso\n`);
      } catch (error) {
        await client.query('ROLLBACK');
        
        errorCount++;
        console.error(`   ❌ Erro ao executar ${file}:`);
        console.error(`      ${error.message}\n`);
        
        console.log(`   ⚠️  Continuando com próxima migration...\n`);
      }
    }

    // Resumo
    console.log('='.repeat(50));
    console.log('📊 RESUMO');
    console.log('='.repeat(50));
    console.log(`Total de migrations: ${migrationFiles.length}`);
    console.log(`Já executadas: ${executedVersions.length}`);
    console.log(`Pendentes: ${pendingMigrations.length}`);
    console.log(`✅ Executadas com sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n⚠️  Algumas migrations falharam. Verifique os erros acima.');
      process.exit(1);
    } else {
      console.log('\n✅ Todas as migrations foram executadas com sucesso!');
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao executar migrations:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();

