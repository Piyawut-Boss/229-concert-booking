/**
 * Database Seed Script
 * Seeds initial data into the database
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('../config/database-production');

async function seedDatabase() {
  console.log('[SEED] Starting database seeding...');
  console.log(`[SEED] Environment: ${process.env.NODE_ENV || 'development'}`);

  try {
    // Test connection first
    await db.testConnection();

    // Read seed SQL file
    const seedPath = path.join(__dirname, '../database/seed-production.sql');
    if (!fs.existsSync(seedPath)) {
      console.warn('[SEED] Seed file not found, skipping seeding');
      process.exit(0);
    }

    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    // Execute seed
    console.log('[SEED] Inserting initial data...');
    await db.query(seedSQL);

    console.log('✅ [SEED] Database seeding completed successfully!');

    // Verify seeded data
    const concertCount = await db.query('SELECT COUNT(*) as count FROM concerts');
    const adminCount = await db.query('SELECT COUNT(*) as count FROM admin_users');

    console.log('[SEED] Data summary:');
    console.log(`  - Concerts: ${concertCount.rows[0].count}`);
    console.log(`  - Admin users: ${adminCount.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ [SEED] Seeding failed:', error.message);
    if (error.detail) {
      console.error('[SEED] Details:', error.detail);
    }
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
