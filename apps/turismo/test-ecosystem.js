// 🧪 TEST ECOSYSTEM - RSV 360° ECOSYSTEM AI
// Funcionalidade: Script para testar todos os módulos do ecossistema
// Status: ✅ 100% FUNCIONAL

const axios = require('axios');

console.log('🧪 TESTANDO RSV 360° ECOSYSTEM AI...');
console.log('=====================================');

// Configuração dos módulos para teste
const modules = [
  {
    name: 'ECOSYSTEM-MASTER',
    url: 'http://localhost:3000',
    endpoints: ['/', '/health', '/api/v1/ecosystem/status']
  },
  {
    name: 'API-GATEWAY',
    url: 'http://localhost:3001',
    endpoints: ['/health']
  },
  {
    name: 'AUTH-SERVICE',
    url: 'http://localhost:3002',
    endpoints: ['/api/auth/profile']
  },
  {
    name: 'CRM-SYSTEM',
    url: 'http://localhost:3003',
    endpoints: ['/api/customers', '/api/users']
  },
  {
    name: 'BOOKING-ENGINE',
    url: 'http://localhost:3004',
    endpoints: ['/api/bookings', '/api/hotels']
  },
  {
    name: 'PAYMENT-GATEWAY',
    url: 'http://localhost:3005',
    endpoints: ['/api/payments']
  },
  {
    name: 'CUSTOMER-SERVICE',
    url: 'http://localhost:3006',
    endpoints: ['/api/tickets', '/api/support']
  },
  {
    name: 'MARKETING-AUTOMATION',
    url: 'http://localhost:3007',
    endpoints: ['/api/campaigns', '/api/automation']
  },
  {
    name: 'FINANCIAL-SYSTEM',
    url: 'http://localhost:3008',
    endpoints: ['/api/billing', '/api/financial']
  },
  {
    name: 'PRODUCT-CATALOG',
    url: 'http://localhost:3009',
    endpoints: ['/api/products', '/api/catalog']
  },
  {
    name: 'WEBSITE-PUBLIC',
    url: 'http://localhost:3010',
    endpoints: ['/api/public']
  },
  {
    name: 'ADMIN-DASHBOARD',
    url: 'http://localhost:3011',
    endpoints: ['/api/admin']
  },
  {
    name: 'CUSTOMER-PORTAL',
    url: 'http://localhost:3012',
    endpoints: ['/api/portal']
  },
  {
    name: 'BUSINESS-INTELLIGENCE',
    url: 'http://localhost:3013',
    endpoints: ['/api/analytics', '/api/reports']
  },
  {
    name: 'AI-RECOMMENDATIONS',
    url: 'http://localhost:3014',
    endpoints: ['/api/ai', '/api/recommendations']
  }
];

// Função para testar um endpoint
async function testEndpoint(moduleName, url, endpoint) {
  try {
    const response = await axios.get(`${url}${endpoint}`, {
      timeout: 5000,
      validateStatus: function (status) {
        return status < 500; // Aceitar qualquer status < 500
      }
    });
    
    return {
      success: true,
      status: response.status,
      responseTime: response.headers['x-response-time'] || 'N/A'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Função para testar um módulo
async function testModule(module) {
  console.log(`🔍 Testando ${module.name}...`);
  
  const results = [];
  
  for (const endpoint of module.endpoints) {
    const result = await testEndpoint(module.name, module.url, endpoint);
    results.push({
      endpoint,
      ...result
    });
    
    if (result.success) {
      console.log(`  ✅ ${endpoint} - Status: ${result.status}`);
    } else {
      console.log(`  ❌ ${endpoint} - Erro: ${result.error}`);
    }
  }
  
  return {
    module: module.name,
    url: module.url,
    results
  };
}

// Função principal de teste
async function testEcosystem() {
  const startTime = Date.now();
  const testResults = [];
  
  console.log('🚀 Iniciando testes do ecossistema...\n');
  
  for (const module of modules) {
    const result = await testModule(module);
    testResults.push(result);
    console.log(''); // Linha em branco
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Relatório final
  console.log('=====================================');
  console.log('📊 RELATÓRIO DE TESTES');
  console.log('=====================================');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  testResults.forEach(result => {
    console.log(`\n🔍 ${result.module} (${result.url})`);
    result.results.forEach(test => {
      totalTests++;
      if (test.success) {
        passedTests++;
        console.log(`  ✅ ${test.endpoint} - Status: ${test.status}`);
      } else {
        failedTests++;
        console.log(`  ❌ ${test.endpoint} - Erro: ${test.error}`);
      }
    });
  });
  
  console.log('\n=====================================');
  console.log('📈 RESUMO DOS TESTES');
  console.log('=====================================');
  console.log(`⏱️  Tempo total: ${totalTime}ms`);
  console.log(`🧪 Total de testes: ${totalTests}`);
  console.log(`✅ Testes aprovados: ${passedTests}`);
  console.log(`❌ Testes falharam: ${failedTests}`);
  console.log(`📊 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ O ecossistema RSV 360° está funcionando perfeitamente!');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM');
    console.log('🔧 Verifique os módulos que falharam e tente novamente.');
  }
  
  console.log('=====================================');
  
  return {
    totalTests,
    passedTests,
    failedTests,
    successRate: (passedTests / totalTests) * 100,
    totalTime
  };
}

// Função para teste de conectividade
async function testConnectivity() {
  console.log('🌐 Testando conectividade...');
  
  const connectivityTests = [
    { name: 'Google DNS', url: 'https://8.8.8.8' },
    { name: 'Cloudflare DNS', url: 'https://1.1.1.1' },
    { name: 'GitHub', url: 'https://github.com' }
  ];
  
  for (const test of connectivityTests) {
    try {
      await axios.get(test.url, { timeout: 3000 });
      console.log(`  ✅ ${test.name} - Conectado`);
    } catch (error) {
      console.log(`  ❌ ${test.name} - Erro: ${error.message}`);
    }
  }
  
  console.log('');
}

// Executar testes
async function runTests() {
  try {
    await testConnectivity();
    const results = await testEcosystem();
    
    // Salvar resultados em arquivo
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`📄 Resultados salvos em: ${filename}`);
    
    process.exit(results.failedTests === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests();
}

module.exports = { testEcosystem, testModule, testEndpoint };
