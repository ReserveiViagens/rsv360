/**
 * Script para configurar banco de dados
 * 
 * Execute: node scripts/setup-database.js
 * 
 * Este script ajuda a:
 * 1. Verificar se PostgreSQL está acessível
 * 2. Criar banco de dados se não existir
 * 3. Criar tabela schema_migrations
 * 4. Validar configuração
 */

require('dotenv').config();

const { Pool } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Configuração do pool
function getDbConfig() {
  // Tentar usar DATABASE_URL primeiro
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
    };
  }

  // Usar variáveis individuais
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'rsv_360_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };
}

async function testConnection(config) {
  try {
    const pool = new Pool(config);
    const result = await pool.query('SELECT NOW()');
    await pool.end();
    return { success: true, timestamp: result.rows[0].now };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createDatabase(dbName, user, password) {
  // Conectar ao banco padrão 'postgres' para criar novo banco
  const adminConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Conectar ao banco padrão
    user: user || process.env.DB_USER || 'postgres',
    password: password || process.env.DB_PASSWORD || '',
  };

  try {
    const pool = new Pool(adminConfig);
    
    // Verificar se banco já existe
    const checkResult = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      await pool.end();
      return { success: true, message: `Banco de dados '${dbName}' já existe` };
    }

    // Criar banco de dados
    await pool.query(`CREATE DATABASE ${dbName}`);
    await pool.end();
    
    return { success: true, message: `Banco de dados '${dbName}' criado com sucesso` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createSchemaMigrationsTable(config) {
  try {
    const pool = new Pool(config);
    
    // Criar tabela schema_migrations se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.end();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🗄️  CONFIGURAÇÃO DO BANCO DE DADOS\n');
  console.log('='.repeat(50));

  // Verificar variáveis de ambiente
  console.log('\n📋 Verificando variáveis de ambiente...\n');

  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasIndividualVars = !!(process.env.DB_HOST || process.env.DB_NAME);

  if (!hasDatabaseUrl && !hasIndividualVars) {
    console.log('❌ Nenhuma variável de banco de dados configurada!\n');
    console.log('Configure no arquivo .env:');
    console.log('  DATABASE_URL=postgresql://user:password@host:port/database');
    console.log('  OU');
    console.log('  DB_HOST=localhost');
    console.log('  DB_PORT=5432');
    console.log('  DB_NAME=rsv_360_db');
    console.log('  DB_USER=postgres');
    console.log('  DB_PASSWORD=sua_senha\n');
    process.exit(1);
  }

  const config = getDbConfig();
  console.log('✅ Variáveis de ambiente encontradas');
  console.log(`   Host: ${config.host || 'via DATABASE_URL'}`);
  console.log(`   Database: ${config.database || 'via DATABASE_URL'}`);
  console.log(`   User: ${config.user || 'via DATABASE_URL'}\n`);

  // Testar conexão
  console.log('🔌 Testando conexão com banco de dados...\n');
  const connectionTest = await testConnection(config);

  if (!connectionTest.success) {
    console.log(`❌ Erro ao conectar: ${connectionTest.error}\n`);

    // Tentar criar banco se erro for "database does not exist"
    if (connectionTest.error.includes('does not exist') || connectionTest.error.includes('não existe')) {
      console.log('💡 Banco de dados não existe. Deseja criar? (s/n)');
      const answer = await question('> ');
      
      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
        const dbName = config.database || await question('Nome do banco de dados [rsv_360_db]: ') || 'rsv_360_db';
        const user = config.user || await question('Usuário PostgreSQL [postgres]: ') || 'postgres';
        const password = config.password || await question('Senha PostgreSQL: ');
        
        console.log('\n📦 Criando banco de dados...');
        const createResult = await createDatabase(dbName, user, password);
        
        if (createResult.success) {
          console.log(`✅ ${createResult.message}\n`);
          
          // Tentar conectar novamente
          console.log('🔌 Testando conexão novamente...\n');
          const retryTest = await testConnection(config);
          
          if (retryTest.success) {
            console.log(`✅ Conexão estabelecida!`);
            console.log(`   Timestamp: ${retryTest.timestamp}\n`);
          } else {
            console.log(`❌ Ainda não foi possível conectar: ${retryTest.error}\n`);
            process.exit(1);
          }
        } else {
          console.log(`❌ Erro ao criar banco: ${createResult.error}\n`);
          console.log('💡 Crie o banco manualmente:');
          console.log(`   CREATE DATABASE ${dbName};\n`);
          process.exit(1);
        }
      } else {
        console.log('\n⚠️  Configure o banco de dados manualmente e tente novamente.\n');
        process.exit(1);
      }
    } else {
      console.log('\n💡 Verifique:');
      console.log('   1. PostgreSQL está rodando?');
      console.log('   2. Credenciais estão corretas?');
      console.log('   3. Banco de dados existe?\n');
      process.exit(1);
    }
  } else {
    console.log(`✅ Conexão estabelecida!`);
    console.log(`   Timestamp: ${connectionTest.timestamp}\n`);
  }

  // Criar tabela schema_migrations
  console.log('📋 Criando tabela schema_migrations...\n');
  const schemaResult = await createSchemaMigrationsTable(config);

  if (schemaResult.success) {
    console.log('✅ Tabela schema_migrations criada/verificada\n');
  } else {
    console.log(`⚠️  Aviso: ${schemaResult.error}\n`);
  }

  // Resumo final
  console.log('='.repeat(50));
  console.log('✅ CONFIGURAÇÃO CONCLUÍDA!\n');
  console.log('Próximos passos:');
  console.log('  1. npm run validate:env - Validar ambiente');
  console.log('  2. npm run db:check - Verificar migrations');
  console.log('  3. npm run db:compare - Comparar migrations');
  console.log('  4. npm run migrate - Executar migrations\n');

  rl.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro:', error.message);
  rl.close();
  process.exit(1);
});

