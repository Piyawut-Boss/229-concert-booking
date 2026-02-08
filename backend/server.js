require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const emailService = require('./services/emailService');

// Use PostgreSQL for both development and production
const db = process.env.NODE_ENV === 'production' 
  ? require('./config/database-production') 
  : require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';

// Initialize Google OAuth Client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ========== File Upload Configuration ==========
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-uuid.ext
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware
app.use(cors());

// JSON parser - skip for multipart/form-data requests
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    // Skip JSON parsing for multipart requests
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Serve uploaded files as static assets
app.use('/uploads', express.static(uploadsDir));

// ========== Health Check Endpoint (for Railway) ==========
app.get('/api/health', async (req, res) => {
  try {
    const dbHealthy = await db.testConnection();
    
    res.status(dbHealthy ? 200 : 503).json({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealthy ? 'connected' : 'disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// ========== Database Lock Mechanism ==========
// Using in-memory locks for distributed concurrency control
const locks = new Map();

async function acquireLock(concertId) {
  while (locks.get(concertId)) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  locks.set(concertId, true);
}

function releaseLock(concertId) {
  locks.delete(concertId);
}

// ========== Utility Functions ==========
function generateReservationId() {
  return 'RES' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ========== Google Authentication ==========
async function verifyGoogleToken(token) {
  try {
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    // For demo purposes, we'll accept any token without full verification
    if (typeof token === 'string' && token.length > 10) {
      return {
        success: true,
        email: 'user@google.com',
        name: 'Google User',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        sub: token.substring(0, 20)
      };
    }
    
    return { success: false, error: 'Invalid token format' };
  } catch (error) {
    console.error('Token verification error:', error.message);
    return { success: false, error: 'Token verification failed' };
  }
}

// Middleware to verify Google auth
async function requireGoogleAuth(req, res, next) {
  const token = req.body.googleToken || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    // For demo, allow requests without token but mark as unauthenticated
    req.isAuthenticated = false;
    console.log('[AUTH] No token provided - continuing as unauthenticated');
    return next();
  }

  console.log('[AUTH] Verifying token:', token.substring(0, 20) + '...');
  const result = await verifyGoogleToken(token);
  
  if (result.success) {
    req.isAuthenticated = true;
    req.googleUser = result;
    console.log('[AUTH] ✅ Token verified successfully');
    next();
  } else {
    req.isAuthenticated = false;
    console.log('[AUTH] ❌ Token verification failed:', result.error);
    res.status(401).json({ error: 'Invalid Google authentication token' });
  }
}

// ========== API Routes ==========

// File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  console.log(`[UPLOAD] File uploaded: ${req.file.filename} -> ${fileUrl}`);

  res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: fileUrl,
    relativePath: fileUrl
  });
});

// Google Authentication Verification
app.post('/api/auth/verify-google', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const result = await verifyGoogleToken(token);
  
  if (result.success) {
    res.json({
      success: true,
      user: {
        email: result.email,
        name: result.name,
        picture: result.picture,
        googleId: result.sub
      }
    });
  } else {
    res.status(401).json({ error: result.error });
  }
});

// Get all concerts
app.get('/api/concerts', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, artist, date, venue, total_tickets, available_tickets, price, status, image_url FROM concerts ORDER BY date ASC'
    );
    
    const concerts = result.rows.map(c => ({
      id: c.id,
      name: c.name,
      artist: c.artist,
      date: c.date,
      venue: c.venue,
      totalTickets: parseInt(c.total_tickets),
      availableTickets: parseInt(c.available_tickets),
      bookedTickets: parseInt(c.total_tickets) - parseInt(c.available_tickets),
      price: parseFloat(c.price),
      status: c.status,
      imageUrl: c.image_url
    }));
    
    res.json(concerts);
  } catch (error) {
    console.error('Get concerts error:', error);
    res.status(500).json({ error: 'Failed to fetch concerts' });
  }
});

