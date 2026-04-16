#!/bin/bash

# scripts/restore-db.sh
# Restore PostgreSQL database from backup
# Usage: ./restore-db.sh <environment> <backup_name>
# Example: ./restore-db.sh production daily-2024-01-15

set -e

ENVIRONMENT=$1
BACKUP_NAME=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$BACKUP_NAME" ]; then
    echo "❌ Usage: $0 <environment> <backup_name>"
    echo "   Environment: staging or production"
    echo "   Backup Name: e.g., daily-2024-01-15"
    exit 1
fi

# Database connection
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-rsv360}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}

BACKUP_DIR="./backups/$ENVIRONMENT"
BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.sql.gz"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    echo "📂 Available backups in $BACKUP_DIR:"
    ls -la "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

echo "⚠️  WARNING: This will DROP and RECREATE the database '$DB_NAME'"
echo "📦 Backup to restore: $BACKUP_FILE"
echo "🗃️  Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled by user"
    exit 1
fi

echo "🔄 Starting database restore..."

# Export password
export PGPASSWORD="$DB_PASSWORD"

# Terminate active connections and drop/recreate database
echo "🗑️  Dropping and recreating database..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
" 2>/dev/null || true

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"

# Restore from backup
echo "📥 Restoring from backup..."
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

echo "✅ Database restore completed successfully!"
echo "🔍 Verify the restore by checking your application"