/**
 * Script completo para migrar todas as tabelas do Docker (porta 5432)
 * para o PostgreSQL nativo (porta 5433)
 * 
 * Banco origem: rsv_360_ecosystem (porta 5432 - Docker)
 * Banco destino: rsv360 (porta 5433 - PostgreSQL nativo)
 */

const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SOURCE_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'rsv_360_ecosystem',
  user: 'postgres',
  password: '290491Bb',
};

const TARGET_CONFIG = {
  host: 'localhost',
  port: 5433,
  database: 'rsv360',
  user: 'postgres',
  password: '290491Bb',
};

// Lista de tabelas do relatório fornecido
const TABELAS_DOCKER = [
  'audit_logs',
  'bookings',
  'bookings_rsv360',
  'customers',
  'customers_rsv360',
  'files',
  'knex_migrations',
  'knex_migrations_lock',
  'notifications',
  'owners',
  'payments',
  'payments_rsv360',
  'properties',
  'property_availability',
  'property_shares',
  'share_calendar',
  'travel_packages',
  'user_fcm_tokens',
  'users',
  'website_content',
  'website_content_history',
  'website_settings',
];

async function verificarConexaoDocker() {
  const pool = new Pool(SOURCE_CONFIG);
  try {
    await pool.query('SELECT 1');
    await pool.end();
    return true;
  } catch (error) {
    await pool.end();
    return false;
  }
}

