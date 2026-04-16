#!/bin/bash

# scripts/seed-production.sh
# Seed production database with initial data
# Usage: ./seed-production.sh <environment>
# Example: ./seed-production.sh production

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "❌ Usage: $0 <environment>"
    echo "   Environment: staging or production"
    exit 1
fi

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "❌ Invalid environment. Must be 'staging' or 'production'"
    exit 1
fi

# Database connection
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-rsv360}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}

SEED_FILE="./database/seed.sql"

if [ ! -f "$SEED_FILE" ]; then
    echo "❌ Seed file not found: $SEED_FILE"
    echo "📂 Please ensure the seed SQL file exists"
    exit 1
fi

echo "🌱 WARNING: This will seed the $ENVIRONMENT database with initial data"
echo "🗃️  Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo "📄 Seed file: $SEED_FILE"
echo ""
echo "⚠️  This operation may overwrite existing data!"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🚨 PRODUCTION ENVIRONMENT DETECTED"
    echo "This action requires explicit confirmation for production"
    read -p "Type 'YES' to confirm seeding production database: " CONFIRM
    if [ "$CONFIRM" != "YES" ]; then
        echo "❌ Seeding cancelled"
        exit 1
    fi
else
    read -p "Are you sure you want to seed the $ENVIRONMENT database? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "❌ Seeding cancelled"
        exit 1
    fi
fi

echo "🔄 Starting database seeding..."

# Export password
export PGPASSWORD="$DB_PASSWORD"

# Run seed SQL
echo "📥 Executing seed script..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SEED_FILE"

echo "✅ Database seeding completed successfully!"
echo "🔍 Verify the seeding by checking your application data"