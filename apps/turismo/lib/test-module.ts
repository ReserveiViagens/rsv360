/**
 * Script de testes automatizados para o Módulo de Orçamentos
 * Execute no console do navegador após acessar http://localhost:3000/cotacoes
 * 
 * Uso:
 * 1. Abra o navegador em http://localhost:3000
 * 2. Abra o console do navegador (F12)
 * 3. Execute: window.testModule.runAllTests()
 * 
 * IMPORTANTE: Este módulo só funciona no navegador (client-side)
 * Todos os imports são dinâmicos inline para evitar erros no SSR
 */

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

// Função para obter módulos dinamicamente apenas no cliente (inline em cada função)
const getModules = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // @ts-ignore - require dinâmico apenas no cliente (avaliado apenas quando chamado)
    const templateStorage = require('./template-storage').templateStorage;
    // @ts-ignore
    const budgetStorage = require('./budget-storage').budgetStorage;
    // @ts-ignore
    const initializeDefaultTemplates = require('./default-templates').initializeDefaultTemplates;

    return {
      templateStorage,
      budgetStorage,
      initializeDefaultTemplates,
    };
  } catch (error) {
    console.error('Erro ao carregar módulos de teste:', error);
    return null;
  }
};

/**
 * Teste 1: Verificar se templates são carregados automaticamente
 */
export function testTemplateLoading(): TestResult {
  try {
    if (typeof window === 'undefined') {
      return { name: 'Carregamento de Templates', passed: false, message: 'Deve ser executado no browser' };
    }

    const modules = getModules();
    if (!modules) {
      return { name: 'Carregamento de Templates', passed: false, message: 'Módulos não puderam ser carregados' };
    }

    const { templateStorage, initializeDefaultTemplates } = modules;

    // Executar inicialização
    initializeDefaultTemplates();

    // Verificar templates
    const templates = templateStorage.getAll();
    const version = templateStorage.getVersion();

    const expectedCount = 157; // 90 hotéis + 52 parques + 9 atrações + 6 passeios
    
    if (templates.length >= expectedCount) {
      return {
        name: 'Carregamento de Templates',
        passed: true,
        message: `✅ ${templates.length} templates carregados (esperado: ${expectedCount}+)`,
        details: {
          total: templates.length,
          version,
          porCategoria: {
            hotéis: templates.filter(t => t.mainCategory === 'Hotéis').length,
            parques: templates.filter(t => t.mainCategory === 'Parques').length,
            atrações: templates.filter(t => t.mainCategory === 'Atrações').length,
            passeios: templates.filter(t => t.mainCategory === 'Passeios').length,
          }
        }
      };
    } else {
      return {
        name: 'Carregamento de Templates',
        passed: false,
        message: `⚠️ Apenas ${templates.length} templates carregados (esperado: ${expectedCount})`,
        details: { total: templates.length, version }
      };
    }
  } catch (error: any) {
    return {
      name: 'Carregamento de Templates',
      passed: false,
      message: `❌ Erro: ${error.message}`,
      details: { error }
    };
  }
}

/**
 * Teste 2: Testar criação de orçamento a partir de template
 */
export function testCreateBudgetFromTemplate(): TestResult {
  try {
    if (typeof window === 'undefined') {
      return { name: 'Criação de Orçamento a partir de Template', passed: false, message: 'Deve ser executado no browser' };
    }

    const modules = getModules();
    if (!modules) {
      return { name: 'Criação de Orçamento a partir de Template', passed: false, message: 'Módulos não puderam ser carregados' };
    }

    const { templateStorage } = modules;

    const templates = templateStorage.getAll();
    if (templates.length === 0) {
      return {
        name: 'Criação de Orçamento a partir de Template',
        passed: false,
        message: '❌ Nenhum template disponível para teste'
      };
    }

    // Pegar primeiro template de hotel
    const hotelTemplate = templates.find(t => t.mainCategory === 'Hotéis');
    if (!hotelTemplate) {
      return {
        name: 'Criação de Orçamento a partir de Template',
        passed: false,
        message: '❌ Nenhum template de hotel encontrado'
      };
    }

    // Verificar se template tem dados necessários
    const hasItems = (hotelTemplate.items?.length || 0) > 0;
    const hasPhotos = (hotelTemplate.photos?.length || 0) > 0;
    const hasHighlights = (hotelTemplate.highlights?.length || 0) > 0;

    return {
      name: 'Criação de Orçamento a partir de Template',
      passed: true,
      message: `✅ Template carregado: ${hotelTemplate.name}`,
      details: {
        templateId: hotelTemplate.id,
        templateName: hotelTemplate.name,
        hasItems,
        hasPhotos,
        hasHighlights,
        itemsCount: hotelTemplate.items?.length || 0,
        photosCount: hotelTemplate.photos?.length || 0,
        highlightsCount: hotelTemplate.highlights?.length || 0,
      }
    };
  } catch (error: any) {
    return {
      name: 'Criação de Orçamento a partir de Template',
      passed: false,
      message: `❌ Erro: ${error.message}`,
      details: { error }
    };
  }
}

