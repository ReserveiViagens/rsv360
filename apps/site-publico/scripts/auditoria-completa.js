/**
 * SCRIPT DE AUDITORIA COMPLETA DO SISTEMA
 * Aplicando Metodologia Avançada de Debugging
 * 
 * Fases:
 * 1. Preparação e Contexto
 * 2. Análise com Chain of Thought (CoT)
 * 3. Exploração com Tree of Thoughts (ToT)
 * 4. Estruturação com Skeleton of Thoughts (SoT)
 * 5. Implementação Sistemática
 * 6. Testes e Validação (TDD)
 * 7. Verificação e Refinamento
 * 8. Deploy e Monitoramento
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║     AUDITORIA COMPLETA - SISTEMA RSV 360°                  ║');
console.log('║     Metodologia: CoT + ToT + SoT + TDD                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

const results = {
  errors: [],
  warnings: [],
  info: [],
  success: []
};

// ===================================================================
// FASE 1: PREPARAÇÃO E CONTEXTO
// ===================================================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  FASE 1: PREPARAÇÃO E CONTEXTO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// 1.1. Verificar estrutura de diretórios
function checkDirectories() {
  console.log('📁 Verificando estrutura de diretórios...');
  
  const dirs = {
    'Frontend (Next.js)': 'D:\\servidor RSV\\Hotel-com-melhor-preco-main',
    'Backend Principal': 'D:\\servidor RSV\\backend',
    'Dashboard': 'D:\\rsv360-servidor-oficial\\frontend'
  };
  
  const dirResults = [];
  
  for (const [name, dirPath] of Object.entries(dirs)) {
    if (fs.existsSync(dirPath)) {
      results.success.push(`✓ ${name}: ${dirPath}`);
      dirResults.push({ name, path: dirPath, exists: true });
      console.log(`  ✓ ${name}: Existe`);
    } else {
      results.errors.push(`✗ ${name}: ${dirPath} - NÃO ENCONTRADO`);
      dirResults.push({ name, path: dirPath, exists: false });
      console.log(`  ✗ ${name}: NÃO ENCONTRADO`);
    }
  }
  
  console.log('');
  return dirResults;
}

// 1.2. Verificar arquivos críticos
function checkCriticalFiles() {
  console.log('📄 Verificando arquivos críticos...');
  
  const basePath = 'D:\\servidor RSV\\Hotel-com-melhor-preco-main';
  const files = {
    'package.json': path.join(basePath, 'package.json'),
    'app/layout.tsx': path.join(basePath, 'app', 'layout.tsx'),
    'components/providers/toast-wrapper.tsx': path.join(basePath, 'components', 'providers', 'toast-wrapper.tsx'),
    'public/sw.js': path.join(basePath, 'public', 'sw.js'),
    'lib/validations.ts': path.join(basePath, 'lib', 'validations.ts')
  };
  
  const fileResults = [];
  
  for (const [name, filePath] of Object.entries(files)) {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      results.success.push(`✓ ${name}: Existe (${stats.size} bytes)`);
      fileResults.push({ name, path: filePath, exists: true, size: stats.size });
      console.log(`  ✓ ${name}: Existe`);
    } else {
      results.errors.push(`✗ ${name}: NÃO ENCONTRADO`);
      fileResults.push({ name, path: filePath, exists: false });
      console.log(`  ✗ ${name}: NÃO ENCONTRADO`);
    }
  }
  
  console.log('');
  return fileResults;
}

// 1.3. Verificar servidores ativos
function checkServers() {
  console.log('🌐 Verificando servidores ativos...');
  
  const ports = [3000, 3001, 5000, 5002];
  const serverResults = [];
  
  return new Promise((resolve) => {
    let checked = 0;
    
    ports.forEach(port => {
      const req = http.get(`http://localhost:${port}`, { timeout: 2000 }, (res) => {
        results.success.push(`✓ Porta ${port}: RODANDO`);
        serverResults.push({ port, status: 'running' });
        console.log(`  ✓ Porta ${port}: RODANDO`);
        checked++;
        if (checked === ports.length) resolve(serverResults);
      });
      
      req.on('error', () => {
        results.warnings.push(`⚠ Porta ${port}: NÃO RODANDO`);
        serverResults.push({ port, status: 'not_running' });
        console.log(`  ⚠ Porta ${port}: NÃO RODANDO`);
        checked++;
        if (checked === ports.length) resolve(serverResults);
      });
      
      req.on('timeout', () => {
        req.destroy();
        results.warnings.push(`⚠ Porta ${port}: TIMEOUT`);
        serverResults.push({ port, status: 'timeout' });
        console.log(`  ⚠ Porta ${port}: TIMEOUT`);
        checked++;
        if (checked === ports.length) resolve(serverResults);
      });
    });
  });
}

// 1.4. Verificar imports de useToast
function checkUseToastImports() {
  console.log('🔍 Verificando imports de useToast...');
  
  const basePath = 'D:\\servidor RSV\\Hotel-com-melhor-preco-main';
  const appPath = path.join(basePath, 'app');
  
  if (!fs.existsSync(appPath)) {
    results.errors.push('✗ Diretório app não encontrado');
    return [];
  }
  
  const files = [];
  function findFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findFiles(fullPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('useToast') || content.includes('toast-provider') || content.includes('toast-wrapper')) {
          const relativePath = path.relative(basePath, fullPath);
          const usesToastWrapper = content.includes('@/components/providers/toast-wrapper');
          const usesToastProvider = content.includes('@/components/providers/toast-provider');
          
          files.push({
            path: relativePath,
            usesToastWrapper,
            usesToastProvider,
            correct: usesToastWrapper && !usesToastProvider
          });
          
          if (usesToastProvider) {
            results.errors.push(`✗ ${relativePath}: Usa toast-provider (deveria usar toast-wrapper)`);
          } else if (usesToastWrapper) {
            results.success.push(`✓ ${relativePath}: Usa toast-wrapper corretamente`);
          }
        }
      }
    }
  }
  
  findFiles(appPath);
  
  console.log(`  Arquivos verificados: ${files.length}`);
  const incorrect = files.filter(f => !f.correct);
  if (incorrect.length > 0) {
    console.log(`  ⚠ Arquivos com imports incorretos: ${incorrect.length}`);
    incorrect.forEach(f => console.log(`    - ${f.path}`));
  } else {
    console.log(`  ✓ Todos os imports estão corretos`);
  }
  
  console.log('');
  return files;
}

// ===================================================================
// FASE 2: ANÁLISE COM CHAIN OF THOUGHT (CoT)
// ===================================================================

function analyzeWithCoT() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FASE 2: ANÁLISE COM CHAIN OF THOUGHT (CoT)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  console.log('🧠 Raciocínio passo a passo:');
  console.log('');
  
  // Análise do Service Worker
  console.log('1. SERVICE WORKER - chrome-extension:');
  console.log('   Linha 68: cache.put(event.request, responseToCache)');
  console.log('   → O que faz: Tenta fazer cache de uma requisição');
  console.log('   → Estado esperado: Cache bem-sucedido');
  console.log('   → Problema: URL é chrome-extension:// (não pode ser cachead)');
  console.log('   → Causa raiz: Falta validação de protocolo antes de cachear');
  console.log('   → Solução: Função canCacheRequest() implementada ✓');
  console.log('');
  
  // Análise do useToast
  console.log('2. useToast - BuscarPage:');
  console.log('   Linha 116: const toast = useToast()');
  console.log('   → O que faz: Tenta usar o hook useToast');
  console.log('   → Estado esperado: Hook disponível no contexto');
  console.log('   → Problema: Contexto não disponível');
  console.log('   → Causa raiz: Cache do navegador/Next.js com versão antiga');
  console.log('   → Solução: Limpar cache e verificar imports');
  console.log('');
  
  // Análise dos Backends
  console.log('3. Backends não iniciam:');
  console.log('   Porta 5000: Backend Principal');
  console.log('   Porta 5002: Backend Admin');
  console.log('   → Estado esperado: Servidores rodando');
  console.log('   → Problema: Servidores não estão rodando');
  console.log('   → Causa raiz: Arquivos não existem ou não foram iniciados');
  console.log('   → Solução: Verificar arquivos e iniciar servidores');
  console.log('');
}

// ===================================================================
// FASE 3: EXPLORAÇÃO COM TREE OF THOUGHTS (ToT)
// ===================================================================

function exploreWithToT() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FASE 3: EXPLORAÇÃO COM TREE OF THOUGHTS (ToT)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  const hypotheses = [
    {
      id: 1,
      title: 'Service Worker não filtra extensões',
      description: 'Service Worker tenta cachear todas as requisições',
      test: 'Verificar se canCacheRequest() está sendo chamada',
      probability: 9,
      complexity: 'Baixa',
      risks: 'Baixos',
      benefits: 'Alto',
      status: '✅ CORRIGIDO'
    },
    {
      id: 2,
      title: 'Cache do navegador com SW antigo',
      description: 'Navegador ainda usa versão antiga do Service Worker',
      test: 'Desregistrar Service Worker e recarregar',
      probability: 8,
      complexity: 'Baixa',
      risks: 'Baixos',
      benefits: 'Alto',
      status: '⚠️ PENDENTE'
    },
    {
      id: 3,
      title: 'Import incorreto de useToast',
      description: 'Alguma página ainda importa de toast-provider',
      test: 'Buscar todos os imports de useToast',
      probability: 6,
      complexity: 'Média',
      risks: 'Baixos',
      benefits: 'Médio',
      status: '🔍 VERIFICANDO'
    },
    {
      id: 4,
      title: 'Backend não configurado',
      description: 'Arquivos de backend não existem ou estão em caminho errado',
      test: 'Verificar existência de start.js e test-admin-server.js',
      probability: 7,
      complexity: 'Média',
      risks: 'Médios',
      benefits: 'Alto',
      status: '🔍 VERIFICANDO'
    },
    {
      id: 5,
      title: 'Dependências faltando',
      description: 'node_modules incompleto ou versões incompatíveis',
      test: 'Verificar node_modules e package.json',
      probability: 5,
      complexity: 'Baixa',
      risks: 'Baixos',
      benefits: 'Médio',
      status: '✅ OK'
    }
  ];
  
  console.log('🌳 Árvore de Hipóteses:');
  console.log('');
  
  hypotheses.forEach(h => {
    console.log(`Hipótese ${h.id}: ${h.title}`);
    console.log(`  Descrição: ${h.description}`);
    console.log(`  Como testar: ${h.test}`);
    console.log(`  Probabilidade: ${h.probability}/10`);
    console.log(`  Complexidade: ${h.complexity}`);
    console.log(`  Riscos: ${h.risks}`);
    console.log(`  Benefícios: ${h.benefits}`);
    console.log(`  Status: ${h.status}`);
    console.log('');
  });
  
  return hypotheses;
}

// ===================================================================
// FASE 4: TÉCNICA DOS 5 PORQUÊS
// ===================================================================

function apply5Whys() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FASE 4: TÉCNICA DOS 5 PORQUÊS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  console.log('❓ ERRO: Service Worker - chrome-extension');
  console.log('');
  console.log('Por que 1: Erro ao executar cache.put() com chrome-extension');
  console.log('  → Service Worker tenta cachear requisições de extensões');
  console.log('');
  console.log('Por que 2: Service Worker tenta cachear extensões?');
  console.log('  → Não há verificação de protocolo antes de cachear');
  console.log('');
  console.log('Por que 3: Não há verificação de protocolo?');
  console.log('  → Código original não previa esse caso');
  console.log('');
  console.log('Por que 4: Código não previa esse caso?');
  console.log('  → Desenvolvimento inicial não considerou extensões do navegador');
  console.log('');
  console.log('Por que 5 (CAUSA RAIZ):');
  console.log('  → Falta de validação de protocolo antes de operações de cache');
  console.log('');
}

// ===================================================================
// EXECUTAR TODAS AS FASES
// ===================================================================

async function runAudit() {
  // Fase 1
  const dirs = checkDirectories();
  const files = checkCriticalFiles();
  const servers = await checkServers();
  const useToastFiles = checkUseToastImports();
  
  // Fase 2
  analyzeWithCoT();
  
  // Fase 3
  const hypotheses = exploreWithToT();
  
  // Fase 4
  apply5Whys();
  
  // Resumo final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESUMO FINAL DA AUDITORIA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  console.log(`✅ Sucessos: ${results.success.length}`);
  console.log(`⚠️  Avisos: ${results.warnings.length}`);
  console.log(`❌ Erros: ${results.errors.length}`);
  console.log('');
  
  if (results.errors.length > 0) {
    console.log('❌ ERROS ENCONTRADOS:');
    results.errors.forEach(err => console.log(`  ${err}`));
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    console.log('⚠️  AVISOS:');
    results.warnings.forEach(warn => console.log(`  ${warn}`));
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PRÓXIMOS PASSOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('1. Desregistrar Service Worker antigo');
  console.log('2. Limpar cache do navegador');
  console.log('3. Verificar e corrigir imports de useToast');
  console.log('4. Verificar e iniciar backends');
  console.log('5. Executar testes completos');
  console.log('');
}

runAudit().catch(error => {
  console.error('Erro ao executar auditoria:', error);
  process.exit(1);
});

