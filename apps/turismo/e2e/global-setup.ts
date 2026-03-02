import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando setup global dos testes E2E');

  // Aguardar o servidor estar disponível
  const maxRetries = 30;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto('http://localhost:3000', { timeout: 5000 });
      await browser.close();
      console.log('✅ Servidor Next.js está respondendo');
      break;
    } catch (error) {
      retries++;
      console.log(`⏳ Aguardando servidor... (tentativa ${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (retries === maxRetries) {
        throw new Error('❌ Servidor Next.js não está respondendo após 60 segundos');
      }
    }
  }

  // Setup de dados de teste
  console.log('🔧 Preparando dados de teste...');

  // Aqui podemos configurar dados iniciais, limpar cache, etc.
  console.log('✅ Setup global concluído');
}

export default globalSetup;
