# PostgreSQL Production Setup - Quick Start

## 5-Minute Setup with Docker (Recommended)

### Windows Users:

```bash
cd concert-ticket-system\backend

# 1. Set up PostgreSQL in Docker
.\scripts\setup-postgres-docker.bat

# 2. Create .env file with PostgreSQL connection
copy .env.production .env

# 3. Install dependencies
npm install

# 4. Initialize database (migrations + seed)
npm run db:init

# 5. Start the backend
npm start
```

Your API will be running at: **http://localhost:5000**

### Linux/macOS Users:

```bash
cd concert-ticket-system/backend

# 1. Set up PostgreSQL in Docker
bash scripts/setup-postgres-docker.sh

# 2. Create .env file
cp .env.production .env

# 3. Install dependencies
npm install

# 4. Initialize database
npm run db:init

# 5. Start the backend
npm start
```

---

## Manual PostgreSQL Setup

### Option 1: Local PostgreSQL Installation

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# During installation, set password for postgres user

# In PostgreSQL command line or SQL shell:
CREATE USER concert_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE concert_ticket_system OWNER concert_user;
GRANT ALL PRIVILEGES ON DATABASE concert_ticket_system TO concert_user;
```

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16

createuser concert_user -P
createdb concert_ticket_system -O concert_user
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib

sudo -u postgres createuser concert_user -P
sudo -u postgres createdb concert_ticket_system -O concert_user
```

Then run:
```bash
cd backend
npm install
npm run db:init
npm start
```

### Option 2: Docker Compose (Full Stack)

```bash
# Set environment
cd backend
cp .env.production .env

# Edit .env with your credentials if needed
# Default: concert_user / changeme!

# Start all services
docker-compose -f ../docker-compose-production.yml up -d

# Check status
docker-compose -f ../docker-compose-production.yml ps

# View logs
docker-compose -f ../docker-compose-production.yml logs backend
```

---

## Environment Configuration

Edit `backend/.env` with your database details:

```bash
# PostgreSQL Connection
DATABASE_URL=postgresql://concert_user:your_password@localhost:5432/concert_ticket_system

# Initial Setup
# Set to 'true' only on first deployment, then set to 'false'
SEED_DATABASE=true

# Other Settings
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## Available Commands

```bash
# Database Management
npm run migrate          # Run database migrations
npm run seed            # Seed initial data
npm run db:init         # Migrate + seed (all-in-one)
npm run db:backup       # Create backup (Linux/macOS)
npm run db:restore      # Restore from backup

# Server
npm start              # Start production server
npm run dev            # Start with nodemon (auto-reload)

# Setup
npm run db:setup       # Docker setup (Linux/macOS)
```

---

## Verify Setup

```bash
# 1. Check API health
curl http://localhost:5000/api/health

# Response should show:
# {
#   "status": "OK",
#   "database": "PostgreSQL",
#   "timestamp": "2026-02-07T10:30:00Z"
# }

# 2. Check database connection
psql postgresql://concert_user:password@localhost:5432/concert_ticket_system

# In psql shell:
\dt                          # List tables
SELECT COUNT(*) FROM concerts;
\q                           # Quit
```

---

## Troubleshooting

### "Connection refused"

```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or
psql -c "SELECT 1;"

# If not running, start it:
docker-compose -f docker-compose-production.yml up -d postgres
```

### "Password authentication failed"

```bash
# Check DATABASE_URL in .env
cat backend/.env | grep DATABASE_URL

# Verify credentials match your PostgreSQL setup
```

### "Database not found"

```bash
# Create the database
npm run db:init

# Or manually:
npm run migrate
npm run seed
```

### Can't connect from app to PostgreSQL in Docker

```bash
# Both services must be on the same network
docker network ls
docker network inspect concert-network

# If missing, recreate:
docker-compose -f docker-compose-production.yml down
docker-compose -f docker-compose-production.yml up -d
```

---

## Production Checklist

- [ ] PostgreSQL installed or Docker running
- [ ] Database created and user configured
- [ ] `.env` file configured with `DATABASE_URL`
- [ ] `npm install` completed
- [ ] `npm run db:init` executed successfully
- [ ] `npm start` server running
- [ ] Health check endpoint responding
- [ ] Database tables created successfully
- [ ] Sample data seeded
- [ ] Backups configured
- [ ] SSL certificates obtained (for HTTPS)
- [ ] Environment variables secured

---

## Next Steps

1. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Access Application:**
   - Frontend: http://localhost:3000 (or via Vite dev server)
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/api/health

3. **Set Up SSL** (for production):
   - Generate or purchase SSL certificate
   - Configure HTTPS in nginx (frontend) and Express (backend)

4. **Configure Backups:**
   - Linux/macOS: `crontab -e` to schedule `npm run db:backup`
   - Docker: Auto-backups already configured to `/backups` volume

5. **Monitor & Maintain:**
   - Check logs regularly: `docker-compose logs -f backend`
   - Monitor database performance
   - Test restore procedures
   - Update dependencies: `npm update && npm audit fix`

---

## Quick Reference

| Task | Command |
|------|---------|
| Setup Docker PostgreSQL | `bash scripts/setup-postgres-docker.sh` |
| Run migrations | `npm run migrate` |
| Seed data | `npm run seed` |
| Full initialization | `npm run db:init` |
| Start server | `npm start` |
| Backup database | `npm run db:backup` |
| View logs | `docker-compose logs -f` |
| Connect to psql | `psql $DATABASE_URL` |

---

**For detailed information, see:** [PRODUCTION_POSTGRES_DEPLOYMENT.md](./PRODUCTION_POSTGRES_DEPLOYMENT.md)

**Last Updated:** February 7, 2026
