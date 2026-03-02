/**
 * Migration: Create auctions, bids, enterprises, properties, accommodations tables
 * Required for /api/v1/auctions endpoints
 */

exports.up = async function (knex) {
  // enterprises (se não existir)
  const hasEnterprises = await knex.schema.hasTable('enterprises');
  if (!hasEnterprises) {
    await knex.schema.createTable('enterprises', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('address_city', 100).nullable();
      table.string('address_state', 50).nullable();
      table.decimal('latitude', 10, 7).nullable();
      table.decimal('longitude', 10, 7).nullable();
      table.timestamps(true, true);
    });
  }

  // properties (se não existir)
  const hasProperties = await knex.schema.hasTable('properties');
  if (!hasProperties) {
    await knex.schema.createTable('properties', (table) => {
      table.increments('id').primary();
      table.integer('enterprise_id').unsigned().nullable().references('id').inTable('enterprises').onDelete('SET NULL');
      table.string('name', 255).notNullable();
      table.timestamps(true, true);
    });
  }

  // accommodations (se não existir)
  const hasAccommodations = await knex.schema.hasTable('accommodations');
  if (!hasAccommodations) {
    await knex.schema.createTable('accommodations', (table) => {
      table.increments('id').primary();
      table.integer('property_id').unsigned().nullable().references('id').inTable('properties').onDelete('SET NULL');
      table.string('name', 255).notNullable();
      table.integer('max_guests').nullable();
      table.jsonb('images').nullable();
      table.timestamps(true, true);
    });
  }

  // auctions (criar ou alterar)
  const hasAuctions = await knex.schema.hasTable('auctions');
  if (!hasAuctions) {
    await knex.schema.createTable('auctions', (table) => {
      table.increments('id').primary();
      table.integer('enterprise_id').unsigned().nullable().references('id').inTable('enterprises').onDelete('SET NULL');
      table.integer('property_id').unsigned().nullable().references('id').inTable('properties').onDelete('SET NULL');
      table.integer('accommodation_id').unsigned().nullable().references('id').inTable('accommodations').onDelete('SET NULL');
      table.string('title', 255).notNullable();
      table.text('description').nullable();
      table.decimal('start_price', 12, 2).notNullable();
      table.decimal('current_price', 12, 2).notNullable();
      table.decimal('min_increment', 12, 2).defaultTo(10);
      table.decimal('reserve_price', 12, 2).nullable();
      table.timestamp('start_date').notNullable();
      table.timestamp('end_date').notNullable();
      table.enum('status', ['scheduled', 'active', 'finished', 'cancelled']).defaultTo('scheduled');
      table.integer('winner_id').nullable();
      table.integer('winner_bid_id').nullable();
      table.integer('created_by').nullable();
      table.timestamps(true, true);
    });
  } else {
    // Adicionar enterprise_id se não existir
    const hasEnterpriseId = await knex.schema.hasColumn('auctions', 'enterprise_id');
    if (!hasEnterpriseId) {
      await knex.schema.alterTable('auctions', (table) => {
        table.integer('enterprise_id').unsigned().nullable().references('id').inTable('enterprises').onDelete('SET NULL');
      });
    }
  }

  // bids (se não existir)
  const hasBids = await knex.schema.hasTable('bids');
  if (!hasBids) {
    await knex.schema.createTable('bids', (table) => {
      table.increments('id').primary();
      table.integer('auction_id').unsigned().notNullable().references('id').inTable('auctions').onDelete('CASCADE');
      table.integer('customer_id').unsigned().nullable();
      table.decimal('amount', 12, 2).notNullable();
      table.enum('status', ['pending', 'accepted', 'rejected', 'outbid']).defaultTo('pending');
      table.timestamps(true, true);
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('bids');
  await knex.schema.dropTableIfExists('auctions');
  await knex.schema.dropTableIfExists('accommodations');
  await knex.schema.dropTableIfExists('properties');
  await knex.schema.dropTableIfExists('enterprises');
};
