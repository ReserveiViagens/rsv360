/**
 * Script para validar sintaxe SQL da migration 018
 * Valida sem executar (dry-run)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, 'migration-018-create-host-points-table.sql');
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rsv360_dev';

console.log('🔍 Validando sintaxe SQL da migration 018...\n');

// Ler arquivo
if (!fs.existsSync(migrationFile)) {
  console.error('❌ Arquivo não encontrado:', migrationFile);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationFile, 'utf8');

// Validações básicas
console.log('📋 Validações básicas:');

// Verificar se contém CREATE TABLE
if (!sqlContent.includes('CREATE TABLE IF NOT EXISTS host_points')) {
  console.error('❌ Tabela host_points não encontrada');
  process.exit(1);
}
console.log('  ✅ Tabela host_points encontrada');

// Verificar ENUMs
if (!sqlContent.includes('CREATE TYPE points_type_enum')) {
  console.error('❌ ENUM points_type_enum não encontrado');
  process.exit(1);
}
console.log('  ✅ ENUM points_type_enum encontrado');

if (!sqlContent.includes('CREATE TYPE points_source_enum')) {
  console.error('❌ ENUM points_source_enum não encontrado');
  process.exit(1);
}
console.log('  ✅ ENUM points_source_enum encontrado');

// Verificar funções
const functions = [
  'calculate_host_total_points',
  'calculate_host_available_points',
  'expire_host_points',
  'add_host_points',
  'spend_host_points',
  'get_host_points_history'
];

let functionsFound = 0;
functions.forEach(func => {
  if (sqlContent.includes(`CREATE OR REPLACE FUNCTION ${func}`)) {
    console.log(`  ✅ Função ${func} encontrada`);
    functionsFound++;
  } else {
    console.error(`  ❌ Função ${func} não encontrada`);
  }
});

if (functionsFound !== functions.length) {
  console.error(`\n❌ Apenas ${functionsFound}/${functions.length} funções encontradas`);
  process.exit(1);
}

// Verificar view
if (!sqlContent.includes('CREATE OR REPLACE VIEW host_points_summary')) {
  console.error('❌ View host_points_summary não encontrada');
  process.exit(1);
}
console.log('  ✅ View host_points_summary encontrada');

// Verificar trigger
if (!sqlContent.includes('CREATE TRIGGER trigger_update_host_points_timestamp')) {
  console.error('❌ Trigger não encontrado');
  process.exit(1);
}
console.log('  ✅ Trigger encontrado');

// Verificar índices (deve ter pelo menos 8)
const indexMatches = sqlContent.match(/CREATE INDEX IF NOT EXISTS/g);
const indexCount = indexMatches ? indexMatches.length : 0;
if (indexCount < 8) {
  console.error(`❌ Apenas ${indexCount} índices encontrados (esperado: 8+)`);
  process.exit(1);
}
console.log(`  ✅ ${indexCount} índices encontrados`);

console.log('\n✅ Validação básica concluída com sucesso!');
console.log('\n📝 Próximo passo: Executar migration em ambiente de desenvolvimento');

