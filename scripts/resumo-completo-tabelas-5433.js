const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'rsv360',
  user: 'postgres',
  password: '290491Bb',
});

async function gerarResumo() {
  try {
    console.log('');
    console.log('========================================');
    console.log('RESUMO COMPLETO - PORTA 5433');
    console.log('========================================');
    console.log('');
    
    // Listar todas as tabelas
    const tables = await pool.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`📊 Total de tabelas: ${tables.rows.length}`);
    console.log('');
    
    // Agrupar por categoria
    const categorias = {
      'Sistema Base': ['users', 'files', 'conversations', 'agents'],
      'Leilões': ['auctions', 'bids'],
      'Turismo - Excursões': ['excursoes', 'excursoes_participantes', 'participantes_excursao', 'roteiros'],
      'Turismo - Viagens em Grupo': ['grupos_viagem', 'grupos_membros', 'membros_grupo', 'wishlist_items', 'wishlists_compartilhadas', 'pagamentos_divididos'],
      'Route Exchange': ['route_exchange_markets', 'route_bids', 'route_asks', 'route_matches', 'route_rfps', 'route_rfp_proposals', 'route_price_history', 'route_verification_logs'],
      'Website': ['website_content', 'properties', 'website_settings'],
      'Treinamento': ['training_content', 'training_conversations'],
    };
    
    console.log('📋 Tabelas por categoria:');
    console.log('');
    
    const tabelasCategorizadas = {};
    const tabelasSemCategoria = [];
    
    for (const table of tables.rows) {
      let categorizada = false;
      for (const [categoria, tabelas] of Object.entries(categorias)) {
        if (tabelas.includes(table.table_name)) {
          if (!tabelasCategorizadas[categoria]) {
            tabelasCategorizadas[categoria] = [];
          }
          tabelasCategorizadas[categoria].push(table);
          categorizada = true;
          break;
        }
      }
      if (!categorizada) {
        tabelasSemCategoria.push(table);
      }
    }
    
    for (const [categoria, tabelas] of Object.entries(tabelasCategorizadas)) {
      console.log(`  ${categoria}:`);
      for (const table of tabelas) {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
        const count = parseInt(countResult.rows[0].count);
        console.log(`    - ${table.table_name} (${table.column_count} colunas, ${count} registros)`);
      }
      console.log('');
    }
    
    if (tabelasSemCategoria.length > 0) {
      console.log('  Outras:');
      for (const table of tabelasSemCategoria) {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
        const count = parseInt(countResult.rows[0].count);
        console.log(`    - ${table.table_name} (${table.column_count} colunas, ${count} registros)`);
      }
      console.log('');
    }
    
    // Estatísticas gerais
    console.log('📈 Estatísticas:');
    let totalRegistros = 0;
    let tabelasComDados = 0;
    
    for (const table of tables.rows) {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
      const count = parseInt(countResult.rows[0].count);
      totalRegistros += count;
      if (count > 0) {
        tabelasComDados++;
      }
    }
    
    console.log(`  - Total de registros: ${totalRegistros}`);
    console.log(`  - Tabelas com dados: ${tabelasComDados} de ${tables.rows.length}`);
    console.log(`  - Tabelas vazias: ${tables.rows.length - tabelasComDados}`);
    console.log('');
    
    console.log('✅ Todas as tabelas estão na porta 5433!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

gerarResumo();
