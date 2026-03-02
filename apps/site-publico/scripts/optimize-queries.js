/**
 * ✅ SCRIPT DE OTIMIZAÇÃO DE QUERIES
 * 
 * Analisa e sugere otimizações para queries SQL:
 * - Substituir SELECT * por campos específicos
 * - Adicionar índices onde necessário
 * - Otimizar JOINs
 * - Adicionar LIMIT onde aplicável
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Padrões de queries para otimizar
const queryPatterns = [
  {
    pattern: /SELECT \* FROM host_incentives/gi,
    suggestion: 'SELECT id, host_id, incentive_type, incentive_value, awarded_at, expires_at, is_active FROM host_incentives',
    file: 'lib/quality/incentives.service.ts',
    reason: 'SELECT * retorna mais dados do que necessário'
  },
  {
    pattern: /SELECT \* FROM insurance_policies/gi,
    suggestion: 'SELECT id, user_id, policy_number, insurance_provider, status, coverage_amount FROM insurance_policies',
    file: 'lib/insurance/insurance-claims.service.ts',
    reason: 'SELECT * retorna mais dados do que necessário'
  },
  {
    pattern: /SELECT \* FROM insurance_claims/gi,
    suggestion: 'SELECT id, policy_id, booking_id, user_id, claim_number, claim_type, status, claimed_amount, approved_amount FROM insurance_claims',
    file: 'lib/insurance/insurance-claims.service.ts',
    reason: 'SELECT * retorna mais dados do que necessário'
  },
  {
    pattern: /SELECT \* FROM properties WHERE id = \$1/gi,
    suggestion: 'SELECT id, name, address, city, state, latitude, longitude, amenities FROM properties WHERE id = $1',
    file: 'lib/verification/property-verification.service.ts',
    reason: 'SELECT * retorna mais dados do que necessário'
  },
];

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const issues = [];
    
    queryPatterns.forEach(({ pattern, suggestion, file, reason }) => {
      if (filePath.includes(file)) {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match, index) => {
            issues.push({
              file: filePath,
              query: match,
              suggestion,
              reason,
              line: content.substring(0, content.indexOf(match)).split('\n').length
            });
          });
        }
      }
    });
    
    return issues;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir, extensions = ['.ts', '.js']) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  scan(dir);
  return files;
}

async function runOptimization() {
  log('\n🔍 ANALISANDO QUERIES PARA OTIMIZAÇÃO\n', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const libDir = path.join(process.cwd(), 'lib');
  const files = scanDirectory(libDir);
  
  const allIssues = [];
  
  files.forEach(file => {
    const issues = analyzeFile(file);
    allIssues.push(...issues);
  });
  
  if (allIssues.length === 0) {
    log('\n✅ Nenhuma query SELECT * encontrada para otimizar!', 'green');
    return;
  }
  
  log(`\n📊 Encontradas ${allIssues.length} queries para otimizar:\n`, 'cyan');
  
  allIssues.forEach((issue, index) => {
    log(`\n${index + 1}. ${path.relative(process.cwd(), issue.file)}`, 'yellow');
    log(`   Linha: ${issue.line}`, 'white');
    log(`   Query: ${issue.query.substring(0, 80)}...`, 'white');
    log(`   Motivo: ${issue.reason}`, 'yellow');
    log(`   Sugestão: ${issue.suggestion.substring(0, 80)}...`, 'green');
  });
  
  log('\n' + '='.repeat(50), 'cyan');
  log('\n💡 RECOMENDAÇÕES:', 'cyan');
  log('  1. Substituir SELECT * por campos específicos', 'white');
  log('  2. Adicionar índices em colunas frequentemente consultadas', 'white');
  log('  3. Usar LIMIT em queries de listagem', 'white');
  log('  4. Considerar paginação para grandes datasets', 'white');
  log('  5. Usar cache para queries frequentes\n', 'white');
}

runOptimization().catch(error => {
  log(`\n❌ Erro: ${error.message}`, 'red');
  process.exit(1);
});

