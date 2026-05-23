const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./schema/index');
const { requireDatabaseUrl } = require('./connection');
require('dotenv').config();

const pool = new Pool({ connectionString: requireDatabaseUrl() });
const db = drizzle(pool, { schema });

module.exports = { db };
