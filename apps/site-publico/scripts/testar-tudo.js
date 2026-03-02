require('dotenv').config({ path: '.env.local' });

console.log("========================================");
console.log("TESTE COMPLETO DO SISTEMA RSV 360°");
console.log("========================================");
console.log("");

async function executarTodosTestes() {
  const testes = [
    { nome: 'OAuth Fields (SQL)', script: 'executar-oauth-fields.js' },
    { nome: 'Sistema de Email', script: 'testar-email.js' },
    { nome: 'Mercado Pago', script: 'testar-mercadopago.js' },
    { nome: 'OAuth Social', script: 'testar-oauth.js' },
    { nome: 'Service Worker', script: 'testar-service-worker.js' },
    { nome: 'Avaliações', script: 'testar-avaliacoes.js' },
  ];

  for (const teste of testes) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Executando: ${teste.nome}`);
    console.log('='.repeat(50));
    console.log("");

    try {
      require(`./${teste.script}`);
      // Aguardar um pouco entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Erro ao executar ${teste.nome}:`, error.message);
    }
  }

  console.log("\n");
  console.log("========================================");
  console.log("TODOS OS TESTES CONCLUÍDOS");
  console.log("========================================");
  console.log("");
  console.log("📋 Resumo:");
  console.log("   - Execute os scripts individuais para mais detalhes");
  console.log("   - Configure o .env.local para testar funcionalidades reais");
  console.log("   - Veja GUIA_CONFIGURACAO_ENV.md para instruções");
}

executarTodosTestes().catch(console.error);

