#!/bin/bash
# Production Database Backup Script
# Creates timestamped PostgreSQL database backups

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-concert_user}"
DB_NAME="${DB_NAME:-concert_ticket_system}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamped filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"
LOG_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.log"

echo "Starting PostgreSQL backup..." | tee "$LOG_FILE"
echo "Database: $DB_NAME" | tee -a "$LOG_FILE"
echo "Host: $DB_HOST:$DB_PORT" | tee -a "$LOG_FILE"
echo "Backup file: $BACKUP_FILE" | tee -a "$LOG_FILE"

# Create backup
if PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -F c \
  -b \
  -v \
  "$DB_NAME" | gzip > "$BACKUP_FILE"; then
  
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup completed successfully" | tee -a "$LOG_FILE"
  echo "Backup size: $BACKUP_SIZE" | tee -a "$LOG_FILE"
else
  echo "❌ Backup failed!" | tee -a "$LOG_FILE"
  exit 1
fi

# Remove old backups beyond retention period
echo "Cleaning up old backups..." | tee -a "$LOG_FILE"
find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "Old backups removed (retention: $RETENTION_DAYS days)" | tee -a "$LOG_FILE"

echo "Backup process completed at $(date)" | tee -a "$LOG_FILE"
