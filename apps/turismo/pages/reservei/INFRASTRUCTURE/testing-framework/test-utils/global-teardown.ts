import { FullConfig } from '@playwright/test';
import { cleanupTestDatabase } from './database-setup';
import { cleanupTestServer } from './server-setup';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Limpeza global de testes iniciada...');
  
  try {
    // Parar servidor de teste
    await cleanupTestServer();
    console.log('✅ Servidor de teste parado');
    
    // Limpar banco de dados de teste
    await cleanupTestDatabase();
    console.log('✅ Banco de dados de teste limpo');
    
    console.log('🎉 Limpeza global concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na limpeza global:', error);
    throw error;
  }
}

export default globalTeardown;
