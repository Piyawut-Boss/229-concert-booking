# PostgreSQL Setup Guide for Concert Ticket System

## Prerequisites

You need to have PostgreSQL installed on your system.

### Windows Installation

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. During installation, choose port 5432 (default)
5. Complete the installation

### macOS Installation

```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

### Linux Installation (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Database Setup

### Step 1: Connect to PostgreSQL

**Windows (using pgAdmin GUI):**
- Open pgAdmin (installed with PostgreSQL)
- Connect to local server with postgres user

**Command Line (all platforms):**
```bash
psql -U postgres
```

### Step 2: Create Database

```sql
-- Connect as postgres user, then run:
CREATE DATABASE concert_ticket_system;
```

### Step 3: Create .env file

Copy the `.env.example` to `.env` and update it:

```bash
cp .env.example .env
```

Then edit `.env`:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/concert_ticket_system
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## Installation and Running

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Start the Backend

```bash
npm start
```

The server will:
1. Connect to PostgreSQL
2. Create database tables automatically
3. Seed initial concert data
4. Start listening on port 5000

You should see:
```
[DB] ✅ PostgreSQL connection successful
[DB] ✅ Database initialized successfully
🎵 Concert Ticket System Backend running on port 5000
```

## Verifying the Setup

### Test Database Connection

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2026-02-07T...",
  "database": "PostgreSQL"
}
```

### Get All Concerts

```bash
curl http://localhost:5000/api/concerts
```

### Test Admin Login

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Troubleshooting

### Connection Refused Error
- Make sure PostgreSQL is running: `sudo systemctl start postgresql` (Linux) or check Services (Windows)
- Verify DATABASE_URL in .env is correct
- Default port is 5432

### Database Already Exists Error
- Run: `DROP DATABASE concert_ticket_system;`
- Then restart the backend to recreate it

### Permission Denied Error
- Make sure you're using the correct username and password
- Default postgres password is what you set during installation

## Database Schema

The application creates:

- **concerts** - Concert details (id, name, artist, date, venue, tickets, price, status, etc.)
- **reservations** - Booking records (id, concert_id, customer info, quantity, price, status, etc.)
- **admin_users** - Admin credentials (username, password, role)

Indexes are automatically created on:
- `reservations.customer_email`
- `reservations.concert_id`
- `concerts.status`

## Next Steps

1. Start the frontend: `cd frontend && npm run dev`
2. Access the application at http://localhost:5173 (Vite frontend)
3. Admin dashboard at Frontend admin page
