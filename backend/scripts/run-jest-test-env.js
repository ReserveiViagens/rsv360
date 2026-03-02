#!/usr/bin/env node

const { spawnSync } = require("child_process");
require("dotenv").config();

const rawArgs = process.argv.slice(2);
const enableTestLogs = rawArgs.includes("--test-logs");
const jestArgs = rawArgs.filter((arg) => arg !== "--test-logs");

process.env.NODE_ENV = "test";
process.env.DB_NAME = process.env.DB_NAME_TEST || process.env.DB_NAME || "onboarding_rsv_test";
process.env.DB_PORT = process.env.DB_PORT_TEST || process.env.DB_PORT || "5432";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_USER = process.env.DB_USER || "postgres";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "password";
if (enableTestLogs) {
  process.env.TEST_LOGS = "true";
}

const result = spawnSync(
  "npx",
  ["jest", ...jestArgs],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  }
);

if (result.error) {
  console.error("❌ Falha ao executar Jest:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
