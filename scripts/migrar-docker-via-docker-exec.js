/**
 * Script para migrar tabelas do Docker usando docker exec
 * Mais confiável quando há problemas de conexão direta
 */

const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONTAINER_NAME = 'postgres-rsv360';
const SOURCE_DB = 'rsv_360_ecosystem';
const TARGET_CONFIG = {
  host: 'localhost',
  port: 5433,
  database: 'rsv360',
  user: 'postgres',
  password: '290491Bb',
};

// Lista de tabelas do Docker
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

async function executarComandoDocker(comando) {
  try {
    const resultado = execSync(
      `docker exec ${CONTAINER_NAME} ${comando}`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    return { sucesso: true, resultado };
  } catch (error) {
    return { sucesso: false, erro: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

async function obterEstruturaTabelaViaDocker(tableName) {
  const comando = `psql -U postgres -d ${SOURCE_DB} -c "\\d ${tableName}"`;
  const resultado = await executarComandoDocker(comando);
  
  if (!resultado.sucesso) {
    return null;
  }
  
  // Obter estrutura via SQL
  const sqlComando = `psql -U postgres -d ${SOURCE_DB} -t -c "
    SELECT 
      column_name,
      data_type,
      udt_name,
      character_maximum_length,
      numeric_precision,
      numeric_scale,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = '${tableName}'
    ORDER BY ordinal_position;
  "`;
  
  const sqlResult = await executarComandoDocker(sqlComando);
  return sqlResult;
}

async function gerarSQLCriacaoViaDocker(tableName) {
  // Usar pg_dump para obter a estrutura
  const comando = `pg_dump -U postgres -d ${SOURCE_DB} -t ${tableName} --schema-only --no-owner --no-acl`;
  const resultado = await executarComandoDocker(comando);
  
  if (!resultado.sucesso) {
    return null;
  }
  
  // Extrair apenas a parte CREATE TABLE
  const sql = resultado.resultado;
  const createTableMatch = sql.match(/CREATE TABLE[^;]+;/s);
  
  if (createTableMatch) {
    return createTableMatch[0];
  }
  
  return null;
}

async function migrarDadosViaDocker(targetPool, tableName) {
  // Exportar dados do Docker
  const exportComando = `pg_dump -U postgres -d ${SOURCE_DB} -t ${tableName} --data-only --column-inserts --no-owner --no-acl`;
  const exportResult = await executarComandoDocker(exportComando);
  
  if (!exportResult.sucesso) {
    return { inserted: 0, errors: 1, message: exportResult.erro };
  }
  
  // Verificar se há dados
  if (!exportResult.resultado.includes('INSERT INTO')) {
    return { inserted: 0, errors: 0, message: 'Tabela vazia' };
  }
  
  // Verificar se já existem dados no destino
  const countTarget = await targetPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
  const existingCount = parseInt(countTarget.rows[0].count);
  
  if (existingCount > 0) {
    return { inserted: 0, errors: 0, message: `Já possui ${existingCount} registros` };
  }
  
  // Executar INSERTs no destino
  const insertStatements = exportResult.resultado.match(/INSERT INTO[^;]+;/g) || [];
  
  let inserted = 0;
  let errors = 0;
  
  for (const insert of insertStatements) {
    try {
      await targetPool.query(insert);
      inserted++;
    } catch (error) {
      errors++;
      if (errors <= 3) {
        console.error(`    ⚠️  Erro: ${error.message.substring(0, 100)}`);
      }
    }
  }
  
  return { inserted, errors, message: 'OK' };
}

async function compararTabelas() {
  console.log('');
  console.log('========================================');
  console.log('COMPARAÇÃO DE TABELAS');
  console.log('========================================');
  console.log('');
  
  // Listar tabelas no Docker
  const dockerTablesResult = await executarComandoDocker(
    `psql -U postgres -d ${SOURCE_DB} -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"`
  );
  
  const dockerTables = dockerTablesResult.sucesso 
    ? dockerTablesResult.resultado.split('\n').map(t => t.trim()).filter(t => t)
    : [];
  
  // Listar tabelas no destino
  const targetPool = new Pool(TARGET_CONFIG);
  const targetTablesResult = await targetPool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  await targetPool.end();
  
  const targetTables = targetTablesResult.rows.map(r => r.table_name);
  
  const dockerSet = new Set(dockerTables);
  const targetSet = new Set(targetTables);
  
  const faltam = dockerTables.filter(t => !targetSet.has(t));
  const existem = dockerTables.filter(t => targetSet.has(t));
  const extras = targetTables.filter(t => !dockerSet.has(t));
  
  console.log(`📊 Tabelas no Docker (porta 5432): ${dockerTables.length}`);
  console.log(`📊 Tabelas no PostgreSQL (porta 5433): ${targetTables.length}`);
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
  
  return { faltam, existem, extras, dockerTables };
}

async function executarMigracao() {
  console.log('');
  console.log('========================================');
  console.log('MIGRAÇÃO DOCKER → PORTA 5433');
  console.log('(Usando docker exec)');
  console.log('========================================');
  console.log('');
  
  // Verificar container
  console.log('1. Verificando container Docker...');
  try {
    const containerCheck = execSync(`docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}"`, { encoding: 'utf8' });
    if (!containerCheck.trim()) {
      console.log('  ❌ Container não está rodando!');
      return;
    }
    console.log(`  ✅ Container encontrado: ${containerCheck.trim()}`);
  } catch (error) {
    console.log('  ❌ Erro ao verificar container:', error.message);
    return;
  }
  console.log('');
  
  // Comparar tabelas
  console.log('2. Comparando tabelas...');
  const comparacao = await compararTabelas();
  
  if (comparacao.faltam.length === 0 && comparacao.dockerTables.length > 0) {
    console.log('  ✅ Todas as tabelas já existem no destino!');
    console.log('  💡 Executando migração de dados apenas...');
    console.log('');
  }
  
  const targetPool = new Pool(TARGET_CONFIG);
  const resultados = {
    criadas: 0,
    dadosMigrados: 0,
    erros: 0,
    detalhes: [],
  };
  
  try {
    console.log('3. Executando migração...');
    console.log('');
    
    for (const tableName of comparacao.dockerTables) {
      console.log(`📋 Migrando: ${tableName}...`);
      
      try {
        // Verificar se precisa criar
        const existe = comparacao.existem.includes(tableName) || 
                      (await targetPool.query(`
                        SELECT EXISTS (
                          SELECT FROM information_schema.tables 
                          WHERE table_schema = 'public' 
                          AND table_name = $1
                        );
                      `, [tableName])).rows[0].exists;
        
        if (!existe) {
          console.log(`  📋 Criando estrutura...`);
          
          // Usar pg_dump para obter estrutura completa
          const dumpComando = `pg_dump -U postgres -d ${SOURCE_DB} -t ${tableName} --schema-only --no-owner --no-acl`;
          const dumpResult = await executarComandoDocker(dumpComando);
          
          if (dumpResult.sucesso) {
            // Extrair CREATE TABLE e ALTER TABLE
            const sql = dumpResult.resultado;
            const createMatch = sql.match(/CREATE TABLE[^;]+;/s);
            const alterMatches = sql.match(/ALTER TABLE[^;]+;/g) || [];
            
            if (createMatch) {
              try {
                await targetPool.query(createMatch[0]);
                
                // Executar ALTER TABLE statements
                for (const alter of alterMatches) {
                  try {
                    await targetPool.query(alter.replace(/ALTER TABLE\s+public\./g, 'ALTER TABLE "'));
                  } catch (e) {
                    // Ignorar erros de constraints duplicadas
                  }
                }
                
                console.log(`  ✅ Estrutura criada`);
                resultados.criadas++;
              } catch (error) {
                console.log(`  ⚠️  Erro ao criar: ${error.message.substring(0, 100)}`);
                resultados.erros++;
                continue;
              }
            } else {
              console.log(`  ⚠️  Não foi possível extrair CREATE TABLE`);
              resultados.erros++;
              continue;
            }
          } else {
            console.log(`  ⚠️  Erro ao obter estrutura: ${dumpResult.erro}`);
            resultados.erros++;
            continue;
          }
        } else {
          console.log(`  ℹ️  Tabela já existe`);
        }
        
        // Migrar dados
        console.log(`  📦 Migrando dados...`);
        const dados = await migrarDadosViaDocker(targetPool, tableName);
        
        if (dados.message === 'OK') {
          console.log(`  ✅ ${dados.inserted} registros inseridos`);
          if (dados.errors > 0) {
            console.log(`  ⚠️  ${dados.errors} erros`);
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
        console.error(`  ❌ Erro: ${error.message}`);
        resultados.erros++;
        resultados.detalhes.push({
          tabela: tableName,
          criada: false,
          registros: 0,
          erros: 1,
          status: error.message.substring(0, 50),
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
    
  } finally {
    await targetPool.end();
  }
}

executarMigracao().catch(console.error);
