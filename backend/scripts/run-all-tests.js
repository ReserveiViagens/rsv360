#!/usr/bin/env node

/**
 * Script para executar todos os testes automaticamente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Executando: ${description}`, 'blue');
  log(`${'='.repeat(60)}`, 'cyan');
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    log(`✅ ${description} - SUCESSO`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - FALHOU`, 'red');
    return false;
  }
}

async function main() {
  log('\n🚀 INICIANDO EXECUÇÃO DE TODOS OS TESTES', 'cyan');
  log('='.repeat(60), 'cyan');

  const results = {
    unit: false,
    integration: false,
    e2e: false,
    performance: false,
    security: false,
  };

  // Verificar se servidor está rodando
  log('\n📡 Verificando se o servidor está rodando...', 'yellow');
  try {
    const http = require('http');
    const checkServer = () => {
      return new Promise((resolve) => {
        const req = http.get('http://localhost:5000/health', (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => {
          req.destroy();
          resolve(false);
        });
      });
    };
    
    const serverRunning = await checkServer();
    if (!serverRunning) {
      log('⚠️  Servidor não está rodando. Alguns testes podem falhar.', 'yellow');
      log('   Execute: npm start (em outro terminal)', 'yellow');
    } else {
      log('✅ Servidor está rodando', 'green');
    }
  } catch (error) {
    log('⚠️  Não foi possível verificar o servidor', 'yellow');
  }

  // 1. Testes Unitários
  log('\n📦 TESTES UNITÁRIOS', 'cyan');
  results.unit = runCommand('npm run test:unit', 'Testes Unitários');

  // 2. Testes de Integração
  log('\n🔗 TESTES DE INTEGRAÇÃO', 'cyan');
  results.integration = runCommand('npm run test:integration', 'Testes de Integração');

  // 3. Testes E2E
  log('\n🌐 TESTES END-TO-END', 'cyan');
  results.e2e = runCommand('npm run test:e2e', 'Testes E2E (Playwright)');

  // 4. Testes de Performance
  log('\n⚡ TESTES DE PERFORMANCE', 'cyan');
  results.performance = runCommand('npm run test:performance', 'Testes de Performance');

  // 5. Testes de Segurança
  log('\n🔒 TESTES DE SEGURANÇA', 'cyan');
  results.security = runCommand('npm run test:security', 'Testes de Segurança');

  // Resumo Final
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RESUMO FINAL DOS TESTES', 'cyan');
  log('='.repeat(60), 'cyan');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  const failedTests = totalTests - passedTests;

  log(`\n✅ Testes Passados: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`❌ Testes Falhados: ${failedTests}/${totalTests}`, failedTests > 0 ? 'red' : 'green');

  log('\nDetalhes:', 'cyan');
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`  ${icon} ${test.padEnd(15)}: ${passed ? 'PASSOU' : 'FALHOU'}`, color);
  });

  // Gerar relatório
  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: ((passedTests / totalTests) * 100).toFixed(2) + '%'
    }
  };

  const reportPath = path.join(__dirname, '..', 'test-results', 'summary.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`\n📄 Relatório salvo em: ${reportPath}`, 'cyan');

  // Exit code
  process.exit(failedTests > 0 ? 1 : 0);
}

main().catch(error => {
  log(`\n❌ Erro ao executar testes: ${error.message}`, 'red');
  process.exit(1);
});
