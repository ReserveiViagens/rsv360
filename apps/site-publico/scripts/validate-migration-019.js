/**
 * Script para validar sintaxe SQL da migration 019
 * Valida sem executar (dry-run)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, 'migration-019-create-incentive-programs-table.sql');

console.log('🔍 Validando sintaxe SQL da migration 019...\n');

// Ler arquivo
if (!fs.existsSync(migrationFile)) {
  console.error('❌ Arquivo não encontrado:', migrationFile);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationFile, 'utf8');

// Validações básicas
console.log('📋 Validações básicas:');

// Verificar se contém CREATE TABLE
if (!sqlContent.includes('CREATE TABLE IF NOT EXISTS incentive_programs')) {
  console.error('❌ Tabela incentive_programs não encontrada');
  process.exit(1);
}
console.log('  ✅ Tabela incentive_programs encontrada');

if (!sqlContent.includes('CREATE TABLE IF NOT EXISTS host_program_enrollments')) {
  console.error('❌ Tabela host_program_enrollments não encontrada');
  process.exit(1);
}
console.log('  ✅ Tabela host_program_enrollments encontrada');

// Verificar ENUM
if (!sqlContent.includes('CREATE TYPE program_type_enum')) {
  console.error('❌ ENUM program_type_enum não encontrado');
  process.exit(1);
}
console.log('  ✅ ENUM program_type_enum encontrado');

// Verificar funções
const functions = [
  'check_program_eligibility',
  'get_eligible_programs',
  'apply_program_reward'
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
if (!sqlContent.includes('CREATE OR REPLACE VIEW active_incentive_programs')) {
  console.error('❌ View active_incentive_programs não encontrada');
  process.exit(1);
}
console.log('  ✅ View active_incentive_programs encontrada');

// Verificar triggers (deve ter 2)
const triggerMatches = sqlContent.match(/CREATE TRIGGER trigger_update/g);
const triggerCount = triggerMatches ? triggerMatches.length : 0;
if (triggerCount < 2) {
  console.error(`❌ Apenas ${triggerCount} triggers encontrados (esperado: 2)`);
  process.exit(1);
}
console.log(`  ✅ ${triggerCount} triggers encontrados`);

// Verificar índices (deve ter pelo menos 10: 6 para incentive_programs + 4 para host_program_enrollments)
// Nota: idx_programs_key é UNIQUE INDEX, não CREATE INDEX IF NOT EXISTS
const indexMatches = sqlContent.match(/CREATE INDEX IF NOT EXISTS/g);
const uniqueIndexMatches = sqlContent.match(/CREATE UNIQUE INDEX IF NOT EXISTS/g);
const indexCount = (indexMatches ? indexMatches.length : 0) + (uniqueIndexMatches ? uniqueIndexMatches.length : 0);
if (indexCount < 10) {
  console.error(`❌ Apenas ${indexCount} índices encontrados (esperado: 10+)`);
  process.exit(1);
}
console.log(`  ✅ ${indexCount} índices encontrados`);

// Verificar seed data (3 programas)
const insertMatches = sqlContent.match(/INSERT INTO incentive_programs/g);
const insertCount = insertMatches ? insertMatches.length : 0;
if (insertCount < 3) {
  console.error(`❌ Apenas ${insertCount} programas iniciais encontrados (esperado: 3)`);
  process.exit(1);
}
console.log(`  ✅ ${insertCount} programas iniciais encontrados`);

console.log('\n✅ Validação básica concluída com sucesso!');
console.log('\n📝 Próximo passo: Executar migration em ambiente de desenvolvimento');

