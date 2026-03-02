// Script Node.js para criar tabela user_profiles
// Sistema RSV 360 - Perfil de Usuario Completo

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuracoes do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

async function executeSQLScript() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('========================================');
    console.log('CRIAR TABELA USER_PROFILES');
    console.log('========================================');
    console.log('');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'create-user-profiles-table.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error('ERRO: Arquivo SQL nao encontrado em:', sqlPath);
      process.exit(1);
    }

    console.log('Arquivo SQL:', sqlPath);
    console.log('Conectando ao banco:', dbConfig.database);
    console.log('');

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Executar o SQL completo
    console.log('Executando script SQL...');
    console.log('');

    try {
      await pool.query(sqlContent);
      console.log('Script SQL executado com sucesso!');
    } catch (error) {
      // Ignorar erros de "já existe" para CREATE TABLE IF NOT EXISTS
      if (error.message && (
        error.message.includes('already exists') ||
        error.message.includes('duplicate')
      )) {
        console.log('Alguns objetos ja existem, continuando...');
      } else {
        throw error;
      }
    }

    console.log('');
    console.log('Verificando tabela criada...');
    console.log('');

    // Verificar se a tabela foi criada
    const checkResult = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles'"
    );

    if (checkResult.rows && checkResult.rows.length > 0) {
      console.log('Tabela user_profiles encontrada!');
      console.log('');

      // Verificar estrutura
      const columns = await pool.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = 'user_profiles'
         ORDER BY ordinal_position`
      );

      console.log('Estrutura da tabela user_profiles:');
      console.log('Total de colunas:', columns.rows.length);
      console.log('');
      console.log('Primeiras 15 colunas:');
      columns.rows.slice(0, 15).forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  - ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
      });
      if (columns.rows.length > 15) {
        console.log(`  ... e mais ${columns.rows.length - 15} colunas`);
      }
      console.log('');

      console.log('Tabela user_profiles criada com sucesso!');
    } else {
      console.log('AVISO: Tabela nao encontrada apos execucao do script');
    }

    console.log('');
    console.log('Pronto! A tabela user_profiles esta criada.');
    console.log('');
    console.log('Proximos passos:');
    console.log('1. Atualizar APIs para usar os novos campos');
    console.log('2. Atualizar interface de perfil do usuario');
    console.log('3. Criar formulario de edicao de perfil completo');
    console.log('');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('ERRO ao executar script SQL:');
    console.error(error.message);
    console.error('');
    console.error('Dicas:');
    console.error('  - Verifique se o PostgreSQL esta rodando');
    console.error('  - Verifique as credenciais do banco no .env.local');
    console.error('  - Verifique se o banco existe');
    console.error('  - Verifique se a tabela users existe (e necessaria para a FK)');
    await pool.end();
    process.exit(1);
  }
}

// Executar
executeSQLScript();
