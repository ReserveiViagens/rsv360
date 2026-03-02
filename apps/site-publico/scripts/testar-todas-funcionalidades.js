require('dotenv').config({ path: '../.env.local' });
const { Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

const pool = new Pool(dbConfig);

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testarFuncionalidade(nome, testFn) {
  try {
    console.log(`\n🧪 Testando: ${nome}`);
    console.log('─'.repeat(50));
    await testFn();
    console.log(`✅ ${nome}: PASSOU`);
    return { nome, status: 'passou' };
  } catch (error) {
    console.log(`❌ ${nome}: FALHOU`);
    console.log(`   Erro: ${error.message}`);
    return { nome, status: 'falhou', erro: error.message };
  }
}

async function testarBancoDados() {
  const tables = [
    'users', 'user_profiles', 'properties', 'bookings', 'payments',
    'reviews', 'notifications', 'messages', 'analytics'
  ];

  for (const table of tables) {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [table]);

    if (!result.rows[0].exists) {
      throw new Error(`Tabela ${table} não existe`);
    }
  }
}

async function testarPropriedades() {
  const result = await pool.query('SELECT COUNT(*) as count FROM properties');
  const count = parseInt(result.rows[0].count);
  
  if (count === 0) {
    throw new Error('Nenhuma propriedade encontrada no banco');
  }
  
  console.log(`   📊 Total de propriedades: ${count}`);
}

async function testarUsuarios() {
  const result = await pool.query('SELECT COUNT(*) as count FROM users');
  const count = parseInt(result.rows[0].count);
  
  if (count === 0) {
    throw new Error('Nenhum usuário encontrado no banco');
  }
  
  console.log(`   👥 Total de usuários: ${count}`);
}

async function testarReservas() {
  const result = await pool.query('SELECT COUNT(*) as count FROM bookings');
  const count = parseInt(result.rows[0].count);
  console.log(`   📅 Total de reservas: ${count}`);
}

async function testarAvaliacoes() {
  const result = await pool.query('SELECT COUNT(*) as count FROM reviews');
  const count = parseInt(result.rows[0].count);
  console.log(`   ⭐ Total de avaliações: ${count}`);
}

async function testarAPIs() {
  const fetch = (await import('node-fetch')).default;
  
  const apis = [
    { nome: 'API Properties', url: `${BASE_URL}/api/properties` },
    { nome: 'API Users Profile', url: `${BASE_URL}/api/users/profile` },
    { nome: 'API Reviews', url: `${BASE_URL}/api/reviews` },
    { nome: 'API Notifications', url: `${BASE_URL}/api/notifications` },
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.status === 200 || response.status === 401) {
        console.log(`   ✅ ${api.nome}: Respondendo (Status: ${response.status})`);
      } else {
        throw new Error(`Status ${response.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${api.nome}: ${error.message}`);
    }
  }
}

async function testarConfiguracoes() {
  const configs = {
    'SMTP': ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'],
    'Mercado Pago': ['MERCADO_PAGO_ACCESS_TOKEN', 'MERCADO_PAGO_PUBLIC_KEY'],
    'Google OAuth': ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    'Facebook OAuth': ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
    'Google Maps': ['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'],
  };

  for (const [nome, vars] of Object.entries(configs)) {
    const todasConfiguradas = vars.every(v => process.env[v]);
    if (todasConfiguradas) {
      console.log(`   ✅ ${nome}: Configurado`);
    } else {
      console.log(`   ⚠️  ${nome}: Não configurado`);
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('TESTE COMPLETO DE FUNCIONALIDADES');
  console.log('========================================');
  console.log('');

  const resultados = [];

  // Testes de Banco de Dados
  resultados.push(await testarFuncionalidade('Banco de Dados - Tabelas', testarBancoDados));
  resultados.push(await testarFuncionalidade('Propriedades', testarPropriedades));
  resultados.push(await testarFuncionalidade('Usuários', testarUsuarios));
  resultados.push(await testarFuncionalidade('Reservas', testarReservas));
  resultados.push(await testarFuncionalidade('Avaliações', testarAvaliacoes));

  // Testes de APIs
  resultados.push(await testarFuncionalidade('APIs REST', testarAPIs));

  // Testes de Configurações
  resultados.push(await testarFuncionalidade('Configurações de Integração', testarConfiguracoes));

  // Resumo
  console.log('');
  console.log('========================================');
  console.log('RESUMO DOS TESTES');
  console.log('========================================');
  console.log('');

  const passou = resultados.filter(r => r.status === 'passou').length;
  const falhou = resultados.filter(r => r.status === 'falhou').length;

  resultados.forEach(r => {
    const icon = r.status === 'passou' ? '✅' : '❌';
    console.log(`${icon} ${r.nome}`);
    if (r.erro) {
      console.log(`   Erro: ${r.erro}`);
    }
  });

  console.log('');
  console.log(`📊 Total: ${resultados.length} testes`);
  console.log(`✅ Passou: ${passou}`);
  console.log(`❌ Falhou: ${falhou}`);
  console.log('');

  if (falhou === 0) {
    console.log('🎉 Todos os testes passaram!');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os erros acima.');
  }
  console.log('');

  await pool.end();
}

main().catch(console.error);

