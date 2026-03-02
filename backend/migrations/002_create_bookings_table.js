/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("bookings", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.string("booking_number").notNullable().unique();
    table.string("title").notNullable();
    table.text("description").nullable();
    table
      .enum("type", ["hotel", "flight", "car", "tour", "package", "activity"])
      .notNullable();
    table
      .enum("status", [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "refunded",
      ])
      .defaultTo("pending");
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
    table.time("start_time").nullable();
    table.time("end_time").nullable();
    table.decimal("total_amount", 10, 2).defaultTo(0);
    table.string("currency", 3).defaultTo("BRL");
    table.decimal("paid_amount", 10, 2).defaultTo(0);
    table.decimal("pending_amount", 10, 2).defaultTo(0);
    table
      .enum("payment_status", [
        "pending",
        "partial",
        "paid",
        "refunded",
        "failed",
      ])
      .defaultTo("pending");
    table.integer("guests_count").defaultTo(1);
    table.integer("adults_count").defaultTo(1);
    table.integer("children_count").defaultTo(0);
    table.json("guest_details").nullable();
    table.json("special_requests").nullable();
    table.string("confirmation_code").nullable();
    table.string("external_booking_id").nullable();
    table.string("provider_name").nullable();
    table.json("provider_data").nullable();
    table.text("cancellation_policy").nullable();
    table.timestamp("cancellation_deadline").nullable();
    table.decimal("cancellation_fee", 10, 2).defaultTo(0);
    table.text("notes").nullable();
    table.json("metadata").nullable();
    table.string("created_by").nullable();
    table.string("updated_by").nullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Indexes
    table.index("booking_number");
    table.index("user_id");
    table.index("type");
    table.index("status");
    table.index("payment_status");
    table.index("start_date");
    table.index("end_date");
    table.index(["user_id", "status"]);
    table.index(["start_date", "end_date"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("bookings");
};
