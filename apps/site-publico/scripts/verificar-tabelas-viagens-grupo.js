/**
 * ✅ SCRIPT DE VERIFICAÇÃO - TABELAS VIAGENS EM GRUPO
 * Verifica se todas as tabelas necessárias para viagens em grupo foram criadas
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

// Tabelas esperadas para viagens em grupo
const tabelasEsperadas = {
  'Wishlists': [
    'shared_wishlists',
    'wishlist_members',
    'wishlist_items',
    'wishlist_votes'
  ],
  'Split Payment': [
    'split_payments',
    'split_payment_participants',
    'split_payment_history'
  ],
  'Trip Invitations': [
    'trip_invitations',
    'trip_invitation_history'
  ],
  'Group Chat': [
    'group_chats',
    'group_chat_members',
    'group_chat_messages',
    'group_chat_message_reads'
  ]
};

async function verificarTabelas() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando tabelas de Viagens em Grupo...\n');
    
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
    
    console.log('📊 Resumo Geral:');
    console.log(`   Total esperado: ${totalEsperadas} tabelas`);
    console.log(`   Total encontradas: ${totalEncontradas} tabelas`);
    console.log(`   Total faltantes: ${totalFaltantes} tabelas`);
    console.log(`   Taxa de sucesso: ${((totalEncontradas / totalEsperadas) * 100).toFixed(1)}%\n`);
    
    if (totalFaltantes === 0) {
      console.log('🎉 Todas as tabelas foram criadas com sucesso!\n');
    } else {
      console.log('⚠️  Algumas tabelas estão faltando. Execute as migrations necessárias.\n');
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

