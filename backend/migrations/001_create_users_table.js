/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("id").primary();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("name").notNullable();
    table.string("phone").nullable();
    table.string("avatar_url").nullable();
    table.enum("role", ["admin", "manager", "user", "guest"]).defaultTo("user");
    table
      .enum("status", ["active", "inactive", "pending", "suspended"])
      .defaultTo("active");
    table.string("department").nullable();
    table.string("position").nullable();
    table.date("birth_date").nullable();
    table.text("bio").nullable();
    table.json("preferences").nullable();
    table.json("permissions").nullable();
    table.string("timezone").defaultTo("America/Sao_Paulo");
    table.string("language").defaultTo("pt-BR");
    table.boolean("email_verified").defaultTo(false);
    table.string("email_verification_token").nullable();
    table.timestamp("email_verified_at").nullable();
    table.string("password_reset_token").nullable();
    table.timestamp("password_reset_expires").nullable();
    table.timestamp("last_login").nullable();
    table.string("last_login_ip").nullable();
    table.integer("login_attempts").defaultTo(0);
    table.timestamp("locked_until").nullable();
    table.boolean("two_factor_enabled").defaultTo(false);
    table.string("two_factor_secret").nullable();
    table.json("recovery_codes").nullable();
    table.timestamps(true, true);

    // Indexes
    table.index("email");
    table.index("role");
    table.index("status");
    table.index("department");
    table.index(["email", "status"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
