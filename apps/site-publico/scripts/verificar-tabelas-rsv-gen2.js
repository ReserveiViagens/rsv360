/**
 * ✅ SCRIPT DE VERIFICAÇÃO - TABELAS RSV GEN 2
 * Verifica se todas as tabelas foram criadas corretamente
 * Data: 02/12/2025
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// Lista de tabelas esperadas
const tabelasEsperadas = {
  'Wishlists': [
    'shared_wishlists',
    'wishlist_members',
    'wishlist_items',
    'wishlist_votes'
  ],
  'Smart Pricing': [
    'pricing_history',
    'weather_cache',
    'local_events',
    'competitor_prices',
    'dynamic_pricing_config',
    'pricing_factors',
    'smart_pricing_config'
  ],
  'Quality Program': [
    'host_ratings',
    'host_badges',
    'host_badge_assignments',
    'quality_metrics',
    'host_scores',
    'host_incentives',
    'badge_assignment_history'
  ]
};

async function verificarTabelas() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando tabelas RSV Gen 2...\n');
    
    // Buscar todas as tabelas do schema public
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tabelasExistentes = result.rows.map(row => row.table_name);
    
    let totalEsperadas = 0;
    let totalEncontradas = 0;
    let totalFaltantes = 0;
    
    // Verificar por categoria
    for (const [categoria, tabelas] of Object.entries(tabelasEsperadas)) {
      console.log(`📊 ${categoria}:`);
      totalEsperadas += tabelas.length;
      
      for (const tabela of tabelas) {
        const existe = tabelasExistentes.includes(tabela);
        const status = existe ? '✅' : '❌';
        const statusText = existe ? 'EXISTE' : 'FALTANDO';
        
        console.log(`   ${status} ${tabela} - ${statusText}`);
        
        if (existe) {
          totalEncontradas++;
        } else {
          totalFaltantes++;
        }
      }
      console.log('');
    }
    
    // Verificar tabelas específicas solicitadas
    console.log('🎯 Verificação Específica:');
    const tabelasEspecificas = ['pricing_history', 'host_ratings'];
    
    for (const tabela of tabelasEspecificas) {
      const existe = tabelasExistentes.includes(tabela);
      const status = existe ? '✅' : '❌';
      
      if (existe) {
        // Buscar informações da tabela
        const info = await client.query(`
          SELECT 
            COUNT(*) as colunas
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = $1
        `, [tabela]);
        
        console.log(`   ${status} ${tabela} - EXISTE (${info.rows[0].colunas} colunas)`);
      } else {
        console.log(`   ${status} ${tabela} - FALTANDO`);
      }
    }
    
    console.log('\n📊 Resumo Geral:');
    console.log(`   Total esperado: ${totalEsperadas} tabelas`);
    console.log(`   Total encontradas: ${totalEncontradas} tabelas`);
    console.log(`   Total faltantes: ${totalFaltantes} tabelas`);
    console.log(`   Taxa de sucesso: ${((totalEncontradas / totalEsperadas) * 100).toFixed(1)}%\n`);
    
    // Verificar triggers
    console.log('🔧 Verificando Triggers:');
    const triggers = await client.query(`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
        AND trigger_name LIKE '%vote%' 
           OR trigger_name LIKE '%pricing%'
           OR trigger_name LIKE '%host%'
      ORDER BY trigger_name
    `);
    
    if (triggers.rows.length > 0) {
      triggers.rows.forEach(row => {
        console.log(`   ✅ ${row.trigger_name}`);
      });
    } else {
      console.log('   ⚠️  Nenhum trigger encontrado');
    }
    
    console.log('');
    
    // Verificar funções
    console.log('⚙️  Verificando Funções:');
    const funcoes = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
        AND routine_name LIKE '%wishlist%' 
           OR routine_name LIKE '%pricing%'
           OR routine_name LIKE '%host%'
      ORDER BY routine_name
    `);
    
    if (funcoes.rows.length > 0) {
      funcoes.rows.forEach(row => {
        console.log(`   ✅ ${row.routine_name}`);
      });
    } else {
      console.log('   ⚠️  Nenhuma função encontrada');
    }
    
    console.log('');
    
    if (totalFaltantes === 0) {
      console.log('🎉 Todas as tabelas foram criadas com sucesso!\n');
    } else {
      console.log('⚠️  Algumas tabelas estão faltando. Verifique acima.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao verificar tabelas:');
    console.error(error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verificarTabelas();

