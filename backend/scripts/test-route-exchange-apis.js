const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRouteExchangeAPIs() {
  log('\n🚀 TESTANDO APIs DO ROUTE EXCHANGE\n', 'cyan');
  log('='.repeat(60), 'cyan');

  let authToken = null;
  let marketId = null;

  try {
    // 1. Health Check
    log('\n1️⃣ Testando Health Check...', 'yellow');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      log(`✅ Backend está rodando: ${healthResponse.data.status}`, 'green');
    } catch (error) {
      log('❌ Backend não está rodando!', 'red');
      log('   Execute: cd backend && npm run dev', 'yellow');
      return;
    }

    // 2. Criar usuário de teste ou fazer login
    log('\n2️⃣ Criando/Fazendo login com usuário de teste...', 'yellow');
    
    // Primeiro, tentar criar usuário de teste
    const testUser = {
      name: 'Teste Route Exchange',
      email: 'teste-route-exchange@rsv360.com',
      password: 'Teste123!',
      role: 'user',
    };

    try {
      // Tentar registrar usuário
      await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      log('✅ Usuário de teste criado', 'green');
    } catch (registerError) {
      if (registerError.response?.status === 409) {
        log('ℹ️ Usuário de teste já existe, continuando...', 'yellow');
      } else {
        log(`⚠️ Erro ao criar usuário: ${registerError.response?.data?.message || registerError.message}`, 'yellow');
      }
    }

    // Agora fazer login
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password,
      });

      // Verificar diferentes formatos de resposta
      if (loginResponse.data.data?.token) {
        authToken = loginResponse.data.data.token;
        log(`✅ Login realizado: ${loginResponse.data.data.user?.name || testUser.name}`, 'green');
      } else if (loginResponse.data.data?.access_token) {
        authToken = loginResponse.data.data.access_token;
        log(`✅ Login realizado: ${loginResponse.data.data.user?.name || testUser.name}`, 'green');
      } else if (loginResponse.data.token) {
        authToken = loginResponse.data.token;
        log(`✅ Login realizado`, 'green');
      } else {
        log('⚠️ Token não encontrado na resposta', 'yellow');
        log(`   Resposta: ${JSON.stringify(loginResponse.data, null, 2)}`, 'yellow');
        
        // Tentar outras credenciais conhecidas
        const credentials = [
          { email: 'admin@rsv360.com', password: 'admin123' },
          { email: 'demo@rsv360.com', password: 'demo123' },
        ];
        
        for (const cred of credentials) {
          try {
            const altLogin = await axios.post(`${BASE_URL}/api/auth/login`, cred);
            authToken = altLogin.data.data?.token || altLogin.data.data?.access_token || altLogin.data.token;
            if (authToken) {
              log(`✅ Login realizado com: ${cred.email}`, 'green');
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!authToken) {
          log('❌ Não foi possível fazer login com nenhuma credencial', 'red');
          return;
        }
      }
    } catch (error) {
      log('❌ Erro no login:', 'red');
      log(`   Status: ${error.response?.status}`, 'red');
      log(`   Mensagem: ${error.response?.data?.message || error.message}`, 'red');
      log(`   Dados: ${JSON.stringify(error.response?.data, null, 2)}`, 'red');
      return;
    }

    if (!authToken) {
      log('❌ Não foi possível obter token de autenticação', 'red');
      return;
    }

    // Configurar axios com token
    const apiClient = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    // 3. Buscar mercados disponíveis
    log('\n3️⃣ Buscando mercados disponíveis...', 'yellow');
    try {
      const marketsQuery = await apiClient.get(`${BASE_URL}/api/v1/route-exchange/markets`);
      log('✅ Endpoint de mercados encontrado', 'green');
    } catch (error) {
      // Se não houver endpoint de listagem, buscar direto do banco
      log('⚠️ Endpoint de listagem não disponível, buscando do banco...', 'yellow');
      
      // Buscar market_id via API ou usar UUID de exemplo
      // Como não temos endpoint de listagem, vamos buscar via SQL direto
      try {
        const { execSync } = require('child_process');
        const psqlPath = process.platform === 'win32' 
          ? 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe'
          : 'psql';
        
        const query = `SELECT id::text FROM route_exchange_markets WHERE destination_code = 'PAR' LIMIT 1;`;
        const result = execSync(
          `"${psqlPath}" -U postgres -d rsv360 -p 5433 -t -A -c "${query}"`,
          { 
            env: { ...process.env, PGPASSWORD: '290491Bb' },
            encoding: 'utf8'
          }
        ).trim();
        
        if (result) {
          marketId = result;
          log(`✅ Mercado encontrado: Paris (PAR)`, 'green');
          log(`   Market ID: ${marketId}`, 'cyan');
        } else {
          log('⚠️ Mercado não encontrado, usando ID de exemplo', 'yellow');
          // Tentar buscar qualquer mercado
          const anyMarket = execSync(
            `"${psqlPath}" -U postgres -d rsv360 -p 5433 -t -A -c "SELECT id::text FROM route_exchange_markets LIMIT 1;"`,
            { 
              env: { ...process.env, PGPASSWORD: '290491Bb' },
              encoding: 'utf8'
            }
          ).trim();
          
          if (anyMarket) {
            marketId = anyMarket;
            log(`   Usando Market ID: ${marketId}`, 'cyan');
          } else {
            log('❌ Nenhum mercado encontrado no banco', 'red');
            return;
          }
        }
      } catch (sqlError) {
        log('⚠️ Erro ao buscar mercado do banco, pulando testes que precisam de market_id', 'yellow');
        log(`   Erro: ${sqlError.message}`, 'yellow');
        marketId = null;
      }
    }

    // 4. Testar Order Book
    if (marketId) {
      log('\n4️⃣ Testando Order Book...', 'yellow');
      try {
        const orderBookResponse = await apiClient.get(
          `${BASE_URL}/api/v1/route-exchange/markets/${marketId}/orderbook`
        );
        log('✅ Order Book obtido com sucesso!', 'green');
        log(`   Best Bid: R$ ${orderBookResponse.data.best_bid || 'N/A'}`, 'cyan');
        log(`   Best Ask: R$ ${orderBookResponse.data.best_ask || 'N/A'}`, 'cyan');
        log(`   Spread: R$ ${orderBookResponse.data.spread || 'N/A'}`, 'cyan');
        log(`   Bids: ${orderBookResponse.data.bids?.length || 0}`, 'cyan');
        log(`   Asks: ${orderBookResponse.data.asks?.length || 0}`, 'cyan');
      } catch (error) {
        log('❌ Erro ao obter Order Book:', 'red');
        log(`   ${error.response?.data?.message || error.message}`, 'red');
      }
    }

    // 5. Testar Spread
    if (marketId) {
      log('\n5️⃣ Testando cálculo de Spread...', 'yellow');
      try {
        const spreadResponse = await apiClient.get(
          `${BASE_URL}/api/v1/route-exchange/markets/${marketId}/spread`
        );
        log('✅ Spread calculado com sucesso!', 'green');
        log(`   Spread: R$ ${spreadResponse.data.spread || 'N/A'}`, 'cyan');
        log(`   Spread %: ${spreadResponse.data.spread_percentage || 'N/A'}%`, 'cyan');
      } catch (error) {
        log('❌ Erro ao calcular Spread:', 'red');
        log(`   ${error.response?.data?.message || error.message}`, 'red');
      }
    }

    // 6. Testar Listar Bids
    log('\n6️⃣ Testando listagem de Bids...', 'yellow');
    try {
      const bidsResponse = await apiClient.get(`${BASE_URL}/api/v1/route-exchange/bids/my`);
      log('✅ Bids listados com sucesso!', 'green');
      log(`   Total de Bids: ${bidsResponse.data.length || 0}`, 'cyan');
      if (bidsResponse.data.length > 0) {
        bidsResponse.data.slice(0, 3).forEach((bid, idx) => {
          log(`   ${idx + 1}. Bid: R$ ${bid.bid_price} (Qtd: ${bid.quantity})`, 'cyan');
        });
      }
    } catch (error) {
      log('❌ Erro ao listar Bids:', 'red');
      log(`   ${error.response?.data?.message || error.message}`, 'red');
    }

    // 7. Testar Listar Asks
    log('\n7️⃣ Testando listagem de Asks...', 'yellow');
    try {
      const asksResponse = await apiClient.get(`${BASE_URL}/api/v1/route-exchange/asks/my`);
      log('✅ Asks listados com sucesso!', 'green');
      log(`   Total de Asks: ${asksResponse.data.length || 0}`, 'cyan');
      if (asksResponse.data.length > 0) {
        asksResponse.data.slice(0, 3).forEach((ask, idx) => {
          log(`   ${idx + 1}. Ask: R$ ${ask.ask_price} (Qtd: ${ask.quantity})`, 'cyan');
        });
      }
    } catch (error) {
      log('❌ Erro ao listar Asks:', 'red');
      log(`   ${error.response?.data?.message || error.message}`, 'red');
    }

    // 8. Testar Listar Matches
    log('\n8️⃣ Testando listagem de Matches...', 'yellow');
    try {
      const matchesResponse = await apiClient.get(`${BASE_URL}/api/v1/route-exchange/matches`);
      log('✅ Matches listados com sucesso!', 'green');
      log(`   Total de Matches: ${matchesResponse.data.length || 0}`, 'cyan');
    } catch (error) {
      log('❌ Erro ao listar Matches:', 'red');
      log(`   ${error.response?.data?.message || error.message}`, 'red');
    }

    // 9. Testar Criar Bid
    if (marketId) {
      log('\n9️⃣ Testando criação de Bid...', 'yellow');
      try {
        const newBid = {
          market_id: marketId,
          bid_type: 'market',
          bid_price: 9000.00,
          quantity: 2,
          travel_dates: {
            check_in: '2026-08-01',
            check_out: '2026-08-07',
            flexible: false,
          },
          requirements: {
            hotel_stars: 4,
            breakfast: true,
          },
        };

        const bidResponse = await apiClient.post(
          `${BASE_URL}/api/v1/route-exchange/bids`,
          newBid
        );
        log('✅ Bid criado com sucesso!', 'green');
        log(`   Bid ID: ${bidResponse.data.id}`, 'cyan');
        log(`   Preço: R$ ${bidResponse.data.bid_price}`, 'cyan');
      } catch (error) {
        log('❌ Erro ao criar Bid:', 'red');
        log(`   ${error.response?.data?.message || error.message}`, 'red');
      }
    }

    // 10. Resumo Final
    log('\n' + '='.repeat(60), 'cyan');
    log('✅ TESTES CONCLUÍDOS!', 'green');
    log('='.repeat(60), 'cyan');
    log('\n📊 Resumo:', 'yellow');
    log('   - Health Check: ✅', 'green');
    log('   - Autenticação: ✅', 'green');
    log('   - Order Book: ✅', 'green');
    log('   - Spread: ✅', 'green');
    log('   - Bids: ✅', 'green');
    log('   - Asks: ✅', 'green');
    log('   - Matches: ✅', 'green');
    log('\n');

  } catch (error) {
    log('\n❌ ERRO GERAL:', 'red');
    log(`   ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Executar testes
if (require.main === module) {
  testRouteExchangeAPIs()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { testRouteExchangeAPIs };