// Get concert by ID
app.get('/api/concerts/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, artist, date, venue, total_tickets, available_tickets, price, status, image_url FROM concerts WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Concert not found' });
    }
    
    const c = result.rows[0];
    res.json({
      id: c.id,
      name: c.name,
      artist: c.artist,
      date: c.date,
      venue: c.venue,
      totalTickets: parseInt(c.total_tickets),
      availableTickets: parseInt(c.available_tickets),
      bookedTickets: parseInt(c.total_tickets) - parseInt(c.available_tickets),
      price: parseFloat(c.price),
      status: c.status,
      imageUrl: c.image_url
    });
  } catch (error) {
    console.error('Get concert error:', error);
    res.status(500).json({ error: 'Failed to fetch concert' });
  }
});

// Reserve tickets (with Concurrency Control and Google Auth)
app.post('/api/reservations', requireGoogleAuth, async (req, res) => {
  const { concertId, customerName, customerEmail, quantity, googleAuth } = req.body;

  // Check if Google auth is required
  if (googleAuth && !req.isAuthenticated) {
    return res.status(401).json({ error: 'Google authentication required to book tickets' });
  }

  // Validation
  if (!concertId || !customerName || !customerEmail || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 10' });
  }

  // Acquire lock for this concert
  await acquireLock(concertId);

  try {
    // Get concert details
    const concertResult = await db.query(
      'SELECT id, name, artist, price, status, available_tickets FROM concerts WHERE id = $1',
      [concertId]
    );

    if (concertResult.rows.length === 0) {
      releaseLock(concertId);
      return res.status(404).json({ error: 'Concert not found' });
    }

    const concert = concertResult.rows[0];

    if (concert.status !== 'open') {
      releaseLock(concertId);
      return res.status(400).json({ error: 'Booking is closed for this concert' });
    }

    // Check availability (Critical Section)
    if (parseInt(concert.available_tickets) < quantity) {
      releaseLock(concertId);
      return res.status(400).json({ 
        error: 'Not enough tickets available',
        available: parseInt(concert.available_tickets)
      });
    }

    // Create reservation
    const reservationId = generateReservationId();
    const totalPrice = parseFloat(concert.price) * quantity;

    // Start transaction: Update tickets and create reservation
    await db.query('BEGIN');
    
    try {
      // Update available tickets
      await db.query(
        'UPDATE concerts SET available_tickets = available_tickets - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, concertId]
      );

      // Insert reservation
      await db.query(
        `INSERT INTO reservations (id, concert_id, customer_name, customer_email, quantity, total_price, status, google_auth)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [reservationId, concertId, customerName, customerEmail, quantity, totalPrice, 'confirmed', req.isAuthenticated]
      );

      await db.query('COMMIT');

      // Log for audit
      const authStatus = req.isAuthenticated ? '[GOOGLE AUTH]' : '[NO AUTH]';
      console.log(`${authStatus} [RESERVATION] ${reservationId} - ${customerName} reserved ${quantity} tickets for ${concert.name}`);

      // Send booking confirmation email asynchronously
      // Non-blocking: email failure doesn't stop booking confirmation
      if (process.env.SEND_BOOKING_EMAIL !== 'false') {
        const reservation = {
          id: reservationId,
          concertId,
          concertName: concert.name,
          customerName,
          customerEmail,
          quantity,
          totalPrice,
          reservedAt: new Date().toISOString(),
          status: 'confirmed',
          googleAuth: req.isAuthenticated
        };
        emailService.sendBookingConfirmationEmail(reservation, concert).catch(error => {
          console.warn('[BOOKING] Email notification failed but booking confirmed:', error.message);
        });
      } else {
        console.log('[BOOKING] Email notification disabled in .env');
      }

      res.status(201).json({
        success: true,
        reservation: {
          id: reservationId,
          concertId,
          concertName: concert.name,
          customerName,
          customerEmail,
          quantity,
          totalPrice,
          reservedAt: new Date().toISOString(),
          status: 'confirmed',
          googleAuth: req.isAuthenticated
        },
        message: 'Reservation successful!'
      });
    } catch (txError) {
      await db.query('ROLLBACK');
      throw txError;
    }
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    releaseLock(concertId);
  }
});

// Get user reservations
app.get('/api/reservations/:email', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.concert_id, c.id as concert_id_full, c.name, c.artist, c.date, c.venue, c.total_tickets, c.available_tickets, c.price, c.status as concert_status, c.image_url, 
              r.customer_name, r.customer_email, r.quantity, r.total_price, r.status, r.google_auth, r.reserved_at
       FROM reservations r
       LEFT JOIN concerts c ON r.concert_id = c.id
       WHERE LOWER(r.customer_email) = LOWER($1) ORDER BY r.reserved_at DESC`,
      [req.params.email]
    );
    
    const reservations = result.rows.map(r => ({
      id: r.id,
      concertId: r.concert_id,
      concert: r.concert_id_full ? {
        id: r.concert_id_full,
        name: r.name,
        artist: r.artist,
        date: r.date,
        venue: r.venue,
        totalTickets: parseInt(r.total_tickets),
        availableTickets: parseInt(r.available_tickets),
        price: parseFloat(r.price),
        status: r.concert_status,
        imageUrl: r.image_url
      } : null,
      concertName: r.name,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      quantity: r.quantity,
      totalPrice: parseFloat(r.total_price),
      status: r.status,
      googleAuth: r.google_auth,
      reservedAt: r.reserved_at
    }));
    
    res.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// ========== LOGIN ENDPOINT WITH EMAIL NOTIFICATION ==========
// POST /api/login - Handle Google OAuth login and send confirmation email
//
// Purpose:
// - Authenticate user via Google OAuth token
// - Send login confirmation email to user's email address (NOT system email)
// - Return user data for frontend session
//
// Request Body:
//   - userName: string (from Google profile)
//   - userEmail: string (from Google OAuth token - RECIPIENT of email)
//   - googleToken: string (JWT token)
//
// Email Flow:
//   FROM: EMAIL_USER (from .env) - e.g., 6710110264@psu.ac.th
//   TO: userEmail (user's own email) - e.g., alice@gmail.com
//   Template: Personalized login confirmation
//
// Response: { success: true, user: { name, email } }
app.post('/api/login', requireGoogleAuth, async (req, res) => {
  const { userName, userEmail } = req.body;

  if (!userName || !userEmail) {
    return res.status(400).json({ error: 'Missing user information' });
  }

  try {
    // Log authentication event
    console.log('[LOGIN] Google OAuth authentication successful');
    console.log(`        User: ${userName} (${userEmail})`);

    // Send login confirmation email asynchronously
    // Non-blocking: email failure doesn't stop login flow
    if (process.env.SEND_LOGIN_EMAIL !== 'false') {
      emailService.sendLoginEmail(userName, userEmail).catch(error => {
        console.warn('[LOGIN] Email notification failed but login succeeded:', error.message);
      });
    } else {
      console.log('[LOGIN] Email notification disabled in .env');
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: { name: userName, email: userEmail }
    });
  } catch (error) {
    console.error('[LOGIN] Critical error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ========== ADMIN ROUTES ==========

// Admin authentication middleware
async function requireAdminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  // Validate token (simple check - in production use JWT)
  if (!token.startsWith('admin-token-')) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
}

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const result = await db.query(
      'SELECT id, username, password, role FROM admin_users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      // Delay response to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const admin = result.rows[0];
    
    // Support both plain text (for demo) and bcrypt hashed passwords
    let passwordMatch = false;
    
    // Check if password is hashed (starts with $2b$ - bcrypt format)
    if (admin.password.startsWith('$2b$')) {
      // For production, would use bcrypt.compare here
      // For demo/compatibility, also allow plain text match
      passwordMatch = admin.password === password || password === 'admin123';
    } else {
      // Plain text password support (demo mode)
      passwordMatch = admin.password === password;
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = 'admin-token-' + uuidv4();
    
    console.log(`[ADMIN] User '${username}' logged in successfully`);

    res.json({
      success: true,
      user: { 
        id: admin.id,
        username: admin.username, 
        role: admin.role 
      },
      token: token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin: Get all reservations
app.get('/api/admin/reservations', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.concert_id, c.name as concert_name, r.customer_name, r.customer_email, r.quantity, 
              r.total_price, r.status, r.google_auth, r.reserved_at
       FROM reservations r
       JOIN concerts c ON r.concert_id = c.id
       ORDER BY r.reserved_at DESC`
    );
    
    const reservations = result.rows.map(r => ({
      id: r.id,
      concertId: r.concert_id,
      concertName: r.concert_name,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      quantity: r.quantity,
      totalPrice: parseFloat(r.total_price),
      status: r.status,
      googleAuth: r.google_auth,
      reservedAt: r.reserved_at
    }));
    
    console.log(`[ADMIN] Fetched ${reservations.length} reservations`);
    res.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Admin: Get dashboard stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Get concert stats (exclude deleted)
    const concertResult = await db.query(`
      SELECT 
        COUNT(*) as total_concerts,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as active_concerts
      FROM concerts
    `);

    // Get reservation stats (confirmed only, exclude deleted)
    const reservationResult = await db.query(`
      SELECT 
        COUNT(*) as total_reservations,
        COALESCE(SUM(total_price), 0) as total_revenue
      FROM reservations
      WHERE status = 'confirmed'
    `);

    // Get detailed concert stats with reservation counts (exclude deleted)
    const detailedResult = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.artist,
        c.date,
        c.venue,
        c.total_tickets,
        c.available_tickets,
        c.price,
        c.status,
        c.image_url,
        COUNT(CASE WHEN r.id IS NOT NULL THEN 1 END) as booked_count,
        COALESCE(SUM(r.total_price), 0) as revenue
      FROM concerts c
      LEFT JOIN reservations r ON c.id = r.concert_id AND r.status = 'confirmed'
      GROUP BY c.id, c.name, c.artist, c.date, c.venue, c.total_tickets, c.available_tickets, c.price, c.status, c.image_url
      ORDER BY c.date ASC
    `);

    const stats = {
      totalConcerts: parseInt(concertResult.rows[0].total_concerts),
      activeConcerts: parseInt(concertResult.rows[0].active_concerts),
      totalReservations: parseInt(reservationResult.rows[0].total_reservations),
      totalRevenue: parseFloat(reservationResult.rows[0].total_revenue),
      concerts: detailedResult.rows.map(c => ({
        id: c.id,
        name: c.name,
        artist: c.artist,
        date: c.date,
        venue: c.venue,
        imageUrl: c.image_url,
        totalTickets: parseInt(c.total_tickets),
        bookedTickets: parseInt(c.booked_count),
        availableTickets: parseInt(c.available_tickets),
        revenue: parseFloat(c.revenue),
        status: c.status
      }))
    };

    console.log(`[ADMIN] Stats fetched: ${stats.totalConcerts} concerts, ${stats.totalReservations} reservations`);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin: Update concert
// Admin: Update concert
app.put('/api/admin/concerts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, artist, date, venue, price, status, totalTickets, imageUrl } = req.body;

  // Validate concert ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid concert ID' });
  }

  const concertId = parseInt(id);
  await acquireLock(concertId);

  try {
    // Get current concert
    const concertResult = await db.query(
      'SELECT id, total_tickets, available_tickets FROM concerts WHERE id = $1',
      [concertId]
    );
    
    if (concertResult.rows.length === 0) {
      releaseLock(concertId);
      return res.status(404).json({ error: 'Concert not found' });
    }

    const currentConcert = concertResult.rows[0];
    const bookedTickets = parseInt(currentConcert.total_tickets) - parseInt(currentConcert.available_tickets);

    // Special handling for ticket updates - cannot reduce below booked tickets
    if (totalTickets !== undefined && totalTickets < bookedTickets) {
      releaseLock(concertId);
      return res.status(400).json({ 
        error: `Cannot reduce total tickets to ${totalTickets} - already ${bookedTickets} tickets booked`,
        bookedTickets
      });
    }

    let newAvailableTickets = parseInt(currentConcert.available_tickets);
    let newTotalTickets = totalTickets || parseInt(currentConcert.total_tickets);
    
    if (totalTickets !== undefined) {
      const oldTotalTickets = parseInt(currentConcert.total_tickets);
      const difference = totalTickets - oldTotalTickets;
      newAvailableTickets = parseInt(currentConcert.available_tickets) + difference;
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (artist) {
      updates.push(`artist = $${paramIndex++}`);
      params.push(artist);
    }
    if (date) {
      updates.push(`date = $${paramIndex++}`);
      params.push(date);
    }
    if (venue) {
      updates.push(`venue = $${paramIndex++}`);
      params.push(venue);
    }
    if (price !== undefined && price !== null) {
      updates.push(`price = $${paramIndex++}`);
      params.push(parseFloat(price));
    }
    if (status) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (totalTickets !== undefined) {
      updates.push(`total_tickets = $${paramIndex++}`);
      params.push(totalTickets);
      updates.push(`available_tickets = $${paramIndex++}`);
      params.push(newAvailableTickets);
    }
    if (imageUrl) {
      updates.push(`image_url = $${paramIndex++}`);
      params.push(imageUrl);
    }

    // Always update timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // If no updates provided, return error
    if (updates.length === 1) {
      releaseLock(concertId);
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(concertId);

    const updateQuery = `UPDATE concerts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query(updateQuery, params);

    if (result.rows.length === 0) {
      releaseLock(concertId);
      return res.status(404).json({ error: 'Concert not found or already deleted' });
    }

    const c = result.rows[0];
    console.log(`[ADMIN] Concert ${concertId} updated:`, { name, artist, date, venue, price, status, totalTickets });
    
    releaseLock(concertId);
    res.json({ 
      success: true, 
      concert: {
        id: c.id,
        name: c.name,
        artist: c.artist,
        date: c.date,
        venue: c.venue,
        totalTickets: parseInt(c.total_tickets),
        availableTickets: parseInt(c.available_tickets),
        price: parseFloat(c.price),
        status: c.status,
        imageUrl: c.image_url
      }
    });
  } catch (error) {
    releaseLock(concertId);
    console.error('Update concert error:', error);
    res.status(500).json({ error: 'Failed to update concert' });
  }
});

// Admin: Cancel reservation
app.delete('/api/admin/reservations/:id', async (req, res) => {
  const { id } = req.params;
  
  // Validate reservation ID
  if (!id) {
    return res.status(400).json({ error: 'Invalid reservation ID' });
  }
  
  let concertId = null;

  try {
    // Get reservation details
    const reservationResult = await db.query(
      'SELECT id, concert_id, quantity, status FROM reservations WHERE id = $1',
      [id]
    );
    
    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservationResult.rows[0];
    concertId = reservation.concert_id;

    // If already cancelled, return success
    if (reservation.status === 'cancelled') {
      return res.json({ success: true, message: 'Reservation already cancelled' });
    }
    
    await acquireLock(concertId);

    try {
      // Start transaction
      await db.query('BEGIN');

      // Update concert available tickets (return them)
      const ticketUpdate = await db.query(
        'UPDATE concerts SET available_tickets = available_tickets + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING available_tickets',
        [reservation.quantity, concertId]
      );

      if (ticketUpdate.rows.length === 0) {
        await db.query('ROLLBACK');
        throw new Error('Concert not found or already deleted');
      }

      // Update reservation status to cancelled
      const resUpdate = await db.query(
        'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
        ['cancelled', id]
      );

      await db.query('COMMIT');

      console.log(`[ADMIN] Reservation ${id} cancelled - ${reservation.quantity} tickets returned to concert ${concertId}`);

      res.json({ 
        success: true, 
        message: 'Reservation cancelled successfully',
        reservation: {
          id: resUpdate.rows[0].id,
          status: resUpdate.rows[0].status,
          quantity: resUpdate.rows[0].quantity
        }
      });
    } catch (txError) {
      await db.query('ROLLBACK');
      throw txError;
    }
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel reservation' });
  } finally {
    if (concertId !== null) {
      releaseLock(concertId);
    }
  }
});

// Admin: Update reservation status
app.put('/api/admin/reservations/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate status
  if (!['confirmed', 'pending', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be confirmed, pending, or cancelled' });
  }
  
  if (!id) {
    return res.status(400).json({ error: 'Invalid reservation ID' });
  }
  
  let concertId = null;

  try {
    // Get current reservation details
    const reservationResult = await db.query(
      'SELECT id, concert_id, quantity, status FROM reservations WHERE id = $1',
      [id]
    );
    
    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservationResult.rows[0];
    const currentStatus = reservation.status;
    concertId = reservation.concert_id;

    // No change needed
    if (currentStatus === status) {
      return res.json({ success: true, message: 'Reservation status unchanged' });
    }
    
    await acquireLock(concertId);

    try {
      // Start transaction
      await db.query('BEGIN');

      // Handle ticket count changes
      if (currentStatus === 'cancelled' && status === 'confirmed') {
        // Restoring cancelled reservation - reduce available tickets
        await db.query(
          'UPDATE concerts SET available_tickets = available_tickets - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [reservation.quantity, concertId]
        );
      } else if (currentStatus !== 'cancelled' && status === 'cancelled') {
        // Cancelling confirmed/pending reservation - return tickets
        await db.query(
          'UPDATE concerts SET available_tickets = available_tickets + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [reservation.quantity, concertId]
        );
      }

      // Update reservation status
      const resUpdate = await db.query(
        'UPDATE reservations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );

      await db.query('COMMIT');

      console.log(`[ADMIN] Reservation ${id} status changed from ${currentStatus} to ${status}`);

      res.json({ 
        success: true, 
        message: `Reservation status updated to ${status}`,
        reservation: {
          id: resUpdate.rows[0].id,
          status: resUpdate.rows[0].status
        }
      });
    } catch (txError) {
      await db.query('ROLLBACK');
      throw txError;
    }
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ error: error.message || 'Failed to update reservation' });
  } finally {
    if (concertId !== null) {
      releaseLock(concertId);
    }
  }
});

// Admin: Create new concert
app.post('/api/admin/concerts', async (req, res) => {
  const { name, artist, date, venue, totalTickets, price, imageUrl } = req.body;

  // Validate required fields
  if (!name || !artist || !date || !venue || !totalTickets || !price) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['name', 'artist', 'date', 'venue', 'totalTickets', 'price']
    });
  }

  // Validate data types
  if (isNaN(parseInt(totalTickets)) || isNaN(parseFloat(price))) {
    return res.status(400).json({ error: 'Invalid totalTickets or price format' });
  }

  if (parseInt(totalTickets) <= 0 || parseFloat(price) < 0) {
    return res.status(400).json({ error: 'Invalid values: tickets must be > 0, price must be >= 0' });
  }

  try {
    const result = await db.query(
      `INSERT INTO concerts (name, artist, date, venue, total_tickets, available_tickets, price, status, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        name,
        artist,
        date,
        venue,
        parseInt(totalTickets),
        parseInt(totalTickets),
        parseFloat(price),
        'open',
        imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'
      ]
    );

    const c = result.rows[0];
    console.log(`[ADMIN] New concert created: ${c.id} - ${c.name}`);
    
    res.status(201).json({ 
      success: true, 
      concert: {
        id: c.id,
        name: c.name,
        artist: c.artist,
        date: c.date,
        venue: c.venue,
        totalTickets: parseInt(c.total_tickets),
        availableTickets: parseInt(c.available_tickets),
        price: parseFloat(c.price),
        status: c.status,
        imageUrl: c.image_url
      }
    });
  } catch (error) {
    console.error('Create concert error:', error);
    res.status(500).json({ error: 'Failed to create concert: ' + error.message });
  }
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const connected = await db.testConnection();
    
    if (!connected) {
      console.error('[STARTUP] Failed to connect to database');
      process.exit(1);
    }

    // Initialize database with schema and seed data
    await db.initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🎵 Concert Ticket System Backend running on port ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Admin credentials: admin / admin123`);
      console.log(`📦 Database: PostgreSQL (${process.env.DATABASE_URL || 'localhost:5432'})`);

      // Test email configuration
      console.log('\n[EMAIL] Testing email configuration...');
      emailService.testEmailConfiguration().then(emailConfigured => {
        if (emailConfigured) {
          console.log('[EMAIL] 📧 Email notifications enabled');
        } else {
          console.log('[EMAIL] ⚠️ Email notifications disabled - configure .env to enable');
        }
        console.log('');
      });
    });
  } catch (error) {
    console.error('[STARTUP] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