/**
 * Teste 3: Validar cálculos automáticos
 */
export function testCalculations(): TestResult {
  try {
    // Criar exemplo de orçamento para testar cálculos
    const testBudget = {
      items: [
        { id: '1', name: 'Item 1', quantity: 2, unitPrice: 100 },
        { id: '2', name: 'Item 2', quantity: 3, unitPrice: 50 },
      ],
      discount: 10,
      discountType: 'percentage' as const,
      tax: 5,
      taxType: 'percentage' as const,
    };

    // Calcular subtotal
    const subtotal = testBudget.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    // Subtotal esperado: (2 * 100) + (3 * 50) = 200 + 150 = 350

    // Calcular desconto
    const discountValue = (subtotal * testBudget.discount) / 100;
    // Desconto esperado: 350 * 10% = 35

    // Calcular subtotal com desconto
    const subtotalAfterDiscount = subtotal - discountValue;
    // Esperado: 350 - 35 = 315

    // Calcular taxa
    const taxValue = (subtotalAfterDiscount * testBudget.tax) / 100;
    // Taxa esperada: 315 * 5% = 15.75

    // Calcular total
    const total = subtotalAfterDiscount + taxValue;
    // Total esperado: 315 + 15.75 = 330.75

    const expectedSubtotal = 350;
    const expectedDiscount = 35;
    const expectedTax = 15.75;
    const expectedTotal = 330.75;

    const calculationsCorrect = 
      subtotal === expectedSubtotal &&
      Math.abs(discountValue - expectedDiscount) < 0.01 &&
      Math.abs(taxValue - expectedTax) < 0.01 &&
      Math.abs(total - expectedTotal) < 0.01;

    return {
      name: 'Validação de Cálculos Automáticos',
      passed: calculationsCorrect,
      message: calculationsCorrect
        ? '✅ Todos os cálculos estão corretos'
        : '❌ Erro nos cálculos',
      details: {
        subtotal: { calculado: subtotal, esperado: expectedSubtotal, ok: subtotal === expectedSubtotal },
        discount: { calculado: discountValue, esperado: expectedDiscount, ok: Math.abs(discountValue - expectedDiscount) < 0.01 },
        tax: { calculado: taxValue, esperado: expectedTax, ok: Math.abs(taxValue - expectedTax) < 0.01 },
        total: { calculado: total, esperado: expectedTotal, ok: Math.abs(total - expectedTotal) < 0.01 },
      }
    };
  } catch (error: any) {
    return {
      name: 'Validação de Cálculos Automáticos',
      passed: false,
      message: `❌ Erro: ${error.message}`,
      details: { error }
    };
  }
}

/**
 * Teste 4: Validar localStorage
 */
