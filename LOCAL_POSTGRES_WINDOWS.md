# Local PostgreSQL Installation for Windows (Recommended)

## Quick Installation

1. **Download PostgreSQL installer for Windows:**
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Select version 15

2. **Run the installer:**
   - Execute `postgresql-15.x-x64-setup.exe`
   - Installation steps:
     - Accept license
     - Choose installation directory
     - Select "PostgreSQL Server" and "pgAdmin" 
     - **Port**: Leave as 5432
     - **Password**: Enter `postgres` (or remember whatever you use)
     - **Locale**: English

3. **Complete installation**

## Verify Installation

After installation, PostgreSQL should automatically start. Verify by:

```powershell
# Check if service is running
Get-Service postgresql-x64-15

# Or test connection
psql -U postgres -h localhost
# When prompted for password, enter what you set during installation
```

## Update Environment Variables

The PostgreSQL service will be running on localhost:5432 by default.

Edit `.env` in your backend folder:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/concert_ticket_system
```

Replace `your_password` with the password you set during PostgreSQL installation (default: `postgres`).

## Start Your Backend

From PowerShell:
```powershell
cd C:\Users\piwaw\Desktop\concert-ticket-system\backend
node server.js
```

Expected output:
```
[DB] ✅ PostgreSQL connection successful
[DB] ✅ Database initialized successfully
🎵 Concert Ticket System Backend running on port 5000
```

## Benefits of Local vs Docker

| Docker | Local PostgreSQL |
|--------|------------------|
| Networking issues on Windows | Works immediately ✅ |
| Requires Docker Desktop | Built-in Windows support ✅ |
| Extra complexity | Simple & straightforward ✅ |

## Troubleshooting

If you still get "connection refused":
1. Check PostgreSQL service is running: `Get-Service postgresql-x64-15 | Start-Service`
2. Verify password in `.env` matches what you set in installer
3. Check port 5432 is accessible: `netstat -ano | findstr :5432`
