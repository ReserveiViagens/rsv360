#!/usr/bin/env node

const { Client } = require("pg");
const knex = require("knex");
const knexConfig = require("../knexfile");
require("dotenv").config();

const logger = require("../src/utils/logger");

const dbName = process.env.DB_NAME || "onboarding_rsv";
const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "290491Bb";
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || 5432;

// Create database if it doesn't exist
const createDatabase = async () => {
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: "postgres", // Connect to default database first
  });

  try {
    await client.connect();

    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );

    if (result.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE "${dbName}"`);
      logger.info(`✅ Database '${dbName}' created successfully`);
    } else {
      logger.info(`📍 Database '${dbName}' already exists`);
    }

    await client.end();
  } catch (error) {
    logger.error("❌ Error creating database:", error.message);
    await client.end();
    throw error;
  }
};

// Run migrations
const runMigrations = async () => {
  const environment = process.env.NODE_ENV || "development";
  const config = knexConfig[environment];
  const db = knex(config);

  try {
    logger.info("🔄 Running database migrations...");

    const [batchNo, log] = await db.migrate.latest();

    if (log.length === 0) {
      logger.info("📍 Database is already up to date");
    } else {
      logger.info(`✅ Ran ${log.length} migrations:`);
      log.forEach((migration) => {
        logger.info(`   - ${migration}`);
      });
    }

    await db.destroy();
  } catch (error) {
    logger.error("❌ Error running migrations:", error.message);
    await db.destroy();
    throw error;
  }
};

// Create admin user
const createAdminUser = async () => {
  const environment = process.env.NODE_ENV || "development";
  const config = knexConfig[environment];
  const db = knex(config);

  try {
    // Check if admin user exists
    const existingAdmin = await db("users")
      .where({ email: "admin@onboardingrsv.com" })
      .first();

    if (existingAdmin) {
      logger.info("📍 Admin user already exists");
      await db.destroy();
      return;
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    await db("users").insert({
      name: "Administrator",
      email: "admin@onboardingrsv.com",
      password_hash: passwordHash,
      role: "admin",
      status: "active",
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    logger.info("✅ Admin user created successfully");
    logger.info("📧 Email: admin@onboardingrsv.com");
    logger.info(`🔑 Password: ${adminPassword}`);
    logger.warn("⚠️  Please change the admin password after first login!");

    await db.destroy();
  } catch (error) {
    logger.error("❌ Error creating admin user:", error.message);
    await db.destroy();
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  const environment = process.env.NODE_ENV || "development";
  const config = knexConfig[environment];
  const db = knex(config);

  try {
    const result = await db.raw("SELECT NOW() as current_time");
    logger.info("✅ Database connection test successful");
    logger.info(`📅 Server time: ${result.rows[0].current_time}`);

    await db.destroy();
    return true;
  } catch (error) {
    logger.error("❌ Database connection test failed:", error.message);
    await db.destroy();
    return false;
  }
};

// Main setup function
const setupDatabase = async () => {
  try {
    logger.info("🚀 Starting database setup...");

    // Step 1: Create database
    await createDatabase();

    // Step 2: Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      throw new Error("Database connection test failed");
    }

    // Step 3: Run migrations
    await runMigrations();

    // Step 4: Create admin user
    await createAdminUser();

    logger.info("🎉 Database setup completed successfully!");
    logger.info("📊 You can now start the server with: npm run dev");
  } catch (error) {
    logger.error("💥 Database setup failed:", error.message);
    process.exit(1);
  }
};

// Check environment variables
const checkEnvironment = () => {
  const requiredVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    logger.error("❌ Missing required environment variables:");
    missing.forEach((varName) => {
      logger.error(`   - ${varName}`);
    });
    logger.info("💡 Please create a .env file based on .env.example");
    process.exit(1);
  }

  logger.info("✅ Environment variables check passed");
};

// Run setup if this file is executed directly
if (require.main === module) {
  logger.info("🔧 Onboarding RSV Database Setup");
  logger.info("================================");

  checkEnvironment();
  setupDatabase();
}

module.exports = {
  createDatabase,
  runMigrations,
  createAdminUser,
  testConnection,
  setupDatabase,
};
