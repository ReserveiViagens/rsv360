#!/usr/bin/env node
/**
 * Garante que a tabela website_pages existe no banco.
 * Usado pelo Iniciar Sistema Completo.ps1 antes de iniciar os servicos.
 */
const path = require('path');
const backendPath = path.join(__dirname, '..', 'backend');
require('dotenv').config({ path: path.join(backendPath, '.env') });
process.chdir(backendPath); // knexfile usa paths relativos ao backend
const knex = require('knex');
const knexConfig = require(path.join(backendPath, 'knexfile'));

const env = process.env.NODE_ENV || 'development';
const config = knexConfig[env];

async function main() {
  const db = knex(config);
  try {
    const hasTable = await db.schema.hasTable('website_pages');
    if (!hasTable) {
      await db.schema.createTable('website_pages', (table) => {
        table.increments('id').primary();
        table.string('slug', 255).unique().notNullable();
        table.string('title', 255).notNullable();
        table.string('type', 50).defaultTo('page');
        table.text('content').nullable();
        table.jsonb('images').defaultTo('[]');
        table.jsonb('videos').defaultTo('[]');
        table.jsonb('metadata').defaultTo('{}');
        table.jsonb('navigation').defaultTo('{}');
        table.string('status', 50).defaultTo('draft');
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('OK: Tabela website_pages criada');
    } else {
      console.log('OK: Tabela website_pages ja existe');
    }
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

main();
