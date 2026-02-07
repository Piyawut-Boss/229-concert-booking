const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require('pg');
const fs = require('fs');

/**
 * Production-grade PostgreSQL Database Configuration
 * Features:
 * - Connection pooling with configurable limits
 * - SSL/TLS support for secure connections
 * - Retry logic for resilience
 * - Comprehensive error handling
 * - Health checks and monitoring
 */

// Parse SSL certificate if provided
let sslConfig = false;
if (process.env.DATABASE_SSL_CA) {
  sslConfig = {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.DATABASE_SSL_CA, 'utf8'),
    key: process.env.DATABASE_SSL_KEY ? fs.readFileSync(process.env.DATABASE_SSL_KEY, 'utf8') : undefined,
    cert: process.env.DATABASE_SSL_CERT ? fs.readFileSync(process.env.DATABASE_SSL_CERT, 'utf8') : undefined,
  };
}

// Validate required environment variables
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[DB] ERROR: DATABASE_URL not set in environment variables');
  process.exit(1);
}

// PostgreSQL Connection Pool Configuration
const poolConfig = {
  connectionString: DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '20'),  // Max connections
  min: parseInt(process.env.DB_POOL_MIN || '2'),   // Min connections to maintain
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE || '30000'),  // 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),  // 2 seconds
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '120000'),  // 2 minutes
  application_name: 'concert-ticket-system',
  ssl: sslConfig,
};

console.log('[DB] PostgreSQL Pool Configuration:');
console.log(`[DB] Max connections: ${poolConfig.max}`);
console.log(`[DB] Min connections: ${poolConfig.min}`);
console.log(`[DB] Idle timeout: ${poolConfig.idleTimeoutMillis}ms`);
console.log(`[DB] Connection timeout: ${poolConfig.connectionTimeoutMillis}ms`);
console.log(`[DB] SSL enabled: ${sslConfig !== false}`);

const pool = new Pool(poolConfig);

// Error handlers
pool.on('error', (err) => {
  console.error('[DB] ❌ Unexpected error on idle client:', err);
});

pool.on('connect', () => {
  console.log('[DB] ℹ️  New client connected to pool');
});

pool.on('remove', () => {
  console.log('[DB] ℹ️  Client removed from pool');
});

/**
 * Execute database initialization (migrations)
 */
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('[DB] Starting database initialization...');

    // Read and execute migration SQL file
    const migrationPath = path.join(__dirname, '../database/migrations.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await client.query(migrationSQL);
    console.log('[DB] ✅ Migrations executed successfully');

    // Seed initial data if SEED_DATABASE is true
    if (process.env.SEED_DATABASE === 'true') {
      const seedPath = path.join(__dirname, '../database/seed-production.sql');
      if (fs.existsSync(seedPath)) {
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        await client.query(seedSQL);
        console.log('[DB] ✅ Initial data seeded successfully');
      }
    }

    return true;
  } catch (error) {
    console.error('[DB] ❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Test database connection with retry logic
 */
async function testConnection(maxRetries = 3) {
  let retries = 0;

  while (retries < maxRetries) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW();');
      console.log('[DB] ✅ PostgreSQL connection successful');
      console.log('[DB] Server time:', result.rows[0].now);
      return true;
    } catch (error) {
      retries++;
      console.error(`[DB] ❌ Connection attempt ${retries}/${maxRetries} failed:`, error.message);

      if (retries < maxRetries) {
        const waitTime = Math.pow(2, retries) * 1000;  // Exponential backoff
        console.log(`[DB] Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw new Error('Failed to connect to database after maximum retries');
      }
    } finally {
      client.release();
    }
  }

  return false;
}

/**
 * Get connection pool statistics
 */
function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Health check for monitoring
 */
async function healthCheck() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        poolStats: getPoolStats(),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      poolStats: getPoolStats(),
    };
  }
}

/**
 * Close all database connections
 */
async function closePool() {
  try {
    await pool.end();
    console.log('[DB] ✅ Database connection pool closed');
  } catch (error) {
    console.error('[DB] ❌ Error closing database pool:', error.message);
  }
}

// Database module exports
const db = {
  // Query execution
  query: (text, params) => pool.query(text, params),
  
  // Get raw pool for advanced operations
  pool,
  
  // Lifecycle management
  initializeDatabase,
  testConnection,
  closePool,
  
  // Monitoring
  getPoolStats,
  healthCheck,
};

module.exports = db;
