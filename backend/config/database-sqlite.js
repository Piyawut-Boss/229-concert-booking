const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database in project root
const dbPath = path.join(__dirname, '../concert_booking.db');

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[DB] ❌ SQLite connection failed:', err.message);
      } else {
        console.log('[DB] ✅ SQLite connection successful at', dbPath);
      }
    });
  }
  return dbInstance;
}

// Promisify database operations
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Custom query method that matches PostgreSQL interface
async function query(sql, params = []) {
  try {
    // Convert PostgreSQL $1, $2 placeholders to SQLite ?
    let sqliteSql = sql;
    for (let i = params.length; i > 0; i--) {
      sqliteSql = sqliteSql.replace('$' + i, '?');
    }

    sqliteSql = sqliteSql.trim();

    // Handle different query types
    if (sqliteSql.toUpperCase().startsWith('SELECT')) {
      const rows = await dbAll(sqliteSql, params);
      return { rows };
    } else if (sqliteSql.toUpperCase().startsWith('INSERT')) {
      const result = await dbRun(sqliteSql, params);
      return { rows: [{ id: result.lastID }] };
    } else if (sqliteSql.toUpperCase().startsWith('UPDATE') || sqliteSql.toUpperCase().startsWith('DELETE')) {
      await dbRun(sqliteSql, params);
      return { rows: [] };
    } else {
      // Default: try to execute as run
      await dbRun(sqliteSql, params);
      return { rows: [] };
    }
  } catch (error) {
    console.error('[DB] Query error:', error);
    throw error;
  }
}

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create concerts table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS concerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        artist TEXT NOT NULL,
        date TEXT NOT NULL,
        venue TEXT NOT NULL,
        total_tickets INTEGER NOT NULL,
        available_tickets INTEGER NOT NULL,
        price REAL NOT NULL,
        status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reservations table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY,
        concert_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 10),
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
        google_auth BOOLEAN DEFAULT 0,
        reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (concert_id) REFERENCES concerts(id) ON DELETE CASCADE
      )
    `);

    // Create admin_users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if concerts table is empty
    const concerts = await dbAll('SELECT COUNT(*) as count FROM concerts');
    if (concerts[0].count === 0) {
      // Insert sample data
      const sampleData = [
        ['LAMPANG MUSIC FESTIVAL 2026', 'Various Artists', '2026-03-15', 'ลานกาดกองต้า ลำปาง', 1000, 1000, 1500, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', 'open'],
        ['CHIANG MAI JAZZ NIGHT', 'Jazz Ensemble', '2026-04-20', 'Maya Lifestyle Shopping Center', 500, 500, 2000, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', 'open'],
        ['ROCK CONCERT BANGKOK', 'The Rockers', '2026-05-10', 'Impact Arena, Bangkok', 5000, 5000, 2500, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'open']
      ];

      for (const data of sampleData) {
        await dbRun(
          `INSERT INTO concerts (name, artist, date, venue, total_tickets, available_tickets, price, image_url, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          data
        );
      }

      console.log('[DB] ✅ Sample data inserted');
    }

    // Check if admin user exists
    const admins = await dbAll('SELECT COUNT(*) as count FROM admin_users');
    if (admins[0].count === 0) {
      await dbRun(
        `INSERT INTO admin_users (username, password, role) VALUES (?, ?, ?)`,
        ['admin', 'admin123', 'admin']
      );
      console.log('[DB] ✅ Admin user created');
    }

    console.log('[DB] ✅ Database tables initialized');
  } catch (error) {
    console.error('[DB] Initialization error:', error);
  }
}

// Initialize on startup
initializeDatabase();

async function testConnection() {
  try {
    const result = await dbGet('SELECT datetime("now") as now');
    console.log('[DB] ✅ SQLite connection test successful');
    return true;
  } catch (error) {
    console.error('[DB] ❌ SQLite connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  query,
  testConnection,
};

