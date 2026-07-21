/**
 * Script para testar o endpoint de métricas
 * Uso: METRICS_TOKEN=... node scripts/test-metrics-endpoint.js
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/api/metrics`;
const METRICS_TOKEN = process.env.METRICS_TOKEN;

if (!METRICS_TOKEN) {
  console.error('❌ METRICS_TOKEN is required (PR-05b)');
  process.exit(1);
}

console.log(`🧪 Testando endpoint de métricas: ${URL}\n`);

const req = http.get(
  URL,
  { headers: { Authorization: `Bearer ${METRICS_TOKEN}` } },
  (res) => {
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
        lines.forEach((line) => {
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
        process.exit(1);
      }
    });
  },
);

req.on('error', (err) => {
  console.error('❌ Erro ao conectar:', err.message);
  process.exit(1);
});
