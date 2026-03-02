// Script de teste para localStorage conforme FASE 11
// Validar limites 5-10MB, persistência dados, versionamento templates

/**
 * Testa os limites de armazenamento do localStorage
 */
export function testLocalStorageLimits(): void {
  if (typeof window === 'undefined') {
    console.log('Teste deve ser executado no browser');
    return;
  }

  try {
    // Obter limite estimado do localStorage
    const testKey = 'test-storage-limit';
    const testData = 'x'.repeat(1024 * 1024); // 1MB
    
    // Testar escrita de 5MB
    console.log('Testando escrita de 5MB...');
    for (let i = 0; i < 5; i++) {
      try {
        localStorage.setItem(`${testKey}-${i}`, testData);
      } catch (e: any) {
        if (e.code === 22 || e.name === 'QuotaExceededError') {
          console.warn(`Limite atingido em ${i}MB`);
          break;
        }
      }
    }

    // Limpar dados de teste
    for (let i = 0; i < 5; i++) {
      localStorage.removeItem(`${testKey}-${i}`);
    }

    console.log('Teste de limites concluído');
  } catch (error) {
    console.error('Erro no teste de limites:', error);
  }
}

/**
 * Testa a persistência de dados
 */
export function testDataPersistence(): void {
  if (typeof window === 'undefined') return;

  const testKey = 'rsv-test-persistence';
  const testData = {
    timestamp: new Date().toISOString(),
    data: 'Teste de persistência',
  };

  try {
    // Salvar
    localStorage.setItem(testKey, JSON.stringify(testData));
    console.log('Dados salvos:', testData);

    // Recarregar
    const loaded = localStorage.getItem(testKey);
    if (loaded) {
      const parsed = JSON.parse(loaded);
      console.log('Dados carregados:', parsed);
      
      if (parsed.timestamp === testData.timestamp) {
        console.log('✅ Persistência OK');
      } else {
        console.warn('⚠️ Persistência com problemas');
      }
    }

    // Limpar
    localStorage.removeItem(testKey);
  } catch (error) {
    console.error('Erro no teste de persistência:', error);
  }
}

/**
 * Testa o versionamento de templates
 */
export function testTemplateVersioning(): void {
  if (typeof window === 'undefined') return;

  try {
    // Importar templateStorage dinamicamente para evitar problemas de SSR
    const { templateStorage } = require('./template-storage');
    const expectedVersion = '1.0.0';

    const currentVersion = templateStorage.getVersion();
    console.log('Versão atual:', currentVersion);
    console.log('Versão esperada:', expectedVersion);

    if (currentVersion === expectedVersion) {
      console.log('✅ Versionamento OK');
    } else {
      console.warn('⚠️ Versão diferente do esperado. Templates serão atualizados na próxima inicialização.');
    }
  } catch (error) {
    console.error('Erro no teste de versionamento:', error);
  }
}

/**
 * Executa todos os testes
 */
export function runAllLocalStorageTests(): void {
  console.log('=== TESTES DE LOCALSTORAGE ===');
  testLocalStorageLimits();
  testDataPersistence();
  testTemplateVersioning();
  console.log('=== FIM DOS TESTES ===');
}

