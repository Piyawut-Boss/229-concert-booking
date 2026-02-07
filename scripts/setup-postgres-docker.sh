#!/bin/bash
# PostgreSQL Docker Setup for Production
# This script sets up PostgreSQL in Docker with proper configuration

set -e

# Configuration
CONTAINER_NAME="concert-postgres-prod"
IMAGE="postgres:16-alpine"
DB_USER="${DB_USER:-concert_user}"
DB_PASSWORD="${DB_PASSWORD:-changeme!}"
DB_NAME="${DB_NAME:-concert_ticket_system}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

echo "🐘 PostgreSQL Production Setup Script"
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker first."
  exit 1
fi

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "⚠️  Container $CONTAINER_NAME already exists"
  read -p "Remove existing container? (yes/no): " -n 3 -r
  echo
  if [[ $REPLY =~ ^[Yy] ]]; then
    echo "Stopping and removing container..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
  else
    echo "Using existing container"
    exit 0
  fi
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create Docker network
NETWORK="concert-network"
if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK}$"; then
  echo "Creating Docker network: $NETWORK"
  docker network create "$NETWORK"
fi

echo ""
echo "Starting PostgreSQL container..."
echo "Container: $CONTAINER_NAME"
echo "Image: $IMAGE"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo ""

docker run -d \
  --name "$CONTAINER_NAME" \
  --network "$NETWORK" \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB="$DB_NAME" \
  -e POSTGRES_INITDB_ARGS="--encoding=UTF8 --locale=en_US.UTF-8" \
  -p "$DB_PORT:5432" \
  -v concert_data:/var/lib/postgresql/data \
  -v "$(pwd)/$BACKUP_DIR:/backups" \
  --restart=always \
  --health-cmd="pg_isready -U $DB_USER" \
  --health-interval=10s \
  --health-timeout=5s \
  --health-retries=5 \
  "$IMAGE"

echo "✅ PostgreSQL container starting..."
echo ""
echo "Waiting for database to be ready..."

# Wait for database to be ready
timeout=60
while [ $timeout -gt 0 ]; do
  if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" > /dev/null 2>&1; then
    echo "✅ Database is ready!"
    break
  fi
  echo "⏳ Waiting... ($timeout seconds)"
  sleep 5
  timeout=$((timeout - 5))
done

if [ $timeout -le 0 ]; then
  echo "❌ Timeout waiting for database"
  exit 1
fi

echo ""
echo "📊 Connection Details:"
echo "===================="
echo "Host: localhost"
echo "Port: $DB_PORT"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo "Database: $DB_NAME"
echo ""
echo "🔗 Connection String:"
echo "postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"
echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run migrations: npm run migrate"
echo "2. Seed data: npm run seed"
echo "3. Start backend: npm start"
