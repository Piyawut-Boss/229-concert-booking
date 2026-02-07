@echo off
REM PostgreSQL Docker Setup for Production (Windows)
REM This script sets up PostgreSQL in Docker with proper configuration

setlocal enabledelayedexpansion

REM Configuration
set CONTAINER_NAME=concert-postgres-prod
set IMAGE=postgres:16-alpine
set DB_USER=%DB_USER:concert_user=%
set DB_PASSWORD=%DB_PASSWORD:changeme!=%
set DB_NAME=%DB_NAME:concert_ticket_system=%
set DB_PORT=%DB_PORT:5432=%
set BACKUP_DIR=.\backups

echo.
echo 🐘 PostgreSQL Production Setup Script (Windows)
echo ====================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
  echo ❌ Docker is not installed. Please install Docker Desktop for Windows first.
  pause
  exit /b 1
)

REM Check if container already exists
docker ps -a --format "{{.Names}}" | find "%CONTAINER_NAME%" >nul
if not errorlevel 1 (
  echo ⚠️  Container %CONTAINER_NAME% already exists
  set /p choice="Remove existing container? (yes/no): "
  if /i "!choice!"=="yes" (
    echo Stopping and removing container...
    docker stop %CONTAINER_NAME% 2>nul
    docker rm %CONTAINER_NAME% 2>nul
  ) else (
    echo Using existing container
    exit /b 0
  )
)

REM Create backup directory
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Create Docker network
docker network ls --format "{{.Name}}" | find "concert-network" >nul
if errorlevel 1 (
  echo Creating Docker network: concert-network
  docker network create concert-network
)

echo.
echo Starting PostgreSQL container...
echo Container: %CONTAINER_NAME%
echo Image: %IMAGE%
echo Port: %DB_PORT%
echo Database: %DB_NAME%
echo.

docker run -d ^
  --name %CONTAINER_NAME% ^
  --network concert-network ^
  -e POSTGRES_USER=%DB_USER% ^
  -e POSTGRES_PASSWORD=%DB_PASSWORD% ^
  -e POSTGRES_DB=%DB_NAME% ^
  -e POSTGRES_INITDB_ARGS="--encoding=UTF8 --locale=en_US.UTF-8" ^
  -p %DB_PORT%:5432 ^
  -v concert_data:/var/lib/postgresql/data ^
  -v "%cd%\%BACKUP_DIR%:/backups" ^
  --restart=always ^
  --health-cmd="pg_isready -U %DB_USER%" ^
  --health-interval=10s ^
  --health-timeout=5s ^
  --health-retries=5 ^
  %IMAGE%

if errorlevel 1 (
  echo ❌ Failed to create container
  pause
  exit /b 1
)

echo ✅ PostgreSQL container starting...
echo.
echo Waiting for database to be ready...

REM Wait for database to be ready
set timeout=60
:wait_loop
docker exec %CONTAINER_NAME% pg_isready -U %DB_USER% >nul 2>&1
if errorlevel 1 (
  if %timeout% leq 0 (
    echo ❌ Timeout waiting for database
    pause
    exit /b 1
  )
  echo ⏳ Waiting... (%timeout% seconds)
  timeout /t 5 /nobreak
  set /a timeout=%timeout%-5
  goto wait_loop
)

echo ✅ Database is ready!
echo.
echo 📊 Connection Details:
echo ====================
echo Host: localhost
echo Port: %DB_PORT%
echo User: %DB_USER%
echo Password: %DB_PASSWORD%
echo Database: %DB_NAME%
echo.
echo 🔗 Connection String:
echo postgresql://%DB_USER%:%DB_PASSWORD%@localhost:%DB_PORT%/%DB_NAME%
echo.
echo ✅ Setup completed successfully!
echo.
echo Next steps:
echo 1. Run migrations: npm run migrate
echo 2. Seed data: npm run seed
echo 3. Start backend: npm start
echo.
pause
