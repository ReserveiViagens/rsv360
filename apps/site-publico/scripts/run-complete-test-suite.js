/**
 * ✅ SCRIPT: EXECUTAR SUITE COMPLETA DE TESTES
 * Executa todos os testes, corrige problemas e gera relatório final
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
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTestSuite(name, command) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`🧪 ${name}`, 'cyan');
  log(`${'='.repeat(70)}`, 'cyan');
  
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: process.cwd(),
      timeout: 60000, // 60 segundos
    });
    
    // Analisar output
    const passedMatch = output.match(/Tests:\s+(\d+)\s+passed/);
    const failedMatch = output.match(/Tests:\s+\d+\s+passed,\s+(\d+)\s+failed/);
    const suitesMatch = output.match(/Test Suites:\s+(\d+)\s+passed/);
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const suites = suitesMatch ? parseInt(suitesMatch[1]) : 0;
    
    if (failed === 0 && suites > 0) {
      log(`✅ ${name} - ${passed} testes passaram`, 'green');
      return { success: true, passed, failed, suites };
    } else if (suites === 0) {
      log(`⚠️  ${name} - Sem testes encontrados`, 'yellow');
      return { success: true, passed: 0, failed: 0, suites: 0, skipped: true };
    } else {
      log(`❌ ${name} - ${failed} testes falharam`, 'red');
      return { success: false, passed, failed, suites };
    }
  } catch (error) {
    const output = error.stdout?.toString() || error.message || '';
    log(`❌ ${name} - Erro na execução`, 'red');
    return { success: false, error: error.message, output };
  }
}

async function main() {
  const results = {
    timestamp: new Date().toISOString(),
    suites: {},
    summary: {
      totalSuites: 0,
      passedSuites: 0,
      failedSuites: 0,
      skippedSuites: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
    },
  };

  log('\n🚀 EXECUTANDO SUITE COMPLETA DE TESTES - FASE 4', 'magenta');
  log('='.repeat(70), 'magenta');

  // 1. Testes Backend - Cache Service
  const cacheService = runTestSuite(
    'Cache Service',
    'npm test -- __tests__/lib/cache-service.test.ts --passWithNoTests --silent'
  );
  results.suites.cacheService = cacheService;
  results.summary.totalSuites++;
  if (cacheService.success) {
    results.summary.passedSuites++;
    results.summary.passedTests += cacheService.passed || 0;
  } else if (cacheService.skipped) {
    results.summary.skippedSuites++;
  } else {
    results.summary.failedSuites++;
    results.summary.failedTests += cacheService.failed || 0;
  }

  // 2. Testes Backend - APIs
  const qualityLeaderboard = runTestSuite(
    'Quality Leaderboard API',
    'npm test -- __tests__/api/quality-leaderboard.test.ts --passWithNoTests --silent'
  );
  results.suites.qualityLeaderboard = qualityLeaderboard;
  results.summary.totalSuites++;
  if (qualityLeaderboard.success) {
    results.summary.passedSuites++;
    results.summary.passedTests += qualityLeaderboard.passed || 0;
  } else if (qualityLeaderboard.skipped) {
    results.summary.skippedSuites++;
  } else {
    results.summary.failedSuites++;
    results.summary.failedTests += qualityLeaderboard.failed || 0;
  }

  // 3. Testes Frontend - Componentes
  const hostBadge = runTestSuite(
    'HostBadge Component',
    'npm test -- __tests__/components/HostBadge.test.tsx --passWithNoTests --silent'
  );
  results.suites.hostBadge = hostBadge;
  results.summary.totalSuites++;
  if (hostBadge.success) {
    results.summary.passedSuites++;
    results.summary.passedTests += hostBadge.passed || 0;
  } else if (hostBadge.skipped) {
    results.summary.skippedSuites++;
  } else {
    results.summary.failedSuites++;
    results.summary.failedTests += hostBadge.failed || 0;
  }

  const qualityScore = runTestSuite(
    'QualityScore Component',
    'npm test -- __tests__/components/QualityScore.test.tsx --passWithNoTests --silent'
  );
  results.suites.qualityScore = qualityScore;
  results.summary.totalSuites++;
  if (qualityScore.success) {
    results.summary.passedSuites++;
    results.summary.passedTests += qualityScore.passed || 0;
  } else if (qualityScore.skipped) {
    results.summary.skippedSuites++;
  } else {
    results.summary.failedSuites++;
    results.summary.failedTests += qualityScore.failed || 0;
  }

  // Gerar relatório
  const reportDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, 'complete-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`\n📊 Relatório completo salvo em: ${reportPath}`, 'green');

  // Resumo final
  log('\n' + '='.repeat(70), 'magenta');
  log('📊 RESUMO FINAL - SUITE COMPLETA DE TESTES', 'magenta');
  log('='.repeat(70), 'magenta');
  log(`Total de Suites: ${results.summary.totalSuites}`, 'blue');
  log(`✅ Passou: ${results.summary.passedSuites}`, 'green');
  log(`⚠️  Pulado: ${results.summary.skippedSuites}`, 'yellow');
  log(`❌ Falhou: ${results.summary.failedSuites}`, results.summary.failedSuites > 0 ? 'red' : 'green');
  log(`\nTotal de Testes: ${results.summary.passedTests + results.summary.failedTests}`, 'blue');
  log(`✅ Testes Passaram: ${results.summary.passedTests}`, 'green');
  log(`❌ Testes Falharam: ${results.summary.failedTests}`, results.summary.failedTests > 0 ? 'red' : 'green');
  log('='.repeat(70), 'magenta');

  // Exit code
  process.exit(results.summary.failedSuites > 0 || results.summary.failedTests > 0 ? 1 : 0);
}

main().catch((error) => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  process.exit(1);
});

