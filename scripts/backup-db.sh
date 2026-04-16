#!/bin/bash

# scripts/backup-db.sh
# Backup PostgreSQL database with compression and rotation
# Usage: ./backup-db.sh <environment> <backup_name>
# Example: ./backup-db.sh production daily-2024-01-15

set -e

ENVIRONMENT=$1
BACKUP_NAME=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$BACKUP_NAME" ]; then
    echo "❌ Usage: $0 <environment> <backup_name>"
    echo "   Environment: staging or production"
    echo "   Backup Name: e.g., daily-2024-01-15"
    exit 1
fi

# Database connection (from environment or defaults)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-rsv360}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}

BACKUP_DIR="./backups/$ENVIRONMENT"
BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Creating database backup: $BACKUP_FILE"

# Export password for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Create compressed backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-privileges --clean --if-exists \
    | gzip > "$BACKUP_FILE"

echo "✅ Backup created successfully: $BACKUP_FILE"

# Rotate backups (keep last 30)
echo "🔄 Rotating backups (keeping last 30)..."
cd "$BACKUP_DIR"
ls -t *.sql.gz | tail -n +31 | xargs -r rm -f

echo "📊 Backup rotation complete. Current backups:"
ls -la *.sql.gz | head -5