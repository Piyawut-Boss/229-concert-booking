#!/bin/bash
# Production Database Restore Script
# Restores PostgreSQL database from backup file

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-concert_user}"
DB_NAME="${DB_NAME:-concert_ticket_system}"

# Check arguments
if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 ./backups/backup_concert_ticket_system_20260207_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

# Validate backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Starting database restore..."
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""
echo "⚠️  WARNING: This will overwrite all data in the database!"
read -p "Continue? (yes/no): " -n 3 -r
echo
if [[ ! $REPLY =~ ^[Yy] ]]; then
  echo "Restore cancelled"
  exit 1
fi

echo "Dropping existing database..."
PGPASSWORD="$DB_PASSWORD" dropdb \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  --if-exists "$DB_NAME"

echo "Creating new database..."
PGPASSWORD="$DB_PASSWORD" createdb \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  "$DB_NAME"

echo "Restoring data from backup..."
if PGPASSWORD="$DB_PASSWORD" pg_restore \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -v \
  "$BACKUP_FILE"; then
  echo "✅ Database restore completed successfully"
else
  echo "❌ Database restore failed!"
  exit 1
fi

echo "Restore process completed at $(date)"
