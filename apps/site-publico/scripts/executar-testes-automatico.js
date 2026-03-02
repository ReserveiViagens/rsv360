/**
 * 🚀 SCRIPT DE EXECUÇÃO AUTOMÁTICA DE TESTES
 * Executa todas as tarefas da TODO_LIST_TESTES_COMPLETA.md de forma sistemática
 * 
 * Uso: node scripts/executar-testes-automatico.js [fase] [etapa]
 * Exemplo: node scripts/executar-testes-automatico.js fase1 etapa1.1
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[38;5;213m'
};

// Lista de arquivos de teste por categoria
const testFiles = {
  backend: [
    '__tests__/lib/group-travel/vote-service.test.ts',
    '__tests__/lib/group-travel/split-payment-service.test.ts',
    '__tests__/lib/group-travel/wishlist-service.test.ts',
    '__tests__/lib/group-travel/group-chat-service.test.ts',
    '__tests__/lib/smart-pricing-service.test.ts',
    '__tests__/lib/top-host-service.test.ts',
    '__tests__/lib/trip-invitation-service.test.ts'
  ],
  hooks: [
    '__tests__/hooks/useVote.test.tsx',
    '__tests__/hooks/useSharedWishlist.test.tsx',
    '__tests__/hooks/useSplitPayment.test.tsx',
    '__tests__/hooks/useGroupChat.test.tsx'
  ],
  components: [
    '__tests__/components/pricing/PricingChart.test.tsx',
    '__tests__/components/pricing/PricingCalendar.test.tsx',
    '__tests__/components/pricing/PricingConfig.test.tsx',
    '__tests__/components/quality/HostBadges.test.tsx',
    '__tests__/components/quality/QualityDashboard.test.tsx',
    '__tests__/components/quality/RatingDisplay.test.tsx',
    '__tests__/components/quality/IncentivesPanel.test.tsx'
  ],
  integration: [
    '__tests__/integration/wishlist-flow.test.ts',
    '__tests__/integration/split-payment-flow.test.ts',
    '__tests__/integration/group-chat-flow.test.ts',
    '__tests__/integration/permissions-flow.test.ts'
  ],
  performance: [
    '__tests__/performance/load-test.test.ts',
    '__tests__/performance/response-time.test.ts',
    '__tests__/performance/optimizations.test.ts'
  ]
};

// Função para executar comando
function execCommand(command, description) {
  console.log(`${colors.cyan}▶ ${description}${colors.reset}`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
}

// Função para executar teste específico
function runTest(testFile) {
  const command = `npm test -- ${testFile} --no-coverage --passWithNoTests`;
  const result = execCommand(command, `Executando ${testFile}`);
  
  if (result.success) {
    console.log(`${colors.green}✅ ${testFile} - PASSOU${colors.reset}`);
    return { file: testFile, status: 'passed' };
  } else {
    console.log(`${colors.yellow}⚠️  ${testFile} - FALHOU${colors.reset}`);
    return { file: testFile, status: 'failed', error: result.output };
  }
}

// Função para executar todos os testes de uma categoria
function runCategory(category) {
  console.log(`\n${colors.magenta}=== EXECUTANDO TESTES: ${category.toUpperCase()} ===${colors.reset}\n`);
  
  const files = testFiles[category] || [];
  const results = [];
  
  for (const file of files) {
    const result = runTest(file);
    results.push(result);
  }
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`\n${colors.cyan}📊 Resultados ${category}:${colors.reset}`);
  console.log(`   ✅ Passando: ${passed}`);
  console.log(`   ❌ Falhando: ${failed}`);
  console.log(`   📈 Taxa de sucesso: ${((passed / results.length) * 100).toFixed(1)}%\n`);
  
  return { category, results, passed, failed, total: results.length };
}

// Função para gerar relatório
function generateReport(allResults) {
  const reportPath = path.join(process.cwd(), 'RELATORIO_TESTES_AUTOMATICO.md');
  
  let report = `# 📊 RELATÓRIO DE TESTES AUTOMÁTICO\n\n`;
  report += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;
  report += `---\n\n`;
  
  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;
  
  for (const categoryResult of allResults) {
    totalPassed += categoryResult.passed;
    totalFailed += categoryResult.failed;
    totalTests += categoryResult.total;
    
    report += `## ${categoryResult.category.toUpperCase()}\n\n`;
    report += `- **Total:** ${categoryResult.total}\n`;
    report += `- **Passando:** ${categoryResult.passed}\n`;
    report += `- **Falhando:** ${categoryResult.failed}\n`;
    report += `- **Taxa de sucesso:** ${((categoryResult.passed / categoryResult.total) * 100).toFixed(1)}%\n\n`;
    
    if (categoryResult.failed > 0) {
      report += `### Testes Falhando:\n\n`;
      categoryResult.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          report += `- ❌ ${r.file}\n`;
        });
      report += `\n`;
    }
  }
  
  report += `---\n\n`;
  report += `## RESUMO GERAL\n\n`;
  report += `- **Total de testes:** ${totalTests}\n`;
  report += `- **Passando:** ${totalPassed}\n`;
  report += `- **Falhando:** ${totalFailed}\n`;
  report += `- **Taxa de sucesso geral:** ${((totalPassed / totalTests) * 100).toFixed(1)}%\n`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`${colors.green}📄 Relatório salvo em: ${reportPath}${colors.reset}`);
}

// Função principal
function main() {
  const args = process.argv.slice(2);
  const fase = args[0];
  const etapa = args[1];
  
  console.log(`${colors.magenta}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║  EXECUÇÃO AUTOMÁTICA DE TESTES         ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════╝${colors.reset}\n`);
  
  const allResults = [];
  
  // Executar por fase
  if (fase === 'fase1' || !fase) {
    console.log(`${colors.yellow}📊 FASE 1: VALIDAÇÃO BACKEND${colors.reset}\n`);
    allResults.push(runCategory('backend'));
  }
  
  if (fase === 'fase2' || !fase) {
    console.log(`${colors.yellow}📊 FASE 2: VALIDAÇÃO FRONTEND${colors.reset}\n`);
    allResults.push(runCategory('hooks'));
    allResults.push(runCategory('components'));
  }
  
  if (fase === 'fase3' || !fase) {
    console.log(`${colors.yellow}📊 FASE 3: VALIDAÇÃO INTEGRAÇÃO E2E${colors.reset}\n`);
    allResults.push(runCategory('integration'));
  }
  
  if (fase === 'fase4' || !fase) {
    console.log(`${colors.yellow}📊 FASE 4: VALIDAÇÃO PERFORMANCE${colors.reset}\n`);
    allResults.push(runCategory('performance'));
  }
  
  // Gerar relatório
  if (allResults.length > 0) {
    generateReport(allResults);
  }
  
  console.log(`\n${colors.green}✅ Execução concluída!${colors.reset}\n`);
}

// Executar
main();

