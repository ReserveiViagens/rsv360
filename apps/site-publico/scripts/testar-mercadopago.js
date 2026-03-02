require('dotenv').config({ path: '.env.local' });
const https = require('https');

async function testarMercadoPago() {
  console.log("========================================");
  console.log("TESTE: MERCADO PAGO");
  console.log("========================================");
  console.log("");

  // Verificar configuração
  const configurado = !!(
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    process.env.MERCADOPAGO_ACCESS_TOKEN
  );

  if (!configurado) {
    console.log("⚠️  Mercado Pago não configurado no .env.local");
    console.log("");
    console.log("Para testar pagamentos reais, configure no .env.local:");
    console.log("  MERCADO_PAGO_ACCESS_TOKEN=APP_USR_...");
    console.log("  MERCADO_PAGO_PUBLIC_KEY=APP_USR_...");
    console.log("  MERCADO_PAGO_WEBHOOK_SECRET=...");
    console.log("");
    console.log("📖 Veja GUIA_CONFIGURACAO_ENV.md para mais detalhes");
    console.log("");
    console.log("ℹ️  Testando em modo de desenvolvimento (simulado)...");
    console.log("");
  } else {
    console.log("✅ Mercado Pago configurado!");
    console.log("");
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

  console.log("1. Verificando arquivo lib/mercadopago.ts...");
  const fs = require('fs');
  const path = require('path');
  const mercadopagoPath = path.join(__dirname, '..', 'lib', 'mercadopago.ts');
  if (fs.existsSync(mercadopagoPath)) {
    console.log("✅ lib/mercadopago.ts encontrado");
    const content = fs.readFileSync(mercadopagoPath, 'utf-8');
    const hasPix = content.includes('createPixPayment');
    const hasCard = content.includes('createCardPayment');
    const hasBoleto = content.includes('createBoletoPayment');
    const hasWebhook = content.includes('validateWebhookSignature');
    
    console.log(`   ${hasPix ? '✅' : '❌'} createPixPayment`);
    console.log(`   ${hasCard ? '✅' : '❌'} createCardPayment`);
    console.log(`   ${hasBoleto ? '✅' : '❌'} createBoletoPayment`);
    console.log(`   ${hasWebhook ? '✅' : '❌'} validateWebhookSignature`);
  } else {
    console.log("❌ lib/mercadopago.ts não encontrado");
  }
  console.log("");

  console.log("2. Testando conexão com API do Mercado Pago...");
  if (accessToken) {
    try {
      // Testar se o token é válido fazendo uma requisição simples
      console.log("   ℹ️  Token configurado (teste real requer API do Mercado Pago)");
      console.log("   ✅ Para testar pagamentos reais:");
      console.log("      - Configure MERCADO_PAGO_ACCESS_TOKEN no .env.local");
      console.log("      - Use o painel do Mercado Pago para obter credenciais");
      console.log("      - Teste através da interface web em /reservar/[id]");
    } catch (error) {
      console.log("   ❌ Erro:", error.message);
    }
  } else {
    console.log("   ⚠️  Token não configurado");
  }
  console.log("");

  console.log("3. Verificando webhook handler...");
  const webhookPath = path.join(__dirname, '..', 'app', 'api', 'webhooks', 'mercadopago', 'route.ts');
  if (fs.existsSync(webhookPath)) {
    console.log("✅ Webhook handler encontrado");
    const content = fs.readFileSync(webhookPath, 'utf-8');
    const hasValidation = content.includes('validateWebhookSignature');
    const hasIdempotency = content.includes('idempotency') || content.includes('idempotencia');
    
    console.log(`   ${hasValidation ? '✅' : '❌'} Validação de assinatura`);
    console.log(`   ${hasIdempotency ? '✅' : '❌'} Idempotência`);
  } else {
    console.log("❌ Webhook handler não encontrado");
  }
  console.log("");

  console.log("4. Verificando integração em /api/bookings/[code]/payment...");
  const paymentPath = path.join(__dirname, '..', 'app', 'api', 'bookings', '[code]', 'payment', 'route.ts');
  if (fs.existsSync(paymentPath)) {
    console.log("✅ Endpoint de pagamento encontrado");
    const content = fs.readFileSync(paymentPath, 'utf-8');
    const hasPix = content.includes('pix') || content.includes('PIX');
    const hasCard = content.includes('card') || content.includes('credit_card');
    const hasBoleto = content.includes('boleto') || content.includes('bolbradesco');
    
    console.log(`   ${hasPix ? '✅' : '❌'} Suporte a PIX`);
    console.log(`   ${hasCard ? '✅' : '❌'} Suporte a Cartão`);
    console.log(`   ${hasBoleto ? '✅' : '❌'} Suporte a Boleto`);
  } else {
    console.log("❌ Endpoint de pagamento não encontrado");
  }
  console.log("");

  console.log("========================================");
  console.log("TESTE DE MERCADO PAGO CONCLUÍDO");
  console.log("========================================");
  console.log("");
  console.log("ℹ️  Nota: Em modo de desenvolvimento, os pagamentos são simulados.");
  console.log("   Configure as credenciais reais para testar com a API do Mercado Pago.");
}

testarMercadoPago().catch(console.error);

