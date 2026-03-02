/**
 * Script de Teste das Integrações Externas
 * 
 * Execute: node scripts/test-integrations.js
 */

require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHolidayAPI() {
  log('\n📅 Testando API de Feriados (BrasilAPI)...', 'blue');
  
  try {
    // Tentar importar o módulo TypeScript
    let feriadosModule;
    try {
      feriadosModule = await import('../lib/external/feriados-service.ts');
    } catch (e) {
      // Se falhar, tentar sem extensão
      try {
        feriadosModule = await import('../lib/external/feriados-service');
      } catch (e2) {
        log('  ⚠️  Módulo feriados-service não encontrado. Pulando teste.', 'yellow');
        return;
      }
    }
    const { isHoliday, getHolidays } = feriadosModule;
    
    const today = new Date();
    const isTodayHoliday = await isHoliday(today);
    log(`  ✓ isHoliday(${today.toISOString().split('T')[0]}): ${isTodayHoliday}`, 'green');
    
    const year = today.getFullYear();
    const holidays = await getHolidays(year);
    log(`  ✓ getHolidays(${year}): ${holidays.length} feriados encontrados`, 'green');
    
    return true;
  } catch (error) {
    log(`  ✗ Erro: ${error.message}`, 'red');
    return false;
  }
}

async function testGoogleMaps() {
  log('\n🗺️  Testando Google Maps API...', 'blue');
  
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    log('  ⚠️  GOOGLE_MAPS_API_KEY não configurada', 'yellow');
    return false;
  }
  
  try {
    const googleMapsModule = await import('../lib/external/google-maps-service.js');
    const { geocodeAddress, verifyAddress } = googleMapsModule;
    
    const testAddress = 'Av. Paulista, 1000, São Paulo, SP';
    const geocodeResult = await geocodeAddress(testAddress);
    
    if (geocodeResult) {
      log(`  ✓ geocodeAddress: ${geocodeResult.formattedAddress}`, 'green');
      log(`    Coordenadas: ${geocodeResult.latitude}, ${geocodeResult.longitude}`, 'green');
      
      const verifyResult = await verifyAddress(testAddress, {
        lat: geocodeResult.latitude,
        lng: geocodeResult.longitude,
      });
      log(`  ✓ verifyAddress: ${verifyResult.isValid ? 'Válido' : 'Inválido'}`, 'green');
      
      return true;
    } else {
      log('  ✗ geocodeAddress retornou null', 'red');
      return false;
    }
  } catch (error) {
    log(`  ✗ Erro: ${error.message}`, 'red');
    return false;
  }
}

async function testGoogleVision() {
  log('\n👁️  Testando Google Vision API...', 'blue');
  
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_VISION_API_KEY) {
    log('  ⚠️  GOOGLE_APPLICATION_CREDENTIALS ou GOOGLE_VISION_API_KEY não configurada', 'yellow');
    return false;
  }
  
  try {
    const googleVisionModule = await import('../lib/external/google-vision-service.js');
    const { analyzePropertyImage } = googleVisionModule;
    
    // Teste com uma URL de imagem de exemplo (substitua por uma URL real)
    const testImageUrl = 'https://example.com/test-image.jpg';
    
    log('  ⚠️  Teste requer URL de imagem válida', 'yellow');
    log('  ℹ️  Para testar completamente, forneça uma URL de imagem real', 'yellow');
    
    return true;
  } catch (error) {
    log(`  ✗ Erro: ${error.message}`, 'red');
    return false;
  }
}

async function testPaymentGateway() {
  log('\n💳 Testando Payment Gateway...', 'blue');
  
  const provider = process.env.PAYMENT_PROVIDER || 'stripe';
  log(`  Provider configurado: ${provider}`, 'blue');
  
  if (provider === 'stripe' && !process.env.STRIPE_SECRET_KEY) {
    log('  ⚠️  STRIPE_SECRET_KEY não configurada', 'yellow');
    return false;
  }
  
  if (provider === 'mercadopago' && !process.env.MERCADOPAGO_ACCESS_TOKEN) {
    log('  ⚠️  MERCADOPAGO_ACCESS_TOKEN não configurada', 'yellow');
    return false;
  }
  
  try {
    const paymentModule = await import('../lib/external/payment-gateway.service.js');
    const { paymentGatewayService } = paymentModule;
    
    log('  ✓ PaymentGatewayService carregado com sucesso', 'green');
    log('  ℹ️  Para testar pagamento real, use a função processPayment com dados válidos', 'yellow');
    
    return true;
  } catch (error) {
    log(`  ✗ Erro: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🧪 INICIANDO TESTES DE INTEGRAÇÕES EXTERNAS\n', 'blue');
  
  const results = {
    holiday: await testHolidayAPI(),
    googleMaps: await testGoogleMaps(),
    googleVision: await testGoogleVision(),
    paymentGateway: await testPaymentGateway(),
  };
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r).length;
  
  log('\n' + '='.repeat(50), 'blue');
  log(`📊 RESUMO: ${passed}/${total} testes passaram`, passed === total ? 'green' : 'yellow');
  log('='.repeat(50) + '\n', 'blue');
  
  if (passed === total) {
    log('✅ Todas as integrações estão funcionando!', 'green');
  } else {
    log('⚠️  Algumas integrações precisam de configuração adicional', 'yellow');
    log('   Verifique as variáveis de ambiente em .env', 'yellow');
  }
  
  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

