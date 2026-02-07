const db = require('./config/database');

async function createAdmin() {
  try {
    console.log('[ADMIN] Creating admin user...');
    
    const result = await db.query(
      `INSERT INTO admin_users (username, password, role) 
       VALUES ('admin', 'admin123', 'admin') 
       ON CONFLICT (username) DO UPDATE 
       SET password = 'admin123', role = 'admin' 
       RETURNING id, username, role`
    );

    console.log('✅ Admin user created/updated:', result.rows[0]);
    
    // Verify
    const verify = await db.query('SELECT id, username, role FROM admin_users WHERE username = $1', ['admin']);
    console.log('✅ Verification:', verify.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
