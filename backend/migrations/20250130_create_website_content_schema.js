/**
 * Migration: Create Website Content Schema
 * Purpose: Tables for managing dynamic website content (hotels, promotions, attractions, etc.)
 * Author: RSV 360 Integration
 * Date: 2025-01-30
 */

exports.up = function (knex) {
  return Promise.all([
    // 1. Create website_content table
    knex.schema.createTable("website_content", function (table) {
      table.increments("id").primary();
      table
        .string("page_type", 50)
        .notNullable()
        .comment("Type: hotels, promotions, attractions, tickets, etc.");
      table
        .string("content_id", 100)
        .notNullable()
        .comment("Unique identifier for content item");
      table
        .string("title", 255)
        .notNullable()
        .comment("Display title of the content");
      table
        .text("description")
        .nullable()
        .comment("Content description/summary");
      table.jsonb("images").nullable().comment("Array of image URLs");
      table
        .jsonb("metadata")
        .nullable()
        .comment("Type-specific data (price, features, etc.)");
      table
        .jsonb("seo_data")
        .nullable()
        .comment("SEO meta tags, keywords, descriptions");
      table
        .enum("status", ["active", "inactive", "draft"])
        .defaultTo("active")
        .comment("Content status");
      table.integer("order_index").defaultTo(0).comment("Display order");
      table.timestamps(true, true); // created_at, updated_at
      table
        .integer("created_by")
        .nullable()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table
        .integer("updated_by")
        .nullable()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");

      // Indexes for performance
      table.index(["page_type"], "idx_website_content_page_type");
      table.index(["status"], "idx_website_content_status");
      table.index(["order_index"], "idx_website_content_order");
      table.index(["page_type", "status"], "idx_website_content_page_status");
      table.unique(
        ["page_type", "content_id"],
        "unq_website_content_page_content",
      );
    }),

    // 2. Create website_settings table
    knex.schema.createTable("website_settings", function (table) {
      table.increments("id").primary();
      table
        .string("setting_key", 100)
        .unique()
        .notNullable()
        .comment("Setting identifier");
      table.jsonb("setting_value").notNullable().comment("Setting data (JSON)");
      table.text("description").nullable().comment("Setting description");
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table
        .integer("updated_by")
        .nullable()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");

      // Index for fast lookups
      table.index(["setting_key"], "idx_website_settings_key");
    }),

    // 3. Create website_content_history table for audit trail
    knex.schema.createTable("website_content_history", function (table) {
      table.increments("id").primary();
      table
        .integer("content_id")
        .notNullable()
        .references("id")
        .inTable("website_content")
        .onDelete("CASCADE");
      table.enum("action", ["created", "updated", "deleted"]).notNullable();
      table.jsonb("old_data").nullable().comment("Previous content data");
      table.jsonb("new_data").nullable().comment("New content data");
      table.text("change_summary").nullable().comment("Summary of changes");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table
        .integer("created_by")
        .nullable()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");

      // Index for audit queries
      table.index(["content_id"], "idx_content_history_content");
      table.index(["created_at"], "idx_content_history_date");
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists("website_content_history"),
    knex.schema.dropTableIfExists("website_settings"),
    knex.schema.dropTableIfExists("website_content"),
  ]);
};

exports.config = {
  transaction: true,
};