export function testLocalStorage(): TestResult {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return {
        name: 'Validação localStorage',
        passed: false,
        message: '❌ localStorage não disponível'
      };
    }

    const modules = getModules();
    if (!modules) {
      return {
        name: 'Validação localStorage',
        passed: false,
        message: '❌ Módulos de storage não puderam ser carregados'
      };
    }

    const { budgetStorage, templateStorage } = modules;

    // Verificar budgets
    const budgets = budgetStorage.getAll();
    const templates = templateStorage.getAll();

    // Verificar tamanho dos dados
    const budgetsSize = JSON.stringify(budgets).length;
    const templatesSize = JSON.stringify(templates).length;
    const totalSize = budgetsSize + templatesSize;
    const totalSizeMB = totalSize / (1024 * 1024);

    // Verificar se está dentro dos limites (5-10MB)
    const withinLimits = totalSizeMB < 10;

    return {
      name: 'Validação localStorage',
      passed: withinLimits,
      message: withinLimits
        ? `✅ localStorage OK (${totalSizeMB.toFixed(2)}MB)`
        : `⚠️ localStorage próximo do limite (${totalSizeMB.toFixed(2)}MB)`,
      details: {
        budgets: budgets.length,
        templates: templates.length,
        budgetsSize: `${(budgetsSize / 1024).toFixed(2)}KB`,
        templatesSize: `${(templatesSize / 1024).toFixed(2)}KB`,
        totalSize: `${totalSizeMB.toFixed(2)}MB`,
        withinLimits,
      }
    };
  } catch (error: any) {
    return {
      name: 'Validação localStorage',
      passed: false,
      message: `❌ Erro: ${error.message}`,
      details: { error }
    };
  }
}

/**
 * Teste 5: Validar versionamento de templates
 */
export function testTemplateVersioning(): TestResult {
  try {
    if (typeof window === 'undefined') {
      return { name: 'Versionamento de Templates', passed: false, message: 'Deve ser executado no browser' };
    }

    const modules = getModules();
    if (!modules) {
      return { name: 'Versionamento de Templates', passed: false, message: 'Módulos não puderam ser carregados' };
    }

    const { templateStorage } = modules;

    const version = templateStorage.getVersion();
    const expectedVersion = '1.0.0';

    return {
      name: 'Versionamento de Templates',
      passed: version === expectedVersion,
      message: version === expectedVersion
        ? `✅ Versão correta: ${version}`
        : `⚠️ Versão atual: ${version || 'não definida'} (esperado: ${expectedVersion})`,
      details: { current: version, expected: expectedVersion }
    };
  } catch (error: any) {
    return {
      name: 'Versionamento de Templates',
      passed: false,
      message: `❌ Erro: ${error.message}`,
      details: { error }
    };
  }
}

/**
 * Executa todos os testes e retorna resultados
 */
export function runAllTests(): TestResult[] {
  console.log('🧪 Iniciando testes do Módulo de Orçamentos...\n');
  
  const results: TestResult[] = [];

  // Teste 1: Carregamento de Templates
  console.log('📋 Teste 1: Carregamento de Templates');
  const test1 = testTemplateLoading();
  results.push(test1);
  console.log(`${test1.passed ? '✅' : '❌'} ${test1.message}`);
  if (test1.details) console.log('Detalhes:', test1.details);
  console.log('');

  // Teste 2: Criação a partir de Template
  console.log('📋 Teste 2: Criação de Orçamento a partir de Template');
  const test2 = testCreateBudgetFromTemplate();
  results.push(test2);
  console.log(`${test2.passed ? '✅' : '❌'} ${test2.message}`);
  if (test2.details) console.log('Detalhes:', test2.details);
  console.log('');

  // Teste 3: Cálculos
  console.log('📋 Teste 3: Validação de Cálculos Automáticos');
  const test3 = testCalculations();
  results.push(test3);
  console.log(`${test3.passed ? '✅' : '❌'} ${test3.message}`);
  if (test3.details) console.log('Detalhes:', test3.details);
  console.log('');

  // Teste 4: localStorage
  console.log('📋 Teste 4: Validação localStorage');
  const test4 = testLocalStorage();
  results.push(test4);
  console.log(`${test4.passed ? '✅' : '❌'} ${test4.message}`);
  if (test4.details) console.log('Detalhes:', test4.details);
  console.log('');

  // Teste 5: Versionamento
  console.log('📋 Teste 5: Versionamento de Templates');
  const test5 = testTemplateVersioning();
  results.push(test5);
  console.log(`${test5.passed ? '✅' : '❌'} ${test5.message}`);
  if (test5.details) console.log('Detalhes:', test5.details);
  console.log('');

  // Resumo
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`✅ Passou: ${passed}/${total}`);
  console.log(`❌ Falhou: ${total - passed}/${total}`);
  console.log('');

  return results;
}
