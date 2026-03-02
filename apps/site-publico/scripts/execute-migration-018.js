/**
 * Script para executar migration 018 em ambiente de desenvolvimento
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, 'migration-018-create-host-points-table.sql');
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rsv360_dev';

console.log('🚀 Executando migration 018: host_points...\n');
console.log('📁 Arquivo:', migrationFile);
console.log('🗄️  Database:', dbUrl.replace(/:[^:@]+@/, ':****@')); // Ocultar senha
console.log('');

// Ler arquivo SQL
if (!fs.existsSync(migrationFile)) {
  console.error('❌ Arquivo não encontrado:', migrationFile);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationFile, 'utf8');

// Conectar ao banco
const client = new Client({
  connectionString: dbUrl
});

async function executeMigration() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    // Executar migration
    console.log('📝 Executando migration...');
    await client.query(sqlContent);
    console.log('✅ Migration executada com sucesso!\n');

    // Validar criação
    console.log('🔍 Validando criação de objetos...\n');

    // Verificar tabela
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'host_points'
    `);
    
    if (tableResult.rows.length === 0) {
      console.error('❌ Tabela host_points não foi criada');
      process.exit(1);
    }
    console.log('  ✅ Tabela host_points criada');

    // Verificar ENUMs
    const enumResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typname IN ('points_type_enum', 'points_source_enum')
    `);
    
    if (enumResult.rows.length !== 2) {
      console.error('❌ ENUMs não foram criados corretamente');
      process.exit(1);
    }
    console.log('  ✅ ENUMs criados:', enumResult.rows.map(r => r.typname).join(', '));

    // Verificar funções
    const functions = [
      'calculate_host_total_points',
      'calculate_host_available_points',
      'expire_host_points',
      'add_host_points',
      'spend_host_points',
      'get_host_points_history'
    ];

    for (const func of functions) {
      const funcResult = await client.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
          AND routine_name = $1
      `, [func]);
      
      if (funcResult.rows.length === 0) {
        console.error(`  ❌ Função ${func} não foi criada`);
        process.exit(1);
      }
      console.log(`  ✅ Função ${func} criada`);
    }

    // Verificar view
    const viewResult = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
        AND table_name = 'host_points_summary'
    `);
    
    if (viewResult.rows.length === 0) {
      console.error('❌ View host_points_summary não foi criada');
      process.exit(1);
    }
    console.log('  ✅ View host_points_summary criada');

    // Verificar índices
    const indexResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename = 'host_points'
        AND indexname LIKE 'idx_host_points%'
    `);
    
    console.log(`  ✅ ${indexResult.rows.length} índices criados`);

    // Testar função calculate_host_total_points
    console.log('\n🧪 Testando funções...');
    const testResult = await client.query('SELECT calculate_host_total_points(1) as total');
    console.log(`  ✅ calculate_host_total_points(1) = ${testResult.rows[0].total}`);

    console.log('\n🎉 Migration 018 executada e validada com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro ao executar migration:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

executeMigration();

