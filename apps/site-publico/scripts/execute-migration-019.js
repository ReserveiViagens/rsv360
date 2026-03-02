/**
 * Script para executar migration 019 em ambiente de desenvolvimento
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, 'migration-019-create-incentive-programs-table.sql');
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rsv360_dev';

console.log('🚀 Executando migration 019: incentive_programs...\n');
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

    // Verificar tabelas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('incentive_programs', 'host_program_enrollments')
      ORDER BY table_name
    `);
    
    const tableNames = tablesResult.rows.map(r => r.table_name);
    if (!tableNames.includes('incentive_programs')) {
      console.error('❌ Tabela incentive_programs não foi criada');
      process.exit(1);
    }
    console.log('  ✅ Tabela incentive_programs criada');

    if (!tableNames.includes('host_program_enrollments')) {
      console.error('❌ Tabela host_program_enrollments não foi criada');
      process.exit(1);
    }
    console.log('  ✅ Tabela host_program_enrollments criada');

    // Verificar ENUM
    const enumResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typname = 'program_type_enum'
    `);
    
    if (enumResult.rows.length === 0) {
      console.error('❌ ENUM program_type_enum não foi criado');
      process.exit(1);
    }
    console.log('  ✅ ENUM program_type_enum criado');

    // Verificar funções
    const functions = [
      'check_program_eligibility',
      'get_eligible_programs',
      'apply_program_reward'
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
        AND table_name = 'active_incentive_programs'
    `);
    
    if (viewResult.rows.length === 0) {
      console.error('❌ View active_incentive_programs não foi criada');
      process.exit(1);
    }
    console.log('  ✅ View active_incentive_programs criada');

    // Verificar índices
    const indexResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND (tablename = 'incentive_programs' OR tablename = 'host_program_enrollments')
    `);
    
    console.log(`  ✅ ${indexResult.rows[0].count} índices criados`);

    // Verificar programas iniciais
    const programsResult = await client.query(`
      SELECT program_key, program_name 
      FROM incentive_programs
      ORDER BY priority DESC
    `);
    
    console.log(`  ✅ ${programsResult.rows.length} programas iniciais inseridos:`);
    programsResult.rows.forEach(p => {
      console.log(`     - ${p.program_key}: ${p.program_name}`);
    });

    // Testar função check_program_eligibility
    console.log('\n🧪 Testando funções...');
    try {
      const testResult = await client.query(`
        SELECT check_program_eligibility(1, 'welcome_bonus') as eligible
      `);
      console.log(`  ✅ check_program_eligibility(1, 'welcome_bonus') = ${testResult.rows[0].eligible}`);
    } catch (error) {
      console.log(`  ⚠️  check_program_eligibility: ${error.message} (pode ser esperado se host não existe)`);
    }

    console.log('\n🎉 Migration 019 executada e validada com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro ao executar migration:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

executeMigration();

