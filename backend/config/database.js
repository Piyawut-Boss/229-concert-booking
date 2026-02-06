const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require('pg');

// Debug: Show all env vars
console.log('[DB] ENV vars loaded:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES')));
console.log('[DB] DATABASE_URL value:', process.env.DATABASE_URL);

// PostgreSQL Connection Pool
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/concert_ticket_system';
console.log('[DB] Using connection string:', connectionString.replace(/:.+@/, ':****@'));

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  host: 'localhost',
  port: 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize database with schema
async function initializeDatabase() {
  try {
    // Drop existing tables if they exist (for fresh setup)
    await pool.query('DROP TABLE IF EXISTS reservations CASCADE');
    await pool.query('DROP TABLE IF EXISTS concerts CASCADE');
    await pool.query('DROP TABLE IF EXISTS admin_users CASCADE');

    // Create concerts table
    await pool.query(`
      CREATE TABLE concerts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        venue VARCHAR(255) NOT NULL,
        total_tickets INTEGER NOT NULL,
        available_tickets INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reservations table
    await pool.query(`
      CREATE TABLE reservations (
        id VARCHAR(50) PRIMARY KEY,
        concert_id INTEGER NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 10),
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
        google_auth BOOLEAN DEFAULT FALSE,
        reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin_users table
    await pool.query(`
      CREATE TABLE admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert initial concert data
    await pool.query(`
      INSERT INTO concerts (name, artist, date, venue, total_tickets, available_tickets, price, image_url, status)
      VALUES
        ('LAMPANG MUSIC FESTIVAL 2026', 'Various Artists', '2026-03-15', 'ลานกาดกองต้า ลำปาง', 1000, 1000, 1500, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', 'open'),
        ('CHIANG MAI JAZZ NIGHT', 'Jazz Ensemble', '2026-04-20', 'Maya Lifestyle Shopping Center', 500, 500, 2000, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', 'open'),
        ('ROCK CONCERT BANGKOK', 'The Rockers', '2026-05-10', 'Impact Arena, Bangkok', 5000, 5000, 2500, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'open')
    `);

    // Insert admin user
    await pool.query(`
      INSERT INTO admin_users (username, password, role)
      VALUES ('admin', 'admin123', 'admin')
    `);

    // Create indexes for better query performance
    await pool.query('CREATE INDEX idx_reservations_email ON reservations(customer_email)');
    await pool.query('CREATE INDEX idx_reservations_concert ON reservations(concert_id)');
    await pool.query('CREATE INDEX idx_concerts_status ON concerts(status)');

    console.log('[DB] ✅ Database initialized successfully');
  } catch (error) {
    // Tables might already exist, continue
    if (!error.message.includes('already exists')) {
      console.error('[DB] Initialization warning:', error.message);
    }
  }
}

// Database object that provides query interface
const db = {
  query: (text, params) => pool.query(text, params),
  pool,
  initializeDatabase,
  testConnection: async () => {
    try {
      await pool.query('SELECT 1');
      console.log('[DB] ✅ PostgreSQL connection successful');
      return true;
    } catch (error) {
      console.error('[DB] ❌ PostgreSQL connection failed:', error.message);
      return false;
    }
  }
};

module.exports = db;



