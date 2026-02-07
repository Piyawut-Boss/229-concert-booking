/**
 * Database Migration Script
 * Executes all database migrations from migrations.sql
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('../config/database-production');

async function runMigrations() {
  console.log('[MIGRATE] Starting database migrations...');
  console.log(`[MIGRATE] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[MIGRATE] Database: ${process.env.DATABASE_URL?.split('/').pop()}`);

  try {
    // Test connection first
    await db.testConnection();

    // Read migration SQL file
    const migrationPath = path.join(__dirname, '../database/migrations.sql');
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    console.log('[MIGRATE] Executing migrations...');
    await db.query(migrationSQL);

    console.log('✅ [MIGRATE] Database migration completed successfully!');
    console.log('[MIGRATE] Tables created/updated:');
    console.log('  - concerts');
    console.log('  - reservations');
    console.log('  - admin_users');
    console.log('  - audit_logs (new)');

    process.exit(0);
  } catch (error) {
    console.error('❌ [MIGRATE] Migration failed:', error.message);
    if (error.detail) {
      console.error('[MIGRATE] Details:', error.detail);
    }
    process.exit(1);
  }
}

// Run migrations
runMigrations();
