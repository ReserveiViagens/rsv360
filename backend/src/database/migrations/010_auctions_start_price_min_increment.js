/**
 * Migration: Garantir colunas start_price e min_increment na tabela auctions.
 * Para bancos criados com schema antigo (starting_price em vez de start_price).
 */

exports.up = async function (knex) {
  const hasAuctions = await knex.schema.hasTable('auctions');
  if (!hasAuctions) return;

  const hasStartPrice = await knex.schema.hasColumn('auctions', 'start_price');
  const hasStartingPrice = await knex.schema.hasColumn('auctions', 'starting_price');
  const hasMinIncrement = await knex.schema.hasColumn('auctions', 'min_increment');

  // Se tem starting_price mas não start_price: adicionar start_price e copiar dados, depois remover starting_price
  if (hasStartingPrice && !hasStartPrice) {
    await knex.schema.alterTable('auctions', (table) => {
      table.decimal('start_price', 12, 2).nullable();
    });
    await knex.raw(`UPDATE auctions SET start_price = COALESCE(starting_price, current_price, 0)`);
    await knex.raw(`ALTER TABLE auctions ALTER COLUMN start_price SET NOT NULL`);
    await knex.schema.alterTable('auctions', (table) => {
      table.dropColumn('starting_price');
    });
  }

  // Adicionar min_increment se não existir
  if (!hasMinIncrement) {
    await knex.schema.alterTable('auctions', (table) => {
      table.decimal('min_increment', 12, 2).defaultTo(10);
    });
  }
};

exports.down = async function (knex) {
  // Reverter é complexo - não implementado (migration one-way)
};