async function obterEstruturaCompletaTabela(pool, tableName) {
  try {
    // Obter colunas
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        udt_name,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    
    // Obter constraints (PK, FK, UNIQUE, CHECK)
    const constraints = await pool.query(`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      LEFT JOIN information_schema.key_column_usage AS kcu
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

function mapearTipoPostgres(dataType, udtName, maxLength, precision, scale) {
  if (udtName === 'uuid') return 'UUID';
  if (udtName === 'jsonb') return 'JSONB';
  if (udtName === 'json') return 'JSON';
  if (udtName === 'bool') return 'BOOLEAN';
  if (udtName === 'text') return 'TEXT';
  if (udtName === 'int4') return 'INTEGER';
  if (udtName === 'int8') return 'BIGINT';
  if (udtName === 'serial') return 'SERIAL';
  if (udtName === 'numeric') {
    if (precision && scale) {
      return `NUMERIC(${precision},${scale})`;
    }
    return 'NUMERIC';
  }
  if (udtName === 'varchar') {
    return maxLength ? `VARCHAR(${maxLength})` : 'VARCHAR';
  }
  if (udtName === 'char') {
    return maxLength ? `CHAR(${maxLength})` : 'CHAR';
  }
  if (dataType === 'timestamp with time zone') return 'TIMESTAMPTZ';
  if (dataType === 'timestamp without time zone') return 'TIMESTAMP';
  if (dataType === 'date') return 'DATE';
  if (dataType === 'time without time zone') return 'TIME';
  
  return udtName.toUpperCase();
}

async function gerarSQLCriacaoTabela(pool, tableName) {
  const estrutura = await obterEstruturaCompletaTabela(pool, tableName);
  if (!estrutura) return null;
  
  let sql = `\n-- ============================================\n`;
  sql += `-- Tabela: ${tableName}\n`;
  sql += `-- Migrada do Docker (porta 5432)\n`;
  sql += `-- ============================================\n\n`;
  sql += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
  
  const colDefs = estrutura.columns.map(col => {
    let def = `    "${col.column_name}" `;
    
    // Tipo de dados
    def += mapearTipoPostgres(
      col.data_type,
      col.udt_name,
      col.character_maximum_length,
      col.numeric_precision,
      col.numeric_scale
    );
    
    // Nullable
    if (col.is_nullable === 'NO') {
      def += ' NOT NULL';
    }
    
    // Default
    if (col.column_default) {
      // Remover ::type do default se existir
      let defaultValue = col.column_default;
      defaultValue = defaultValue.replace(/::\w+/g, '');
      // Se for uma função (como nextval, now(), etc), manter como está
      if (!defaultValue.match(/^[a-z_]+\(/)) {
        def += ` DEFAULT ${defaultValue}`;
      } else {
        def += ` DEFAULT ${defaultValue}`;
      }
    }
    
    return def;
  });
  
  sql += colDefs.join(',\n');
  sql += '\n);\n\n';
  
  // Adicionar constraints de chave primária
  const pkConstraints = estrutura.constraints.filter(c => c.constraint_type === 'PRIMARY KEY');
  for (const pk of pkConstraints) {
    if (pk.column_name) {
      sql += `ALTER TABLE "${tableName}" ADD CONSTRAINT IF NOT EXISTS "${pk.constraint_name}" PRIMARY KEY ("${pk.column_name}");\n`;
    }
  }
  
  // Adicionar constraints UNIQUE
  const uniqueConstraints = estrutura.constraints.filter(c => c.constraint_type === 'UNIQUE');
  for (const uq of uniqueConstraints) {
    if (uq.column_name) {
      sql += `ALTER TABLE "${tableName}" ADD CONSTRAINT IF NOT EXISTS "${uq.constraint_name}" UNIQUE ("${uq.column_name}");\n`;
    }
  }
  
  // Adicionar índices (exceto PK e UNIQUE que já são criados)
  const indexConstraints = estrutura.indexes.filter(idx => 
    !idx.indexdef.includes('PRIMARY KEY') && 
    !idx.indexdef.includes('UNIQUE')
  );
  for (const idx of indexConstraints) {
    // Extrair apenas a parte CREATE INDEX da definição
    let indexDef = idx.indexdef;
    // Substituir o nome do índice para evitar conflitos
    const newIndexName = `${tableName}_${idx.indexname.replace(/^.*_/, '')}`;
    indexDef = indexDef.replace(/CREATE\s+UNIQUE\s+INDEX\s+\w+/, `CREATE INDEX IF NOT EXISTS ${newIndexName}`);
    indexDef = indexDef.replace(/CREATE\s+INDEX\s+\w+/, `CREATE INDEX IF NOT EXISTS ${newIndexName}`);
    sql += `${indexDef};\n`;
  }
  
  sql += `\n`;
  
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
      return { inserted: 0, skipped: 0, errors: 0, message: 'Tabela não existe no destino' };
    }
    
    // Contar registros na origem
    const countSource = await sourcePool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const count = parseInt(countSource.rows[0].count);
    
    if (count === 0) {
      return { inserted: 0, skipped: 0, errors: 0, message: 'Tabela vazia na origem' };
    }
    
    // Verificar se já existem dados no destino
    const countTarget = await targetPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const existingCount = parseInt(countTarget.rows[0].count);
    
    if (existingCount > 0) {
      return { inserted: 0, skipped: count, errors: 0, message: `Já possui ${existingCount} registros` };
    }
    
    // Obter dados da origem
    const data = await sourcePool.query(`SELECT * FROM "${tableName}"`);
    
    if (data.rows.length === 0) {
      return { inserted: 0, skipped: 0, errors: 0, message: 'Nenhum dado para migrar' };
    }
    
    // Obter nomes das colunas
    const columns = Object.keys(data.rows[0]);
    const columnNames = columns.map(c => `"${c}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    // Inserir dados no destino em lotes
    let inserted = 0;
    let errors = 0;
    const batchSize = 100;
    
    for (let i = 0; i < data.rows.length; i += batchSize) {
      const batch = data.rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        const values = columns.map(col => {
          const value = row[col];
          // Converter nulls explícitos
          if (value === null || value === undefined) {
            return null;
          }
          return value;
        });
        
        try {
          await targetPool.query(
            `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values
          );
          inserted++;
        } catch (error) {
          errors++;
          if (errors <= 3) { // Mostrar apenas os primeiros 3 erros
            console.error(`    ⚠️  Erro ao inserir registro:`, error.message.substring(0, 100));
          }
        }
      }
    }
    
    return { inserted, skipped: count - inserted - errors, errors, message: 'OK' };
  } catch (error) {
    return { inserted: 0, skipped: 0, errors: 1, message: error.message };
  }
}

async function compararTabelas() {
  console.log('');
  console.log('========================================');
  console.log('COMPARAÇÃO DE TABELAS');
  console.log('========================================');
  console.log('');
  
  const sourcePool = new Pool(SOURCE_CONFIG);
  const targetPool = new Pool(TARGET_CONFIG);
  
  try {
    // Listar tabelas na origem (Docker)
    const sourceTables = await sourcePool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    // Listar tabelas no destino (5433)
    const targetTables = await targetPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const sourceTableNames = new Set(sourceTables.rows.map(r => r.table_name));
    const targetTableNames = new Set(targetTables.rows.map(r => r.table_name));
    
    const faltam = Array.from(sourceTableNames).filter(t => !targetTableNames.has(t));
    const existem = Array.from(sourceTableNames).filter(t => targetTableNames.has(t));
    const extras = Array.from(targetTableNames).filter(t => !sourceTableNames.has(t));
    
    console.log(`📊 Tabelas no Docker (porta 5432): ${sourceTableNames.size}`);
    console.log(`📊 Tabelas no PostgreSQL (porta 5433): ${targetTableNames.size}`);
    console.log('');
    
    console.log(`✅ Tabelas que já existem (${existem.length}):`);
    existem.forEach(t => console.log(`  - ${t}`));
    console.log('');
    
    console.log(`❌ Tabelas que FALTAM migrar (${faltam.length}):`);
    faltam.forEach(t => console.log(`  - ${t}`));
    console.log('');
    
    if (extras.length > 0) {
      console.log(`ℹ️  Tabelas extras no destino (${extras.length}):`);
      extras.forEach(t => console.log(`  - ${t}`));
      console.log('');
    }
    
    await sourcePool.end();
    await targetPool.end();
    
    return { faltam, existem, extras, sourceTableNames: Array.from(sourceTableNames) };
  } catch (error) {
    console.error('❌ Erro ao comparar tabelas:', error.message);
    await sourcePool.end();
    await targetPool.end();
    return { faltam: [], existem: [], extras: [], sourceTableNames: [] };
  }
}

async function executarMigracao() {
  console.log('');
  console.log('========================================');
  console.log('MIGRAÇÃO DOCKER → PORTA 5433');
  console.log('========================================');
  console.log('');
  
  // Verificar conexão com Docker
  console.log('1. Verificando conexão com Docker (porta 5432)...');
  const dockerAcessivel = await verificarConexaoDocker();
  
  if (!dockerAcessivel) {
    console.log('  ❌ Não foi possível conectar ao Docker na porta 5432.');
    console.log('  💡 Tentando verificar se o container está rodando...');
    
    try {
      const dockerPs = execSync('docker ps --filter "name=postgres-rsv360" --format "{{.Names}}"', { encoding: 'utf8' });
      if (dockerPs.trim()) {
        console.log(`  ✅ Container encontrado: ${dockerPs.trim()}`);
        console.log('  ⚠️  Mas não foi possível conectar. Verificando credenciais...');
      }
    } catch (e) {
      console.log('  ❌ Container não encontrado ou Docker não acessível');
    }
    
    console.log('');
    return;
  }
  
  console.log('  ✅ Docker acessível');
  console.log('');
  
  // Comparar tabelas
  console.log('2. Comparando tabelas...');
  const comparacao = await compararTabelas();
  
  if (comparacao.faltam.length === 0 && comparacao.sourceTableNames.length > 0) {
    console.log('  ✅ Todas as tabelas já existem no destino!');
    console.log('  💡 Executando migração de dados apenas...');
    console.log('');
  }
  
  // Conectar aos pools
  const sourcePool = new Pool(SOURCE_CONFIG);
  const targetPool = new Pool(TARGET_CONFIG);
  
  try {
    const tabelasParaMigrar = comparacao.sourceTableNames.length > 0 
      ? comparacao.sourceTableNames 
      : TABELAS_DOCKER;
    
    console.log('3. Executando migração...');
    console.log('');
    
    const resultados = {
      criadas: 0,
      dadosMigrados: 0,
      erros: 0,
      detalhes: [],
    };
    
    for (const tableName of tabelasParaMigrar) {
      console.log(`📋 Migrando: ${tableName}...`);
      
      try {
        // Verificar se precisa criar a tabela
        const existe = comparacao.existem.includes(tableName) || 
                      (await targetPool.query(`
                        SELECT EXISTS (
                          SELECT FROM information_schema.tables 
                          WHERE table_schema = 'public' 
                          AND table_name = $1
                        );
                      `, [tableName])).rows[0].exists;
        
        if (!existe) {
          console.log(`  📋 Criando estrutura da tabela...`);
          const createSql = await gerarSQLCriacaoTabela(sourcePool, tableName);
          if (createSql) {
            try {
              await targetPool.query(createSql);
              console.log(`  ✅ Estrutura criada`);
              resultados.criadas++;
            } catch (error) {
              console.log(`  ⚠️  Erro ao criar estrutura: ${error.message.substring(0, 100)}`);
              resultados.erros++;
              continue;
            }
          } else {
            console.log(`  ⚠️  Não foi possível gerar SQL de criação`);
            resultados.erros++;
            continue;
          }
        } else {
          console.log(`  ℹ️  Tabela já existe, migrando apenas dados...`);
        }
        
        // Migrar dados
        console.log(`  📦 Migrando dados...`);
        const dados = await migrarDados(sourcePool, targetPool, tableName);
        
        if (dados.message === 'OK') {
          console.log(`  ✅ ${dados.inserted} registros inseridos`);
          if (dados.skipped > 0) {
            console.log(`  ⏭️  ${dados.skipped} registros pulados (já existiam)`);
          }
          if (dados.errors > 0) {
            console.log(`  ⚠️  ${dados.errors} erros durante inserção`);
          }
        } else {
          console.log(`  ℹ️  ${dados.message}`);
        }
        
        resultados.dadosMigrados += dados.inserted;
        resultados.erros += dados.errors;
        
        resultados.detalhes.push({
          tabela: tableName,
          criada: !existe,
          registros: dados.inserted,
          erros: dados.errors,
          status: dados.message,
        });
        
      } catch (error) {
        console.error(`  ❌ Erro ao migrar ${tableName}:`, error.message);
        resultados.erros++;
        resultados.detalhes.push({
          tabela: tableName,
          criada: false,
          registros: 0,
          erros: 1,
          status: `Erro: ${error.message.substring(0, 50)}`,
        });
      }
      
      console.log('');
    }
    
    console.log('========================================');
    console.log('✅ MIGRAÇÃO CONCLUÍDA!');
    console.log('========================================');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`  - Tabelas criadas: ${resultados.criadas}`);
    console.log(`  - Registros migrados: ${resultados.dadosMigrados}`);
    console.log(`  - Erros: ${resultados.erros}`);
    console.log('');
    
    // Salvar relatório
    const relatorioPath = path.join(__dirname, '..', 'RELATORIO_MIGRACAO_DOCKER_5433.md');
    let relatorio = `# 📊 Relatório de Migração Docker → Porta 5433\n\n`;
    relatorio += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;
    relatorio += `## 📊 Resumo\n\n`;
    relatorio += `- Tabelas criadas: ${resultados.criadas}\n`;
    relatorio += `- Registros migrados: ${resultados.dadosMigrados}\n`;
    relatorio += `- Erros: ${resultados.erros}\n\n`;
    relatorio += `## 📋 Detalhes por Tabela\n\n`;
    relatorio += `| Tabela | Criada | Registros | Erros | Status |\n`;
    relatorio += `|--------|--------|-----------|-------|--------|\n`;
    resultados.detalhes.forEach(d => {
      relatorio += `| ${d.tabela} | ${d.criada ? '✅' : '❌'} | ${d.registros} | ${d.erros} | ${d.status} |\n`;
    });
    
    fs.writeFileSync(relatorioPath, relatorio, 'utf8');
    console.log(`📄 Relatório salvo em: ${relatorioPath}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro geral na migração:', error.message);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

// Executar
executarMigracao().catch(console.error);
