/**
 * Script completo para validar e executar ambas as migrations
 * Valida sintaxe, executa e testa todas as funções
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log('  VALIDAÇÃO E EXECUÇÃO COMPLETA - FASE 1: MIGRATIONS');
console.log('═══════════════════════════════════════════════════════════\n');

// Validar migration 018
console.log('📋 PASSO 1: Validar Migration 018\n');
try {
  execSync('node scripts/validate-migration-018.js', { stdio: 'inherit' });
  console.log('\n✅ Migration 018 validada com sucesso!\n');
} catch (error) {
  console.error('\n❌ Erro na validação da migration 018');
  process.exit(1);
}

// Validar migration 019
console.log('📋 PASSO 2: Validar Migration 019\n');
try {
  execSync('node scripts/validate-migration-019.js', { stdio: 'inherit' });
  console.log('\n✅ Migration 019 validada com sucesso!\n');
} catch (error) {
  console.error('\n❌ Erro na validação da migration 019');
  process.exit(1);
}

// Executar migration 018
console.log('═══════════════════════════════════════════════════════════');
console.log('  EXECUTANDO MIGRATIONS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📋 PASSO 3: Executar Migration 018\n');
try {
  execSync('node scripts/execute-migration-018.js', { stdio: 'inherit' });
  console.log('\n✅ Migration 018 executada com sucesso!\n');
} catch (error) {
  console.error('\n❌ Erro na execução da migration 018');
  process.exit(1);
}

// Executar migration 019
console.log('📋 PASSO 4: Executar Migration 019\n');
try {
  execSync('node scripts/execute-migration-019.js', { stdio: 'inherit' });
  console.log('\n✅ Migration 019 executada com sucesso!\n');
} catch (error) {
  console.error('\n❌ Erro na execução da migration 019');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════════════');
console.log('  ✅ FASE 1 COMPLETA - TODAS AS MIGRATIONS EXECUTADAS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📝 Próximo passo: Iniciar FASE 2 - TODOs Críticos');

