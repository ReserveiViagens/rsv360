exports.up = function (knex) {
  return knex.schema.createTable("customers", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").unique().notNullable();
    table.string("phone");
    table.string("document"); // CPF/CNPJ
    table.string("document_type").defaultTo("cpf"); // cpf, cnpj, passport
    table.date("birth_date");
    table.enum("gender", ["M", "F", "Other"]);
    table.string("address");
    table.string("city");
    table.string("state");
    table.string("zip_code");
    table.string("country").defaultTo("Brasil");
    table.enum("status", ["active", "inactive", "blocked"]).defaultTo("active");
    table.enum("type", ["individual", "corporate"]).defaultTo("individual");
    table.string("company_name"); // For corporate customers
    table.text("notes");
    table.string("preferred_contact").defaultTo("email"); // email, phone, whatsapp
    table.boolean("marketing_consent").defaultTo(false);
    table.integer("total_bookings").defaultTo(0);
    table.decimal("total_spent", 10, 2).defaultTo(0);
    table.decimal("average_booking_value", 10, 2).defaultTo(0);
    table.date("last_booking_date");
    table.date("first_booking_date");
    table
      .enum("vip_level", ["none", "bronze", "silver", "gold", "platinum"])
      .defaultTo("none");
    table.text("travel_preferences"); // JSON string
    table.text("emergency_contact"); // JSON string
    table.string("avatar_url");
    table.integer("referral_source_id"); // Reference to how they found us
    table.string("referral_code"); // Unique code for referrals
    table.integer("created_by").unsigned().references("id").inTable("users");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Indexes
    table.index("email");
    table.index("phone");
    table.index("document");
    table.index("status");
    table.index("type");
    table.index("vip_level");
    table.index("created_at");
    table.index("last_booking_date");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("customers");
};
