exports.up = function (knex) {
  return knex.schema.createTable("travel_packages", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("slug").unique();
    table.text("description");
    table.text("short_description");
    table.string("destination").notNullable(); // Caldas Novas, Rio Quente, etc.
    table.string("category").defaultTo("package"); // package, hotel, flight, tour, activity
    table.integer("duration_days").notNullable(); // Duration in days
    table.integer("duration_nights"); // Duration in nights
    table.decimal("base_price", 10, 2).notNullable();
    table.decimal("adult_price", 10, 2);
    table.decimal("child_price", 10, 2);
    table.decimal("infant_price", 10, 2).defaultTo(0);
    table.string("currency").defaultTo("BRL");
    table.integer("min_people").defaultTo(1);
    table.integer("max_people").defaultTo(10);
    table.integer("min_age");
    table.integer("max_age");
    table
      .enum("difficulty_level", ["easy", "moderate", "challenging", "extreme"])
      .defaultTo("easy");
    table
      .enum("status", ["active", "inactive", "draft", "sold_out"])
      .defaultTo("active");
    table.boolean("is_featured").defaultTo(false);
    table.boolean("is_weekend_special").defaultTo(false);
    table.boolean("is_holiday_special").defaultTo(false);
    table.text("included_services"); // JSON array of included services
    table.text("excluded_services"); // JSON array of excluded services
    table.text("itinerary"); // JSON object with day-by-day itinerary
    table.text("requirements"); // JSON array of requirements
    table.text("recommendations"); // JSON array of recommendations
    table.string("hotel_name");
    table.integer("hotel_stars");
    table.string("hotel_address");
    table.text("hotel_amenities"); // JSON array
    table.string("departure_location");
    table.string("departure_time");
    table.string("return_time");
    table.boolean("transportation_included").defaultTo(false);
    table.string("transportation_type"); // bus, van, car, flight
    table.boolean("meals_included").defaultTo(false);
    table.text("meal_plan"); // breakfast, lunch, dinner, all_inclusive
    table.boolean("tour_guide_included").defaultTo(false);
    table.string("guide_language").defaultTo("Portuguese");
    table.text("cancellation_policy");
    table.integer("advance_booking_days").defaultTo(3); // Minimum days in advance
    table.text("seasonal_pricing"); // JSON object with seasonal prices
    table.text("availability_calendar"); // JSON object with available dates
    table.integer("total_bookings").defaultTo(0);
    table.decimal("average_rating", 3, 2).defaultTo(0);
    table.integer("total_reviews").defaultTo(0);
    table.text("gallery_images"); // JSON array of image URLs
    table.text("gallery_videos"); // JSON array of video URLs
    table.text("tags"); // JSON array of tags
    table.text("seo_title");
    table.text("seo_description");
    table.text("seo_keywords");
    table.integer("created_by").unsigned().references("id").inTable("users");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Indexes
    table.index("slug");
    table.index("destination");
    table.index("category");
    table.index("status");
    table.index("is_featured");
    table.index("base_price");
    table.index("duration_days");
    table.index("average_rating");
    table.index("created_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("travel_packages");
};
