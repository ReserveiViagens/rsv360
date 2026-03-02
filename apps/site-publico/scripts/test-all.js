/**
 * ✅ SCRIPT DE TESTE COMPLETO - TODAS AS FASES
 * 
 * Executa todos os testes do sistema:
 * - Testes de integrações externas
 * - Testes de funcionalidades FASE 3
 * - Testes de funções SQL
 * - Testes de APIs
 */

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTestSuite(name, testFile) {
  log(`\n🧪 Executando: ${name}`, 'cyan');
  log('='.repeat(50), 'cyan');
  
  try {
    // Executar script de teste
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
      const child = spawn('node', [testFile], {
        stdio: 'inherit',
        shell: true,
      });
      
      child.on('close', (code) => {
        resolve(code === 0);
      });
      
      child.on('error', (error) => {
        log(`  ❌ Erro ao executar: ${error.message}`, 'red');
        resolve(false);
      });
    });
  } catch (error) {
    log(`  ❌ Erro: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 INICIANDO TESTES COMPLETOS DO SISTEMA\n', 'blue');
  log('='.repeat(50), 'blue');
  
  const results = {
    integrations: false,
    fase3: false,
    migrations: false,
  };
  
  // 1. Testes de Integrações
  results.integrations = await runTestSuite(
    'Testes de Integrações Externas',
    'scripts/test-integrations.js'
  );
  
  // 2. Testes FASE 3
  results.fase3 = await runTestSuite(
    'Testes de Funcionalidades FASE 3',
    'scripts/test-fase3-features.js'
  );
  
  // 3. Testes de Migrations (opcional)
  try {
    results.migrations = await runTestSuite(
      'Testes de Funções SQL',
      'scripts/test-migration-functions.js'
    );
  } catch (error) {
    log('  ⚠️  Testes de migrations pulados (opcional)', 'yellow');
    results.migrations = true; // Não é crítico
  }
  
  // Resumo final
  log('\n' + '='.repeat(50), 'blue');
  log('\n📊 RESUMO FINAL DOS TESTES:', 'cyan');
  log(`   ${results.integrations ? '✅' : '❌'} Integrações Externas`, results.integrations ? 'green' : 'red');
  log(`   ${results.fase3 ? '✅' : '❌'} Funcionalidades FASE 3`, results.fase3 ? 'green' : 'red');
  log(`   ${results.migrations ? '✅' : '⚠️ '} Funções SQL`, results.migrations ? 'green' : 'yellow');
  
  const allPassed = results.integrations && results.fase3;
  
  if (allPassed) {
    log('\n✅ TODOS OS TESTES CRÍTICOS PASSARAM!', 'green');
    log('   Sistema pronto para uso.', 'green');
  } else {
    log('\n⚠️  ALGUNS TESTES FALHARAM', 'yellow');
    log('   Revise as configurações e tente novamente.', 'yellow');
  }
  
  log('\n' + '='.repeat(50) + '\n', 'blue');
  
  process.exit(allPassed ? 0 : 1);
}

runAllTests().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  process.exit(1);
});

