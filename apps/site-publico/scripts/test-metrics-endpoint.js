/**
 * Script para testar o endpoint de métricas
 * Uso: node scripts/test-metrics-endpoint.js
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/api/metrics`;

console.log(`🧪 Testando endpoint de métricas: ${URL}\n`);

const req = http.get(URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Endpoint respondeu com sucesso!\n');
      console.log('📊 Primeiras 20 linhas das métricas:');
      console.log('─'.repeat(60));
      const lines = data.split('\n').slice(0, 20);
      lines.forEach(line => {
        if (line.trim()) {
          console.log(line);
        }
      });
      console.log('─'.repeat(60));
      console.log(`\n📈 Total de linhas: ${data.split('\n').length}`);
      console.log(`📏 Tamanho da resposta: ${data.length} bytes`);
    } else {
      console.error(`❌ Erro: Status ${res.statusCode}`);
      console.error('Resposta:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro ao fazer requisição:', error.message);
  console.error('\n💡 Certifique-se de que o servidor está rodando:');
  console.error('   npm run dev');
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.error('❌ Timeout: O servidor não respondeu em 5 segundos');
  req.destroy();
  process.exit(1);
});

