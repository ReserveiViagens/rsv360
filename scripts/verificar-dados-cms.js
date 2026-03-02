/**
 * Script para verificar se os dados do CMS estão no banco de dados
 * Executado durante a inicialização do sistema
 */

const { Pool } = require('pg');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'rsv360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '290491Bb',
};

async function verificarDadosCMS() {
  console.log('');
  console.log('========================================');
  console.log('VERIFICAÇÃO DE DADOS DO CMS');
  console.log('========================================');
  console.log('');
  
  const pool = new Pool(DB_CONFIG);
  
  try {
    // Testar conexão
    await pool.query('SELECT 1');
    console.log('✅ Conexão com banco de dados estabelecida');
    console.log('');
    
    // Verificar website_settings
    console.log('1. Verificando website_settings...');
    const settings = await pool.query('SELECT COUNT(*) as total FROM website_settings');
    const totalSettings = parseInt(settings.rows[0].total);
    
    if (totalSettings > 0) {
      console.log(`   ✅ ${totalSettings} configurações encontradas`);
      
      // Listar configurações
      const settingsList = await pool.query('SELECT setting_key FROM website_settings ORDER BY setting_key');
      settingsList.rows.forEach(row => {
        console.log(`      - ${row.setting_key}`);
      });
    } else {
      console.log('   ⚠️  Nenhuma configuração encontrada');
    }
    console.log('');
    
    // Verificar website_content
    console.log('2. Verificando website_content...');
    const content = await pool.query(`
      SELECT 
        page_type,
        COUNT(*) as total
      FROM website_content
      WHERE status = 'active'
      GROUP BY page_type
      ORDER BY page_type
    `);
    
    if (content.rows.length > 0) {
      let totalGeral = 0;
      content.rows.forEach(row => {
        const total = parseInt(row.total);
        totalGeral += total;
        console.log(`   ✅ ${row.page_type}: ${total} registros`);
      });
      console.log(`   📊 Total: ${totalGeral} registros ativos`);
    } else {
      console.log('   ⚠️  Nenhum conteúdo encontrado');
    }
    console.log('');
    
    // Verificar properties
    console.log('3. Verificando properties...');
    const properties = await pool.query('SELECT COUNT(*) as total FROM properties');
    const totalProperties = parseInt(properties.rows[0].total);
    
    if (totalProperties > 0) {
      console.log(`   ✅ ${totalProperties} propriedades encontradas`);
    } else {
      console.log('   ⚠️  Nenhuma propriedade encontrada');
    }
    console.log('');
    
    // Resumo final
    console.log('========================================');
    console.log('✅ VERIFICAÇÃO CONCLUÍDA');
    console.log('========================================');
    console.log('');
    
    // Calcular total geral de conteúdo
    let totalGeral = 0;
    if (content.rows.length > 0) {
      content.rows.forEach(row => {
        totalGeral += parseInt(row.total);
      });
    }
    
    if (totalSettings > 0 && totalGeral > 0) {
      console.log('✅ Dados do CMS estão disponíveis!');
      console.log('   O sistema pode funcionar normalmente.');
    } else {
      console.log('⚠️  ATENÇÃO: Alguns dados podem estar faltando!');
      console.log('   Execute o script de migração se necessário.');
    }
    console.log('');
    
    await pool.end();
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error.message);
    console.error('');
    console.error('Possíveis causas:');
    console.error('  1. PostgreSQL não está rodando na porta 5433');
    console.error('  2. Banco de dados "rsv360" não existe');
    console.error('  3. Credenciais incorretas');
    console.error('');
    console.error('Solução:');
    console.error('  - Execute: .\scripts\verificar-iniciar-postgresql.ps1');
    console.error('  - Ou inicie o PostgreSQL manualmente');
    console.error('');
    
    await pool.end();
    return false;
  }
}

// Executar verificação
verificarDadosCMS().catch(console.error);
