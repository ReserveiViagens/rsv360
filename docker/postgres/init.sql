-- ============================================
-- RSV360 PostgreSQL Initialization Script
-- ============================================

-- Enable required extensions for RSV360
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create RSV360 database if it doesn't exist
-- (This will be created by POSTGRES_DB env var, but keeping for clarity)
-- SELECT 'CREATE DATABASE rsv360' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rsv360')\gexec

-- Set default permissions for RSV360 user
-- GRANT ALL PRIVILEGES ON DATABASE rsv360 TO rsv360_user;

-- Create RSV360 schema if needed
-- CREATE SCHEMA IF NOT EXISTS rsv360 AUTHORIZATION rsv360_user;

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'RSV360 PostgreSQL initialization completed successfully';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, pg_trgm';
END
$$;