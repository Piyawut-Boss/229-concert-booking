# PostgreSQL Database Setup Guide

## Prerequisites
- PostgreSQL 12+ installed on your system
- Node.js 14+ installed

## Installation Steps

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Run the installer
- During installation, set password for `postgres` user (remember this!)
- Keep default port `5432`
- Accept default installation settings

**Verify Installation:**
```powershell
psql --version
```

### 2. Create Database and Tables

Open Command Prompt or PowerShell:

```powershell
# Connect to PostgreSQL
psql -U postgres -h localhost

# You'll be prompted for password (the one you set during installation)
```

In the `psql` prompt, run:

```sql
-- Create database
CREATE DATABASE concert_booking;

-- Connect to it
\c concert_booking

-- Create tables
\i 'C:/Users/piwaw/Desktop/concert-ticket-system/backend/database/init.sql'

-- Verify tables were created
\dt
```

You should see these tables:
- `concerts`
- `reservations`
- `admin_users`

Exit psql:
```sql
\q
```

### 3. Configure Environment Variables

The backend `.env` file already has:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/concert_booking
```

**If you used a different password or settings, update it accordingly:**
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/concert_booking
```

### 4. Start the Backend Server

```powershell
cd C:\Users\piwaw\Desktop\concert-ticket-system\backend
npm start
```

You should see:
```
🎵 Concert Ticket System Backend running on port 5000
[DB] ✅ PostgreSQL connection successful
```

## Troubleshooting

### Error: "Could not connect to database"

**Solutions:**
1. Verify PostgreSQL is running:
   ```powershell
   pg_isready -h localhost -p 5432
   ```
   Should output: `accepting connections`

2. Check DATABASE_URL in `.env` is correct

3. Verify database exists:
   ```powershell
   psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='concert_booking';"
   ```

4. Check tables exist:
   ```powershell
   psql -U postgres -d concert_booking -c "\dt"
   ```

### Error: "FATAL: password authentication failed for user 'postgres'"

- You entered the wrong password
- Restart PostgreSQL and try the password again
- Reset PostgreSQL password using `pgAdmin` GUI tool

### Error: "database does not exist"

- Run the SQL initialization script again:
  ```powershell
  psql -U postgres < "C:\Users\piwaw\Desktop\concert-ticket-system\backend\database\init.sql"
  ```

## Database Schema

### concerts table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Concert name |
| artist | VARCHAR(255) | Artist name |
| date | DATE | Concert date |
| venue | VARCHAR(255) | Venue name |
| total_tickets | INTEGER | Total tickets |
| available_tickets | INTEGER | Available tickets |
| price | DECIMAL | Ticket price |
| status | VARCHAR(50) | 'open' or 'closed' |
| image_url | TEXT | Concert image URL |

### reservations table
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) | Primary key (RES prefix) |
| concert_id | INTEGER | Foreign key to concerts |
| customer_name | VARCHAR(255) | Booking customer name |
| customer_email | VARCHAR(255) | Customer email |
| quantity | INTEGER | Number of tickets |
| total_price | DECIMAL | Total booking price |
| status | VARCHAR(50) | 'confirmed' or 'cancelled' |
| google_auth | BOOLEAN | Booked via Google OAuth |
| reserved_at | TIMESTAMP | Booking timestamp |

### admin_users table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| username | VARCHAR(100) | Admin username |
| password | VARCHAR(255) | Admin password |
| role | VARCHAR(50) | User role |

## Default Test Data

After initialization, the database includes:

**Concerts:**
1. LAMPANG MUSIC FESTIVAL 2026 - 1000 tickets - 1500 THB
2. CHIANG MAI JAZZ NIGHT - 500 tickets - 2000 THB
3. ROCK CONCERT BANGKOK - 5000 tickets - 2500 THB

**Admin User:**
- Username: `admin`
- Password: `admin123`

## Backup Database

```powershell
pg_dump -U postgres concert_booking > backup.sql
```

## Restore Database

```powershell
psql -U postgres -d concert_booking < backup.sql
```

## Reset Database (Delete All Data)

```powershell
psql -U postgres -c "DROP DATABASE concert_booking;"
psql -U postgres < "C:\Users\piwaw\Desktop\concert-ticket-system\backend\database\init.sql"
```

**WARNING:** This will delete all concert and reservation data!

## Connection Pool Configuration

The backend uses PostgreSQL connection pooling for performance:
- Max 20 concurrent connections
- 30 second idle timeout
- 2 second connection timeout

These settings are in `backend/config/database.js` and can be adjusted if needed.

## Need Help?

If you encounter issues:
1. Check PostgreSQL is running
2. Verify database name and credentials
3. Review PostgreSQL logs in:
   ```
   C:\Program Files\PostgreSQL\14\data\log\
   ```
4. Check backend console output for detailed error messages
