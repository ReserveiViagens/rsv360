const { Pool } = require('pg');

const pool5433 = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'rsv360',
  user: 'postgres',
  password: '290491Bb',
});

async function analisarTabelas() {
  try {
    console.log('');
    console.log('========================================');
    console.log('ANÁLISE DE TABELAS - PORTA 5433');
    console.log('========================================');
    console.log('');
    
    const result = await pool5433.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`Total de tabelas encontradas: ${result.rows.length}`);
    console.log('');
    console.log('Tabelas:');
    result.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name} (${row.column_count} colunas)`);
    });
    console.log('');
    
    // Verificar dados em cada tabela
    console.log('Contagem de registros por tabela:');
    for (const row of result.rows) {
      try {
        const countResult = await pool5433.query(`SELECT COUNT(*) as count FROM "${row.table_name}"`);
        console.log(`  ${row.table_name}: ${countResult.rows[0].count} registros`);
      } catch (error) {
        console.log(`  ${row.table_name}: Erro ao contar - ${error.message}`);
      }
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro ao analisar tabelas:', error.message);
  } finally {
    await pool5433.end();
  }
}

analisarTabelas();
