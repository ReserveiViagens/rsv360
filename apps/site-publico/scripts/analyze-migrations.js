/**
 * Script para analisar migrations e identificar duplicações/conflitos
 * 
 * Execute: node scripts/analyze-migrations.js
 * 
 * Analisa todas as migrations SQL e identifica:
 * - Migrations duplicadas
 * - Conflitos de tabelas
 * - Ordem de execução
 */

const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname, '.');
const migrationFiles = fs.readdirSync(scriptsDir)
  .filter(f => f.startsWith('migration-') && f.endsWith('.sql'))
  .sort();

console.log('🔍 Analisando migrations...\n');
console.log(`📁 Total de migrations encontradas: ${migrationFiles.length}\n`);

// Analisar cada migration
const migrations = [];
const tableCreations = new Map(); // tabela -> [migrations que a criam]
const conflicts = [];

migrationFiles.forEach(file => {
  const filePath = path.join(scriptsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extrair número da migration
  const match = file.match(/migration-(\d+)/);
  const number = match ? parseInt(match[1]) : null;
  
  // Extrair tabelas criadas
  const createTableMatches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/gi);
  const tables = Array.from(createTableMatches, m => m[1].toLowerCase());
  
  // Extrair tabelas alteradas
  const alterTableMatches = content.matchAll(/ALTER TABLE (\w+)/gi);
  const alteredTables = Array.from(alterTableMatches, m => m[1].toLowerCase());
  
  // Extrair comentários/descrição
  const commentMatch = content.match(/--\s*(.+)/);
  const description = commentMatch ? commentMatch[1].trim() : '';
  
  migrations.push({
    file,
    number,
    tables,
    alteredTables,
    description,
    size: content.length,
  });
  
  // Registrar criação de tabelas
  tables.forEach(table => {
    if (!tableCreations.has(table)) {
      tableCreations.set(table, []);
    }
    tableCreations.get(table).push(file);
  });
});

// Identificar duplicações
console.log('📊 ANÁLISE DE MIGRATIONS\n');
console.log('='.repeat(60));

// 1. Migrations por número
const migrationsByNumber = new Map();
migrations.forEach(m => {
  if (m.number) {
    if (!migrationsByNumber.has(m.number)) {
      migrationsByNumber.set(m.number, []);
    }
    migrationsByNumber.get(m.number).push(m);
  }
});

// Verificar números duplicados
const duplicateNumbers = Array.from(migrationsByNumber.entries())
  .filter(([num, files]) => files.length > 1);

if (duplicateNumbers.length > 0) {
  console.log('\n⚠️  MIGRATIONS COM NÚMEROS DUPLICADOS:\n');
  duplicateNumbers.forEach(([num, files]) => {
    console.log(`   Número ${num}:`);
    files.forEach(f => {
      console.log(`     - ${f.file}`);
      if (f.description) {
        console.log(`       ${f.description.substring(0, 60)}...`);
      }
    });
    console.log('');
  });
} else {
  console.log('\n✅ Nenhum número de migration duplicado encontrado\n');
}

// 2. Tabelas criadas por múltiplas migrations
console.log('\n📋 TABELAS CRIADAS POR MÚLTIPLAS MIGRATIONS:\n');
let hasConflicts = false;

tableCreations.forEach((files, table) => {
  if (files.length > 1) {
    hasConflicts = true;
    console.log(`   ⚠️  ${table}:`);
    files.forEach(file => {
      const migration = migrations.find(m => m.file === file);
      console.log(`      - ${file}`);
      if (migration?.description) {
        console.log(`        ${migration.description.substring(0, 60)}...`);
      }
    });
    console.log('');
  }
});

if (!hasConflicts) {
  console.log('   ✅ Nenhuma tabela criada por múltiplas migrations\n');
}

// 3. Resumo por migration
console.log('\n📄 RESUMO POR MIGRATION:\n');
migrations.forEach(m => {
  console.log(`   ${m.file}:`);
  console.log(`      Número: ${m.number || 'N/A'}`);
  console.log(`      Tabelas criadas: ${m.tables.length}`);
  if (m.tables.length > 0) {
    console.log(`      ${m.tables.slice(0, 5).join(', ')}${m.tables.length > 5 ? '...' : ''}`);
  }
  console.log(`      Tabelas alteradas: ${m.alteredTables.length}`);
  if (m.description) {
    console.log(`      Descrição: ${m.description.substring(0, 60)}...`);
  }
  console.log('');
});

// 4. Recomendações
console.log('\n💡 RECOMENDAÇÕES:\n');

if (duplicateNumbers.length > 0) {
  console.log('   ⚠️  Renumerar migrations duplicadas para evitar conflitos');
}

if (hasConflicts) {
  console.log('   ⚠️  Verificar migrations que criam as mesmas tabelas');
  console.log('   ⚠️  Considerar consolidar migrations conflitantes');
}

// Verificar ordem
const sortedNumbers = migrations
  .filter(m => m.number !== null)
  .map(m => m.number)
  .sort((a, b) => a - b);

const gaps = [];
for (let i = 0; i < sortedNumbers.length - 1; i++) {
  if (sortedNumbers[i + 1] - sortedNumbers[i] > 1) {
    gaps.push({
      from: sortedNumbers[i],
      to: sortedNumbers[i + 1],
    });
  }
}

if (gaps.length > 0) {
  console.log('   ⚠️  Há lacunas na numeração das migrations:');
  gaps.forEach(gap => {
    console.log(`      Entre ${gap.from} e ${gap.to}`);
  });
} else {
  console.log('   ✅ Numeração das migrations está sequencial');
}

console.log('\n' + '='.repeat(60));
console.log(`\n✅ Análise concluída!`);
console.log(`   Total de migrations: ${migrationFiles.length}`);
console.log(`   Tabelas únicas criadas: ${tableCreations.size}`);
console.log(`   Conflitos encontrados: ${duplicateNumbers.length + (hasConflicts ? 1 : 0)}\n`);

