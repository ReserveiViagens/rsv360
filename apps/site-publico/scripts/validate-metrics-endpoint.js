/**
 * Script para validar o endpoint de métricas localmente
 * Uso: METRICS_TOKEN=... node scripts/validate-metrics-endpoint.js
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const METRICS_ENDPOINT = `http://localhost:${PORT}/api/metrics`;
const METRICS_TOKEN = process.env.METRICS_TOKEN;

if (!METRICS_TOKEN) {
  console.error('❌ METRICS_TOKEN is required (PR-05b)');
  process.exit(1);
}

console.log('🔍 Validando endpoint de métricas...');
console.log(`📡 Endpoint: ${METRICS_ENDPOINT}`);
console.log('');

http
  .get(
    METRICS_ENDPOINT,
    { headers: { Authorization: `Bearer ${METRICS_TOKEN}` } },
    (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Endpoint está respondendo!');
          console.log('');

          const expectedMetrics = [
            'http_requests_total',
            'http_request_duration_seconds',
            'db_query_duration_seconds',
            'redis_operations_total',
            'rsv_bookings_total',
            'rsv_tickets_created_total',
            'rsv_checkins_completed_total',
          ];

          console.log('📊 Verificando métricas esperadas...');
          let foundCount = 0;

          expectedMetrics.forEach((metric) => {
            if (data.includes(metric)) {
              console.log(`   ✅ ${metric}`);
              foundCount++;
            } else {
              console.log(
                `   ⚠️ ${metric} (não encontrado - pode ser normal se não houver dados)`,
              );
            }
          });

          console.log('');
          console.log(
            `📈 Métricas encontradas: ${foundCount}/${expectedMetrics.length}`,
          );

          if (data.includes('# TYPE') && data.includes('# HELP')) {
            console.log('✅ Formato Prometheus válido');
          } else {
            console.log('⚠️ Formato pode não estar correto');
          }

          const lines = data
            .split('\n')
            .filter((line) => line.trim() && !line.startsWith('#'));
          const metrics = lines.filter((line) => !line.startsWith('#')).length;

          console.log('');
          console.log('📊 Estatísticas:');
          console.log(`   Total de linhas: ${data.split('\n').length}`);
          console.log(`   Métricas: ${metrics}`);
          console.log(`   Tamanho: ${(data.length / 1024).toFixed(2)} KB`);

          console.log('');
          console.log('📝 Primeiras linhas do output:');
          console.log(data.split('\n').slice(0, 20).join('\n'));
          console.log('...');

          if (foundCount >= expectedMetrics.length * 0.7) {
            console.log('');
            console.log('✅ Validação concluída com sucesso!');
            process.exit(0);
          } else {
            console.log('');
            console.log(
              '⚠️ Algumas métricas não foram encontradas, mas isso pode ser normal.',
            );
            console.log(
              '💡 As métricas aparecerão após a aplicação processar algumas requisições.',
            );
            process.exit(0);
          }
        } else {
          console.error(`❌ Erro HTTP: ${res.statusCode}`);
          console.error('Resposta:', data);
          process.exit(1);
        }
      });
    },
  )
  .on('error', (err) => {
    console.error('❌ Erro ao conectar:', err.message);
    console.error('');
    console.error('💡 Certifique-se de que:');
    console.error('   1. O servidor Next.js está rodando (npm run dev)');
    console.error(`   2. O servidor está na porta ${PORT}`);
    console.error(`   3. O endpoint /api/metrics está acessível`);
    console.error('   4. METRICS_TOKEN está definido e coincide com o servidor');
    process.exit(1);
  });
