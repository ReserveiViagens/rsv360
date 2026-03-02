/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("payments", function (table) {
    table.increments("id").primary();
    table.integer("booking_id").unsigned().nullable();
    table.integer("user_id").unsigned().notNullable();
    table.string("transaction_id").notNullable().unique();
    table.string("external_transaction_id").nullable();
    table
      .enum("type", ["payment", "refund", "fee", "discount", "adjustment"])
      .defaultTo("payment");
    table
      .enum("method", [
        "credit_card",
        "debit_card",
        "bank_transfer",
        "pix",
        "cash",
        "voucher",
      ])
      .notNullable();
    table
      .enum("status", [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ])
      .defaultTo("pending");
    table.decimal("amount", 10, 2).notNullable();
    table.string("currency", 3).defaultTo("BRL");
    table.decimal("fee_amount", 10, 2).defaultTo(0);
    table.decimal("net_amount", 10, 2).notNullable();
    table.string("gateway_provider").nullable(); // stripe, pagseguro, mercadopago
    table.string("gateway_transaction_id").nullable();
    table.json("gateway_response").nullable();
    table.string("card_last_four").nullable();
    table.string("card_brand").nullable();
    table.integer("installments").defaultTo(1);
    table.text("description").nullable();
    table.timestamp("processed_at").nullable();
    table.timestamp("failed_at").nullable();
    table.text("failure_reason").nullable();
    table.string("receipt_url").nullable();
    table.json("metadata").nullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign("booking_id")
      .references("id")
      .inTable("bookings")
      .onDelete("SET NULL");
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Indexes
    table.index("transaction_id");
    table.index("external_transaction_id");
    table.index("booking_id");
    table.index("user_id");
    table.index("type");
    table.index("method");
    table.index("status");
    table.index("gateway_provider");
    table.index(["user_id", "status"]);
    table.index(["booking_id", "status"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("payments");
};
