/**
 * Script para verificar se as URLs de teste estão funcionando
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

const urls = [
  { name: 'Calendário', url: `${BASE_URL}/properties/1/calendar` },
  { name: 'Check-in', url: `${BASE_URL}/checkin?booking_id=1` },
  { name: 'Hotéis', url: `${BASE_URL}/hoteis` },
  { name: 'API Propriedades', url: `${BASE_URL}/api/properties` },
  { name: 'API Eventos', url: `${BASE_URL}/api/events?start_date=2025-12-01&end_date=2025-12-31` },
];

function checkUrl(url, name) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          name,
          url,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        name,
        url,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
        name,
        url,
      });
    });

    req.end();
  });
}

async function main() {
  console.log('========================================');
  console.log('VERIFICAÇÃO DE URLs DE TESTE');
  console.log('========================================');
  console.log('');
  console.log('⚠️  Certifique-se de que o servidor está rodando:');
  console.log('   npm run dev');
  console.log('');
  console.log('Verificando URLs...');
  console.log('');

  const results = await Promise.all(urls.map(({ url, name }) => checkUrl(url, name)));

  let allSuccess = true;

  results.forEach((result) => {
    if (result.success) {
      console.log(`✅ ${result.name}`);
      console.log(`   ${result.url}`);
      console.log(`   Status: ${result.statusCode}`);
    } else {
      console.log(`❌ ${result.name}`);
      console.log(`   ${result.url}`);
      if (result.error) {
        console.log(`   Erro: ${result.error}`);
      } else {
        console.log(`   Status: ${result.statusCode}`);
      }
      allSuccess = false;
    }
    console.log('');
  });

  console.log('========================================');
  if (allSuccess) {
    console.log('✅ TODAS AS URLs ESTÃO FUNCIONANDO!');
  } else {
    console.log('⚠️  ALGUMAS URLs APRESENTARAM ERROS');
    console.log('');
    console.log('Possíveis causas:');
    console.log('   - Servidor não está rodando');
    console.log('   - Porta 3000 está ocupada');
    console.log('   - Erro no código');
    console.log('');
    console.log('Solução:');
    console.log('   1. Verifique se o servidor está rodando: npm run dev');
    console.log('   2. Verifique os logs do servidor');
    console.log('   3. Verifique se há erros no console do navegador');
  }
  console.log('========================================');
  console.log('');
}

main().catch(console.error);

