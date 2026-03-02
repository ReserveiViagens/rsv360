/**
 * Migration: Create Website Pages Table
 * Purpose: CMS pages management (landing pages, tabs, etc.)
 * Author: RSV 360 Integration
 * Date: 2026-02-02
 */

exports.up = function (knex) {
  return knex.schema.createTable("website_pages", function (table) {
    table.increments("id").primary();
    table.string("slug", 255).unique().notNullable().comment("URL slug");
    table.string("title", 255).notNullable().comment("Page title");
    table.string("type", 50).defaultTo("page").comment("page, landing, tab");
    table.text("content").nullable().comment("HTML content");
    table.jsonb("images").defaultTo("[]").comment("Array of image URLs");
    table.jsonb("videos").defaultTo("[]").comment("Array of video URLs");
    table.jsonb("metadata").defaultTo("{}").comment("SEO meta, keywords, og_image");
    table.jsonb("navigation").defaultTo("{}").comment("show_in_menu, menu_order, etc.");
    table.string("status", 50).defaultTo("draft").comment("active, inactive, draft");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["slug"], "idx_website_pages_slug");
    table.index(["status"], "idx_website_pages_status");
    table.index(["type"], "idx_website_pages_type");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("website_pages");
};
