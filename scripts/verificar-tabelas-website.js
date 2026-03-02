const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'rsv360',
  user: 'postgres',
  password: '290491Bb',
});

async function verificarTabelas() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('website_content', 'properties', 'website_settings')
      ORDER BY table_name;
    `);
    
    console.log('');
    console.log('========================================');
    console.log('VERIFICAÇÃO DE TABELAS');
    console.log('========================================');
    console.log('');
    console.log(`Tabelas encontradas: ${result.rows.length}`);
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    console.log('');
    
    if (result.rows.length === 3) {
      console.log('✅ Todas as tabelas necessárias existem!');
    } else {
      console.log('⚠️  Algumas tabelas estão faltando!');
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
  } finally {
    await pool.end();
  }
}

verificarTabelas();
