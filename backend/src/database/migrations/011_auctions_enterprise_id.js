/**
 * Migration: Adicionar enterprise_id à tabela auctions se não existir.
 */

exports.up = async function (knex) {
  const hasAuctions = await knex.schema.hasTable('auctions');
  if (!hasAuctions) return;

  const hasEnterpriseId = await knex.schema.hasColumn('auctions', 'enterprise_id');
  if (!hasEnterpriseId) {
    await knex.schema.alterTable('auctions', (table) => {
      table.integer('enterprise_id').unsigned().nullable().references('id').inTable('enterprises').onDelete('SET NULL');
    });
  }
};

exports.down = async function (knex) {
  const hasEnterpriseId = await knex.schema.hasColumn('auctions', 'enterprise_id');
  if (hasEnterpriseId) {
    await knex.schema.alterTable('auctions', (table) => {
      table.dropColumn('enterprise_id');
    });
  }
};
