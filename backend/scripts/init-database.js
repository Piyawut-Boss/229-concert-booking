/**
 * Database Initialization Script
 * Complete database setup: connection test → migrate → seed
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('../config/database-production');

async function testConnection() {
  console.log('[INIT] Testing database connection...');
  try {
    const result = await db.testConnection();
    if (!result) {
      throw new Error('Connection test failed');
    }
    console.log('✅ [INIT] Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ [INIT] Connection test failed:', error.message);
    return false;
  }
}

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath]);

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      console.log(data.toString());
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Script exited with code ${code}: ${errorOutput}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function initializeDatabase() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Database Initialization Script       ║');
  console.log('║  Concert Ticket System - Production   ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL?.split('/').pop() || 'unknown'}`);
  console.log('');

  try {
    // Step 1: Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Cannot proceed without database connection');
    }

    console.log('');
    console.log('─────────────────────────────────────────');

    // Step 2: Run migrations
    console.log('[INIT] Running migrations...');
    await runScript(path.join(__dirname, 'migrate-database.js'));

    console.log('');
    console.log('─────────────────────────────────────────');

    // Step 3: Seed data (only if SEED_DATABASE is true)
    if (process.env.SEED_DATABASE === 'true') {
      console.log('[INIT] Seeding initial data...');
      await runScript(path.join(__dirname, 'seed-database.js'));
    } else {
      console.log('[INIT] Skipping seeding (SEED_DATABASE not set to true)');
    }

    console.log('');
    console.log('═════════════════════════════════════════');
    console.log('✅ Database initialization completed successfully!');
    console.log('═════════════════════════════════════════');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the backend: npm start');
    console.log('2. Access API: http://localhost:5000');
    console.log('3. Check health: http://localhost:5000/api/health');
    console.log('');

    await db.closePool();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('═════════════════════════════════════════');
    console.error('❌ Database initialization failed!');
    console.error('═════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('ECONNREFUSED')) {
      console.error('Resolution: Make sure PostgreSQL is running and accessible');
      console.error('Check DATABASE_URL in .env file');
    }

    try {
      await db.closePool();
    } catch (e) {
      // Ignore
    }

    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
