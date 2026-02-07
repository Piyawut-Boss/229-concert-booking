# Production PostgreSQL Deployment Guide

## Overview

This guide walks you through deploying the Concert Ticket System with production-grade PostgreSQL on various platforms.

## Table of Contents

1. [Pre-requisites](#pre-requisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Database Backup & Recovery](#database-backup--recovery)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Pre-requisites

- Node.js 18+ or Docker
- PostgreSQL 12+ (if not using Docker)
- Git
- SSL certificates for HTTPS (production)
- Environment configuration files

---

## Local Development Setup

### 1. Direct PostgreSQL Installation

#### On Windows (with PostgreSQL installer):

```bash
# Download PostgreSQL from https://www.postgresql.org/download/windows/
# Run installer and note the password for postgres user

# Create database and user
psql -U postgres -c "CREATE USER concert_user WITH PASSWORD 'your_password';"
psql -U postgres -c "CREATE DATABASE concert_ticket_system OWNER concert_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE concert_ticket_system TO concert_user;"
```

#### On macOS (using Homebrew):

```bash
brew install postgresql@16
brew services start postgresql@16

# Create database and user
createuser concert_user -P
createdb concert_ticket_system -O concert_user
```

#### On Linux (Ubuntu/Debian):

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

sudo -u postgres createuser concert_user -P
sudo -u postgres createdb concert_ticket_system -O concert_user
```

### 2. Configure Environment

```bash
cd backend
cp .env.production .env

# Edit .env with your PostgreSQL credentials
DATABASE_URL=postgresql://concert_user:your_password@localhost:5432/concert_ticket_system
NODE_ENV=production
```

### 3. Initialize Database

```bash
cd backend

# Install dependencies
npm install

# Run all migrations and seed data
npm run db:init

# Or run individually:
npm run migrate
npm run seed
```

### 4. Start Backend

```bash
npm start
```

The API will be available at `http://localhost:5000`

---

## Docker Deployment

### Quick Setup (Recommended for Production)

#### Using Docker Compose:

```bash
# Copy production environment file
cp backend/.env.production backend/.env

# Edit .env with your credentials
# Set SEED_DATABASE=true for first deployment, then false for subsequent

# Start all services
docker-compose -f docker-compose-production.yml up -d

# Check status
docker-compose -f docker-compose-production.yml ps

# View logs
docker-compose -f docker-compose-production.yml logs -f backend
```

#### Using Setup Scripts:

**On Windows:**
```bash
scripts/setup-postgres-docker.bat
```

**On Linux/macOS:**
```bash
bash scripts/setup-postgres-docker.sh
```

### Manual Docker Setup

```bash
# Create Docker network
docker network create concert-network

# Start PostgreSQL
docker run -d \
  --name concert-postgres \
  --network concert-network \
  -e POSTGRES_USER=concert_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=concert_ticket_system \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine

# Wait for database to be ready
docker exec concert-postgres pg_isready -U concert_user

# Build and start backend
docker build -t concert-backend ./backend
docker run -d \
  --name concert-api \
  --network concert-network \
  -e DATABASE_URL=postgresql://concert_user:your_password@concert-postgres:5432/concert_ticket_system \
  -p 5000:5000 \
  concert-backend
```

---

## Cloud Deployment

### AWS RDS PostgreSQL

```bash
# 1. Create RDS Instance via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier concert-ticket-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username concert_user \
  --master-user-password YourSecurePassword \
  --allocated-storage 20 \
  --publicly-accessible false

# 2. Configure security group to allow traffic from your app

# 3. Set DATABASE_URL with RDS endpoint
DATABASE_URL=postgresql://concert_user:password@concert-ticket-db.xxxxx.us-east-1.rds.amazonaws.com:5432/concert_ticket_system

# 4. Run migrations against RDS
npm run db:init
```

### Heroku

```bash
# 1. Create Heroku app
heroku create concert-ticket-system

# 2. Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0 -a concert-ticket-system

# 3. Deploy
git push heroku main

# 4. Run migrations
heroku run npm run db:init -a concert-ticket-system
```

### DigitalOcean App Platform

```bash
# 1. Create PostgreSQL database
# Via DigitalOcean Dashboard: Databases > Create > PostgreSQL

# 2. Configure app platform
# Set DATABASE_URL with DigitalOcean connection string

# 3. Deploy and run migrations
doctl apps create --spec app.yaml
```

### Azure Database for PostgreSQL

```bash
# 1. Create managed PostgreSQL
az postgres server create \
  --resource-group myResourceGroup \
  --name concert-ticket-db \
  --location eastus \
  --admin-user concert_user \
  --admin-password YourSecurePassword

# 2. Set DATABASE_URL
DATABASE_URL=postgresql://concert_user@concert-ticket-db:password@concert-ticket-db.postgres.database.azure.com/concert_ticket_system

# 3. Configure SSL certificate (required by Azure)
DATABASE_SSL_CA=/path/to/azure-ca-cert.pem
```

---

## Database Backup & Recovery

### Automated Daily Backups

Create a cron job (Linux/macOS):

```bash
# Edit crontab
crontab -e

# Add backup task (runs daily at 2 AM)
0 2 * * * /path/to/your/project/scripts/backup-database.sh >> /var/log/concert-backup.log 2>&1
```

Windows Task Scheduler:

```bash
# Create batch script wrapper for scheduling
scripts/setup-postgres-docker.bat
```

### Manual Backup

```bash
# Export environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=concert_user
export DB_PASSWORD=your_password
export DB_NAME=concert_ticket_system

# Run backup
bash scripts/backup-database.sh

# Backup file saved to: ./backups/backup_concert_ticket_system_YYYYMMDD_HHMMSS.sql.gz
```

### Restore from Backup

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=concert_user
export DB_PASSWORD=your_password
export DB_NAME=concert_ticket_system

bash scripts/restore-database.sh ./backups/backup_concert_ticket_system_20260207_120000.sql.gz
```

### Upload Backups to S3

```bash
#!/bin/bash
# Add to backup script

BACKUP_FILE=$1
AWS_BUCKET="my-concert-backups"

aws s3 cp "$BACKUP_FILE" "s3://$AWS_BUCKET/$(basename $BACKUP_FILE)"
```

---

## Monitoring & Maintenance

### Database Health Check

```bash
# Check connection pool status
curl http://localhost:5000/api/health

# Response should include:
# {
#   "status": "healthy",
#   "poolStats": {
#     "totalCount": 5,
#     "idleCount": 4,
#     "waitingCount": 0
#   }
# }
```

### PostgreSQL Performance Monitoring

```bash
# Connect to database
psql postgresql://concert_user:password@localhost:5432/concert_ticket_system

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check index usage
SELECT schemaname, tablename, indexname, idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan DESC;
```

### Log Rotation

```bash
# Container logs
docker logs concert-api --tail 100

# PostgreSQL logs inside container
docker exec concert-postgres tail -f /var/log/postgresql/postgresql.log
```

### Maintenance Tasks

```bash
# Vacuum (reclaim space)
psql postgresql://concert_user:password@localhost/concert_ticket_system -c "VACUUM ANALYZE;"

# Reindex (optimize indexes)
psql postgresql://concert_user:password@localhost/concert_ticket_system -c "REINDEX DATABASE concert_ticket_system;"

# Update statistics
psql postgresql://concert_user:password@localhost/concert_ticket_system -c "ANALYZE;"
```

---

## Security Best Practices

### 1. Environment Variables

✅ **DO:**
```bash
# .env.production (local, never commit)
DATABASE_URL=postgresql://concert_user:SecurePassword123!@postgres:5432/concert_ticket_system
JWT_SECRET=YourVerySecureJWTSecretKey
```

❌ **DON'T:**
- Commit `.env` files to git
- Use default passwords
- Expose credentials in logs

### 2. Database User Permissions

```sql
-- Create read-only user for backups
CREATE USER backup_user WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE concert_ticket_system TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;

-- Restrict admin user permissions
REVOKE ALL ON DATABASE concert_ticket_system FROM concert_user;
GRANT CONNECT ON DATABASE concert_ticket_system TO concert_user;
GRANT USAGE ON SCHEMA public TO concert_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO concert_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO concert_user;
```

### 3. SSL/TLS Encryption

For cloud providers (AWS RDS, Azure, etc.), force SSL connections:

```bash
# .env.production
DATABASE_URL=postgresql://concert_user:password@host:5432/concert_ticket_system?sslmode=require
DATABASE_SSL_CA=/path/to/rds-ca-bundle.pem
```

### 4. Network Security

```bash
# Only allow backend to access database
docker network create --driver bridge concert-network

# Database only accessible within network
docker run ... --network concert-network ...
```

### 5. Regular Updates

```bash
# Update PostgreSQL container
docker pull postgres:16-alpine
docker-compose -f docker-compose-production.yml down
docker-compose -f docker-compose-production.yml up -d

# Update dependencies
npm update
npm audit fix
```

---

## Troubleshooting

### Connection Issues

**Error: "ECONNREFUSED"**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or
psql -c "SELECT 1;"

# Verify DATABASE_URL is correct
echo $DATABASE_URL
```

**Error: "Password authentication failed"**
```bash
# Verify credentials in .env
# Reset password:
psql -U postgres -c "ALTER USER concert_user WITH PASSWORD 'newpassword';"
```

### Performance Issues

```bash
# Check query performance
EXPLAIN ANALYZE SELECT * FROM reservations WHERE customer_email = 'user@example.com';

# Add missing indexes if needed
CREATE INDEX idx_reservations_email ON reservations(customer_email);
```

### Backup Issues

```bash
# Check disk space
df -h ./backups

# Verify permissions
ls -la ./backups

# Test with smaller backup
pg_dump -h localhost -U concert_user concert_ticket_system | head -n 100
```

### Container Logs

```bash
# View real-time logs
docker-compose -f docker-compose-production.yml logs -f

# Save logs to file
docker-compose -f docker-compose-production.yml logs > app.log 2>&1
```

---

## Support & Documentation

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Docker Documentation: https://docs.docker.com/
- Node.js PostgreSQL Driver: https://node-postgres.com/
- Django/Node.js ORM recommendations for production deployments

---

**Last Updated:** February 7, 2026
**Version:** 1.0.0
