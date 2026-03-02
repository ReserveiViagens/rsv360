/**
 * Script para executar Migration 020: Sistema de Tickets
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rsv_gen2',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function executeMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando Migration 020: Sistema de Tickets...\n');
    
    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, 'migration-020-create-tickets-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Executar migration
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migration 020 executada com sucesso!\n');
    
    // Verificar tabelas criadas
    console.log('🔍 Verificando tabelas criadas...\n');
    
    const tables = [
      'support_tickets',
      'ticket_comments',
      'ticket_attachments',
      'ticket_history',
      'ticket_sla'
    ];
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      
      if (result.rows[0].exists) {
        // Contar registros
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  ✅ ${table}: ${countResult.rows[0].count} registros`);
      } else {
        console.log(`  ❌ ${table}: NÃO ENCONTRADA`);
      }
    }
    
    // Verificar funções
    console.log('\n🔍 Verificando funções criadas...\n');
    const functions = ['generate_ticket_number', 'update_ticket_updated_at', 'log_ticket_history', 'log_comment_history'];
    
    for (const func of functions) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_proc 
          WHERE proname = $1
        )
      `, [func]);
      
      if (result.rows[0].exists) {
        console.log(`  ✅ ${func}(): Criada`);
      } else {
        console.log(`  ❌ ${func}(): NÃO ENCONTRADA`);
      }
    }
    
    // Verificar triggers
    console.log('\n🔍 Verificando triggers criados...\n');
    const triggers = [
      { table: 'support_tickets', name: 'trigger_update_ticket_updated_at' },
      { table: 'support_tickets', name: 'trigger_log_ticket_history' },
      { table: 'ticket_comments', name: 'trigger_log_comment_history' }
    ];
    
    for (const trigger of triggers) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_trigger 
          WHERE tgname = $1
        )
      `, [trigger.name]);
      
      if (result.rows[0].exists) {
        console.log(`  ✅ ${trigger.name} (${trigger.table}): Criado`);
      } else {
        console.log(`  ❌ ${trigger.name} (${trigger.table}): NÃO ENCONTRADO`);
      }
    }
    
    console.log('\n✨ Verificação concluída!\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao executar migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

executeMigration()
  .then(() => {
    console.log('🎉 Migration 020 concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });

