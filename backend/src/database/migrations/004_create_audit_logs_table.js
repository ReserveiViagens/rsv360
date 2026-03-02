/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("audit_logs", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned().nullable();
    table.string("action").notNullable(); // login, logout, password_change, 2fa_enable, etc.
    table.string("entity_type").nullable(); // user, booking, payment, etc.
    table.integer("entity_id").nullable();
    table.string("ip_address").nullable();
    table.string("user_agent").nullable();
    table.json("metadata").nullable(); // Additional context data
    table
      .enum("severity", ["low", "medium", "high", "critical"])
      .defaultTo("low");
    table.boolean("success").defaultTo(true);
    table.text("failure_reason").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Foreign keys
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    // Indexes
    table.index("user_id");
    table.index("action");
    table.index("entity_type");
    table.index("entity_id");
    table.index("ip_address");
    table.index("success");
    table.index("severity");
    table.index("created_at");
    table.index(["user_id", "action"]);
    table.index(["action", "created_at"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("audit_logs");
};
