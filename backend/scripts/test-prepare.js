#!/usr/bin/env node

require("dotenv").config();

const { Client } = require("pg");
const knex = require("knex");
const knexConfig = require("../knexfile");

const TEST_ENV = "test";
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || 5432);
const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "password";
const dbNameTest = process.env.DB_NAME_TEST || "onboarding_rsv_test";

async function ensureTestDatabaseExists() {
  const adminClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: "postgres",
  });

  await adminClient.connect();
  try {
    const check = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbNameTest]
    );

    if (check.rows.length === 0) {
      await adminClient.query(`CREATE DATABASE "${dbNameTest}"`);
      console.log(`✅ Banco de teste criado: ${dbNameTest}`);
    } else {
      console.log(`ℹ️ Banco de teste já existe: ${dbNameTest}`);
    }
  } finally {
    await adminClient.end();
  }
}

async function runTestMigrations() {
  const testConfig = {
    ...knexConfig[TEST_ENV],
    connection: {
      ...knexConfig[TEST_ENV].connection,
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbNameTest,
    },
  };

  const db = knex(testConfig);
  try {
    const [, migrations] = await db.migrate.latest();
    if (migrations.length === 0) {
      console.log("ℹ️ Migrations de teste já estavam atualizadas.");
    } else {
      console.log(`✅ Migrations aplicadas (${migrations.length}):`);
      migrations.forEach((name) => console.log(`   - ${name}`));
    }
  } finally {
    await db.destroy();
  }
}

async function main() {
  process.env.NODE_ENV = TEST_ENV;
  console.log("🔧 Preparando ambiente de testes...");
  console.log(`   host=${dbHost} port=${dbPort} db=${dbNameTest} user=${dbUser}`);

  await ensureTestDatabaseExists();
  await runTestMigrations();

  console.log("🎉 Ambiente de testes pronto.");
}

main().catch((error) => {
  console.error("❌ Falha ao preparar ambiente de testes:", error.message);
  process.exit(1);
});
