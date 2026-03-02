import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando limpeza global dos testes E2E');

  // Limpeza de dados de teste
  console.log('🗑️ Limpando dados de teste...');

  // Aqui podemos limpar dados temporários, logs, etc.

  console.log('✅ Limpeza global concluída');
}

export default globalTeardown;
