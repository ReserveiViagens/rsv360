/**
 * ✅ SCRIPT: EXECUTAR TODOS OS TESTES
 * Executa todos os testes automaticamente e gera relatório
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`Executando: ${description}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
  
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    return { success: true, output };
  } catch (error) {
    log(`\n❌ Erro ao executar: ${description}`, 'red');
    return { success: false, error: error.message };
  }
}

function generateReport(results) {
  const reportPath = path.join(process.cwd(), 'test-results', 'test-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`\n📊 Relatório salvo em: ${reportPath}`, 'green');
}

async function main() {
  const results = {
    timestamp: new Date().toISOString(),
    phases: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  log('\n🚀 INICIANDO EXECUÇÃO AUTOMÁTICA DE TESTES', 'blue');
  log('='.repeat(60), 'blue');

  // Fase 1: Testes Backend - Serviços
  log('\n📦 FASE 1: Testes Backend - Serviços', 'yellow');
  const backendServices = runCommand(
    'npm test -- __tests__/lib/ --passWithNoTests',
    'Testes de Serviços Backend'
  );
  results.phases.backendServices = backendServices;
  if (backendServices.success) results.summary.passed++;
  else results.summary.failed++;
  results.summary.total++;

  // Fase 2: Testes Backend - APIs
  log('\n🌐 FASE 2: Testes Backend - APIs', 'yellow');
  const backendAPIs = runCommand(
    'npm test -- __tests__/api/ --passWithNoTests',
    'Testes de APIs Backend'
  );
  results.phases.backendAPIs = backendAPIs;
  if (backendAPIs.success) results.summary.passed++;
  else results.summary.failed++;
  results.summary.total++;

  // Fase 3: Testes Frontend - Componentes
  log('\n⚛️  FASE 3: Testes Frontend - Componentes', 'yellow');
  const frontendComponents = runCommand(
    'npm test -- __tests__/components/ --passWithNoTests',
    'Testes de Componentes Frontend'
  );
  results.phases.frontendComponents = frontendComponents;
  if (frontendComponents.success) results.summary.passed++;
  else results.summary.failed++;
  results.summary.total++;

  // Fase 4: Testes E2E (se Playwright estiver configurado)
  log('\n🎭 FASE 4: Testes E2E', 'yellow');
  try {
    const e2eTests = runCommand(
      'npx playwright test --reporter=json',
      'Testes E2E com Playwright'
    );
    results.phases.e2eTests = e2eTests;
    if (e2eTests.success) results.summary.passed++;
    else results.summary.failed++;
    results.summary.total++;
  } catch (error) {
    log('⚠️  Playwright não configurado ou sem testes E2E', 'yellow');
    results.phases.e2eTests = { skipped: true };
  }

  // Gerar relatório
  generateReport(results);

  // Resumo final
  log('\n' + '='.repeat(60), 'blue');
  log('📊 RESUMO FINAL', 'blue');
  log('='.repeat(60), 'blue');
  log(`Total de Fases: ${results.summary.total}`, 'blue');
  log(`✅ Passou: ${results.summary.passed}`, 'green');
  log(`❌ Falhou: ${results.summary.failed}`, results.summary.failed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'blue');

  // Exit code baseado em resultados
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  process.exit(1);
});

