const knex = require("knex");
const knexConfig = require("../../knexfile");
const logger = require("../utils/logger");

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];

// Create database connection
const db = knex(config);

// Connection utility functions
const connectDatabase = async () => {
  try {
    // Test the connection
    await db.raw("SELECT 1");
    logger.info(`✅ Database connected successfully (${environment})`);

    // Run migrations in production/staging
    if (environment !== "development") {
      logger.info("🔄 Running database migrations...");
      await db.migrate.latest();
      logger.info("✅ Database migrations completed");
    }

    return true;
  } catch (error) {
    logger.error("❌ Database connection failed:", error.message);
    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    await db.destroy();
    logger.info("📴 Database connection closed");
  } catch (error) {
    logger.error("❌ Error closing database connection:", error.message);
    throw error;
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const result = await db.raw("SELECT NOW() as current_time");
    return {
      status: "healthy",
      timestamp: result.rows[0].current_time,
      connection: "active",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      connection: "failed",
    };
  }
};

// Transaction helper
const withTransaction = async (callback) => {
  const trx = await db.transaction();
  try {
    const result = await callback(trx);
    await trx.commit();
    return result;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

// Database statistics
const getDatabaseStats = async () => {
  try {
    const stats = await db.raw(`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      LIMIT 10
    `);

    const tableCount = await db.raw(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    return {
      tables: parseInt(tableCount.rows[0].count),
      sampleStats: stats.rows,
      connectionPool: {
        min: config.pool?.min || 2,
        max: config.pool?.max || 10,
      },
    };
  } catch (error) {
    logger.error("Error getting database stats:", error.message);
    return null;
  }
};

module.exports = {
  db,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
  withTransaction,
  getDatabaseStats,
};
