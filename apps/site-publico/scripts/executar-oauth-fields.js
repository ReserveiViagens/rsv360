require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

const pool = new Pool(dbConfig);

async function executeSQLScript() {
  console.log("========================================");
  console.log("ADICIONANDO CAMPOS OAUTH À TABELA USERS");
  console.log("========================================");
  console.log("");

  try {
    const sqlPath = path.join(__dirname, 'add-oauth-fields-to-users.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log("1. Executando script SQL...");
    await pool.query(sql);
    console.log("✅ Script executado com sucesso!");
    console.log("");

    console.log("2. Verificando colunas adicionadas...");
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('oauth_provider', 'oauth_id', 'oauth_email')
      ORDER BY column_name
    `);

    if (result.rows.length > 0) {
      console.log("✅ Colunas OAuth encontradas:");
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    } else {
      console.log("⚠️  Colunas OAuth não encontradas. Verifique se a tabela users existe.");
    }
    console.log("");

    console.log("3. Verificando índices...");
    const indexes = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'users'
      AND indexname IN ('idx_users_oauth', 'idx_users_oauth_email')
    `);

    if (indexes.rows.length > 0) {
      console.log("✅ Índices encontrados:");
      indexes.rows.forEach(row => {
        console.log(`   - ${row.indexname}`);
      });
    }
    console.log("");

    console.log("========================================");
    console.log("CONCLUÍDO COM SUCESSO!");
    console.log("========================================");

  } catch (error) {
    console.error("❌ Erro ao executar script:", error.message);
    if (error.code === '42P01') {
      console.error("   A tabela 'users' não existe. Crie a tabela primeiro.");
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

executeSQLScript();

