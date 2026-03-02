import { FullConfig } from '@playwright/test';
import { setupTestDatabase } from './database-setup';
import { setupTestServer } from './server-setup';

async function globalSetup(config: FullConfig) {
  console.log('🌍 Configuração global de testes iniciada...');
  
  try {
    // Configurar banco de dados de teste
    await setupTestDatabase();
    console.log('✅ Banco de dados de teste configurado');
    
    // Configurar servidor de teste
    await setupTestServer();
    console.log('✅ Servidor de teste configurado');
    
    // Aguardar servidor estar pronto
    await waitForServer();
    console.log('✅ Servidor de teste está rodando');
    
    console.log('🎉 Configuração global concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na configuração global:', error);
    throw error;
  }
}

async function waitForServer(maxAttempts = 30, delay = 1000) {
  const axios = require('axios');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get('http://localhost:3000/health');
      return;
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw new Error('Servidor não respondeu após todas as tentativas');
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export default globalSetup;
