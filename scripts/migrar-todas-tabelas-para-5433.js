/**
 * Script para migrar todas as tabelas e dados para a porta 5433
 * Este script:
 * 1. Verifica tabelas existentes na porta 5433
 * 2. Gera scripts SQL para criar estruturas e migrar dados
 * 3. Executa a migração completa
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const TARGET_CONFIG = {
  host: 'localhost',
  port: 5433,
  database: 'rsv360',
  user: 'postgres',
  password: '290491Bb',
};

// Lista de portas para verificar (caso haja outro PostgreSQL)
const PORTS_TO_CHECK = [5432, 5434, 5435];

async function verificarOutrasPortas() {
  console.log('');
  console.log('========================================');
  console.log('VERIFICANDO OUTRAS INSTÂNCIAS POSTGRESQL');
  console.log('========================================');
  console.log('');
  
  const portasEncontradas = [];
  
  for (const port of PORTS_TO_CHECK) {
    try {
      const testPool = new Pool({
        host: 'localhost',
        port: port,
        database: 'postgres',
        user: 'postgres',
        password: '290491Bb',
        connectionTimeoutMillis: 2000,
      });
      
      await testPool.query('SELECT 1');
      await testPool.end();
      
      portasEncontradas.push(port);
      console.log(`  ✅ Porta ${port}: PostgreSQL acessível`);
    } catch (error) {
      console.log(`  ❌ Porta ${port}: Não acessível`);
    }
  }
  
  console.log('');
  return portasEncontradas;
}

async function obterEstruturaTabela(pool, tableName) {
  try {
    // Obter estrutura da tabela
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    
    // Obter constraints (PK, FK, UNIQUE, etc.)
    const constraints = await pool.query(`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1;
    `, [tableName]);
    
    // Obter índices
    const indexes = await pool.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = $1;
    `, [tableName]);
    
    return {
      columns: columns.rows,
      constraints: constraints.rows,
      indexes: indexes.rows,
    };
  } catch (error) {
    console.error(`  ⚠️  Erro ao obter estrutura de ${tableName}:`, error.message);
    return null;
  }
}

async function gerarScriptCriacaoTabela(pool, tableName) {
  const estrutura = await obterEstruturaTabela(pool, tableName);
  if (!estrutura) return null;
  
  let sql = `\n-- ============================================\n`;
  sql += `-- Tabela: ${tableName}\n`;
  sql += `-- ============================================\n\n`;
  sql += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
  
  const colDefs = estrutura.columns.map(col => {
    let def = `    "${col.column_name}" `;
    
    // Tipo de dados
    if (col.data_type === 'character varying') {
      def += `VARCHAR(${col.character_maximum_length || 255})`;
    } else if (col.data_type === 'character') {
      def += `CHAR(${col.character_maximum_length})`;
    } else if (col.data_type === 'numeric' || col.data_type === 'decimal') {
      def += col.udt_name.toUpperCase();
    } else if (col.data_type === 'timestamp without time zone') {
      def += 'TIMESTAMP';
    } else if (col.data_type === 'timestamp with time zone') {
      def += 'TIMESTAMPTZ';
    } else if (col.udt_name === 'uuid') {
      def += 'UUID';
    } else if (col.udt_name === 'jsonb') {
      def += 'JSONB';
    } else if (col.udt_name === 'bool') {
      def += 'BOOLEAN';
    } else {
      def += col.udt_name.toUpperCase();
    }
    
    // Nullable
    if (col.is_nullable === 'NO') {
      def += ' NOT NULL';
    }
    
    // Default
    if (col.column_default) {
      def += ` DEFAULT ${col.column_default}`;
    }
    
    return def;
  });
  
  sql += colDefs.join(',\n');
  sql += '\n);\n\n';
  
  // Adicionar comentários
  sql += `COMMENT ON TABLE "${tableName}" IS 'Migrado automaticamente';\n\n`;
  
  return sql;
}

async function migrarDados(sourcePool, targetPool, tableName) {
  try {
    // Verificar se a tabela existe no destino
    const targetExists = await targetPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    if (!targetExists.rows[0].exists) {
      console.log(`  ⚠️  Tabela ${tableName} não existe no destino. Pulando dados.`);
      return 0;
    }
    
    // Contar registros na origem
    const countSource = await sourcePool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const count = parseInt(countSource.rows[0].count);
    
    if (count === 0) {
      return 0;
    }
    
    // Verificar se já existem dados no destino
    const countTarget = await targetPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const existingCount = parseInt(countTarget.rows[0].count);
    
    if (existingCount > 0) {
      console.log(`  ⚠️  Tabela ${tableName} já possui ${existingCount} registros. Pulando.`);
      return 0;
    }
    
    // Obter dados da origem
    const data = await sourcePool.query(`SELECT * FROM "${tableName}"`);
    
    if (data.rows.length === 0) {
      return 0;
    }
    
    // Obter nomes das colunas
    const columns = Object.keys(data.rows[0]);
    const columnNames = columns.map(c => `"${c}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    // Inserir dados no destino
    let inserted = 0;
    for (const row of data.rows) {
      const values = columns.map(col => row[col]);
      try {
        await targetPool.query(
          `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
        inserted++;
      } catch (error) {
        console.error(`    ⚠️  Erro ao inserir registro em ${tableName}:`, error.message);
      }
    }
    
    return inserted;
  } catch (error) {
    console.error(`  ❌ Erro ao migrar dados de ${tableName}:`, error.message);
    return 0;
  }
}

async function main() {
  console.log('');
  console.log('========================================');
  console.log('MIGRAÇÃO DE TABELAS PARA PORTA 5433');
  console.log('========================================');
  console.log('');
  
  // Verificar outras portas
  const portasEncontradas = await verificarOutrasPortas();
  
  if (portasEncontradas.length === 0) {
    console.log('⚠️  Nenhuma outra instância PostgreSQL encontrada.');
    console.log('   Todas as tabelas já estão na porta 5433.');
    console.log('');
    return;
  }
  
  // Conectar ao banco de destino (5433)
  const targetPool = new Pool(TARGET_CONFIG);
  
  try {
    // Para cada porta encontrada (exceto 5433)
    for (const port of portasEncontradas) {
      if (port === 5433) continue;
      
      console.log('');
      console.log(`========================================`);
      console.log(`MIGRANDO DA PORTA ${port} PARA 5433`);
      console.log(`========================================`);
      console.log('');
      
      const sourcePool = new Pool({
        host: 'localhost',
        port: port,
        database: 'rsv360',
        user: 'postgres',
        password: '290491Bb',
      });
      
      try {
        // Listar tabelas na origem
        const tables = await sourcePool.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `);
        
        console.log(`Tabelas encontradas na porta ${port}: ${tables.rows.length}`);
        console.log('');
        
        // Migrar cada tabela
        for (const table of tables.rows) {
          const tableName = table.table_name;
          console.log(`Migrando: ${tableName}...`);
          
          // Verificar se já existe no destino
          const exists = await targetPool.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = $1
            );
          `, [tableName]);
          
          if (exists.rows[0].exists) {
            console.log(`  ⚠️  Tabela ${tableName} já existe no destino. Migrando apenas dados...`);
            const inserted = await migrarDados(sourcePool, targetPool, tableName);
            console.log(`  ✅ ${inserted} registros migrados`);
          } else {
            console.log(`  📋 Criando estrutura da tabela...`);
            const createSql = await gerarScriptCriacaoTabela(sourcePool, tableName);
            if (createSql) {
              await targetPool.query(createSql);
              console.log(`  ✅ Estrutura criada`);
              
              const inserted = await migrarDados(sourcePool, targetPool, tableName);
              console.log(`  ✅ ${inserted} registros migrados`);
            }
          }
        }
        
        await sourcePool.end();
      } catch (error) {
        console.error(`❌ Erro ao migrar da porta ${port}:`, error.message);
        await sourcePool.end();
      }
    }
    
    console.log('');
    console.log('========================================');
    console.log('✅ MIGRAÇÃO CONCLUÍDA!');
    console.log('========================================');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    await targetPool.end();
  }
}

main();
