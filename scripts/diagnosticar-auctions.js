#!/usr/bin/env node
/**
 * Script de diagnóstico para identificar a causa do erro "Internal Server Error" na aba Leilões.
 * Verifica: tabelas existentes, schema da auctions, dependências.
 */
const path = require('path');
const backendPath = path.join(__dirname, '..', 'backend');
require('dotenv').config({ path: path.join(backendPath, '.env') });

const { Pool } = require('pg');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'rsv_360_ecosystem',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '290491Bb',
};

async function main() {
  const pool = new Pool(DB_CONFIG);

  console.log('');
  console.log('========================================');
  console.log('DIAGNÓSTICO - ABA LEILÕES (AUCTIONS)');
  console.log('========================================');
  console.log('');
  console.log('Banco:', DB_CONFIG.database, '| Host:', DB_CONFIG.host + ':' + DB_CONFIG.port);
  console.log('');

  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexão com banco OK');
  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
    process.exit(1);
  }

  const results = {
    auctionsExists: false,
    auctionsSchema: null,
    enterprisesExists: false,
    propertiesExists: false,
    accommodationsExists: false,
    bidsExists: false,
    customersExists: false,
    queryFullFails: null,
    querySimpleFails: null,
  };

  // 1. Verificar se tabela auctions existe
  console.log('');
  console.log('--- 1. TABELA AUCTIONS ---');
  try {
    const r = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'auctions')
    `);
    results.auctionsExists = r.rows[0]?.exists;
    console.log('  auctions existe:', results.auctionsExists ? '✅ SIM' : '❌ NÃO');
  } catch (e) {
    console.log('  Erro ao verificar:', e.message);
  }

  if (results.auctionsExists) {
    // Colunas da auctions
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'auctions'
      ORDER BY ordinal_position
    `);
    results.auctionsSchema = cols.rows.map(r => `${r.column_name} (${r.data_type})`);
    console.log('  Colunas:', results.auctionsSchema.join(', '));

    // Detectar qual schema (003 vs leiloes)
    const colNames = cols.rows.map(r => r.column_name);
    const hasEnterpriseId = colNames.includes('enterprise_id');
    const hasStartPrice = colNames.includes('start_price');
    const hasStartingPrice = colNames.includes('starting_price');
    const idType = cols.rows.find(r => r.column_name === 'id')?.data_type;

    if (hasEnterpriseId && hasStartPrice) {
      console.log('  Schema detectado: ✅ 003_create_auctions_tables (esperado pelo backend)');
    } else if (hasStartingPrice) {
      console.log('  Schema detectado: ⚠️ leiloes/001 (diferente do esperado - starting_price, sem enterprise_id)');
    } else {
      console.log('  Schema detectado: ⚠️ Desconhecido ou híbrido');
    }
    console.log('  Tipo do id:', idType);
  }

  // 2. Verificar tabelas dependentes
  console.log('');
  console.log('--- 2. TABELAS DEPENDENTES (para JOINs) ---');
  const tables = ['enterprises', 'properties', 'accommodations', 'bids', 'customers'];
  for (const t of tables) {
    try {
      const r = await pool.query(`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1)
      `, [t]);
      const exists = r.rows[0]?.exists;
      if (t === 'enterprises') results.enterprisesExists = exists;
      if (t === 'properties') results.propertiesExists = exists;
      if (t === 'accommodations') results.accommodationsExists = exists;
      if (t === 'bids') results.bidsExists = exists;
      if (t === 'customers') results.customersExists = exists;
      console.log('  ', t + ':', exists ? '✅ existe' : '❌ NÃO existe');
    } catch (e) {
      console.log('  ', t + ': erro -', e.message);
    }
  }

  // 3. Testar query completa (a que o service usa)
  console.log('');
  console.log('--- 3. TESTE DA QUERY COMPLETA (service.list) ---');
  if (results.auctionsExists) {
    const fullQuery = `
      SELECT a.*, e.name as enterprise_name, p.name as property_name, acc.name as accommodation_name,
        COUNT(b.id) as total_bids, MAX(b.amount) as highest_bid
      FROM auctions a
      LEFT JOIN enterprises e ON a.enterprise_id = e.id
      LEFT JOIN properties p ON a.property_id = p.id
      LEFT JOIN accommodations acc ON a.accommodation_id = acc.id
      LEFT JOIN bids b ON a.id = b.auction_id
      WHERE 1=1
      GROUP BY a.id, e.name, p.name, acc.name
      ORDER BY a.created_at DESC
      LIMIT 5
    `;
    try {
      const r = await pool.query(fullQuery);
      console.log('  ✅ Query completa OK -', r.rows.length, 'registro(s)');
      results.queryFullFails = false;
    } catch (e) {
      console.log('  ❌ Query completa FALHOU:', e.message);
      results.queryFullFails = e.message;
    }
  } else {
    console.log('  (pulado - auctions não existe)');
  }

  // 4. Testar query simples (fallback)
  console.log('');
  console.log('--- 4. TESTE DA QUERY SIMPLES (fallback) ---');
  if (results.auctionsExists) {
    try {
      const r = await pool.query('SELECT * FROM auctions ORDER BY created_at DESC NULLS LAST LIMIT 5');
      console.log('  ✅ Query simples OK -', r.rows.length, 'registro(s)');
      results.querySimpleFails = false;
    } catch (e) {
      try {
        const r2 = await pool.query('SELECT * FROM auctions ORDER BY start_date DESC NULLS LAST LIMIT 5');
        console.log('  ✅ Query simples (start_date) OK -', r2.rows.length, 'registro(s)');
        results.querySimpleFails = false;
      } catch (e2) {
        console.log('  ❌ Query simples FALHOU:', e2.message);
        results.querySimpleFails = e2.message;
      }
    }
  }

  // 5. Resumo e diagnóstico
  console.log('');
  console.log('========================================');
  console.log('DIAGNÓSTICO FINAL');
  console.log('========================================');

  if (!results.auctionsExists) {
    console.log('');
    console.log('CAUSA: Tabela auctions NÃO EXISTE');
    console.log('SOLUÇÃO: Executar migration 003_create_auctions_tables.sql');
    console.log('         (Requer: enterprises, properties, accommodations, customers)');
    console.log('');
  } else if (results.queryFullFails && !results.querySimpleFails) {
    console.log('');
    console.log('CAUSA: Query completa falha (JOINs) - tabelas auxiliares ausentes ou schema diferente');
    console.log('  - enterprises:', results.enterprisesExists ? 'OK' : 'FALTA');
    console.log('  - properties:', results.propertiesExists ? 'OK' : 'FALTA');
    console.log('  - accommodations:', results.accommodationsExists ? 'OK' : 'FALTA');
    console.log('  - bids:', results.bidsExists ? 'OK' : 'FALTA');
    console.log('SOLUÇÃO: O backend já tem fallback. Se ainda falhar, executar migrations 001 e 003.');
    console.log('');
  } else if (results.queryFullFails && results.querySimpleFails) {
    console.log('');
    console.log('CAUSA: Ambas as queries falham - schema de auctions incompatível');
    console.log('SOLUÇÃO: Verificar schema da tabela auctions e ajustar migrations.');
    console.log('');
  } else {
    console.log('');
    console.log('✅ Nenhum problema detectado nas tabelas. O erro pode ser:');
    console.log('   - Redis não conectado (cache/locks)');
    console.log('   - Backend em porta diferente');
    console.log('   - Token de autenticação inválido');
    console.log('');
  }

  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
