const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';

// Initialize Google OAuth Client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// ========== Database Simulation ==========
// ในระบบจริงจะใช้ PostgreSQL หรือ MongoDB
let concerts = [
  {
    id: '1',
    name: 'LAMPANG MUSIC FESTIVAL 2026',
    artist: 'Various Artists',
    date: '2026-03-15',
    venue: 'ลานกาดกองต้า ลำปาง',
    totalTickets: 1000,
    availableTickets: 1000,
    price: 1500,
    status: 'open', // open, closed
    imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'
  },
  {
    id: '2',
    name: 'CHIANG MAI JAZZ NIGHT',
    artist: 'Jazz Ensemble',
    date: '2026-04-20',
    venue: 'Maya Lifestyle Shopping Center',
    totalTickets: 500,
    availableTickets: 500,
    price: 2000,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800'
  },
  {
    id: '3',
    name: 'ROCK CONCERT BANGKOK',
    artist: 'The Rockers',
    date: '2026-05-10',
    venue: 'Impact Arena, Bangkok',
    totalTickets: 5000,
    availableTickets: 5000,
    price: 2500,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
  }
];

let reservations = [];
let adminUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' }
];

// ========== Concurrency Control ==========
// Lock mechanism สำหรับป้องกัน race condition
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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
app.get('/api/concerts', (req, res) => {
  const concertList = concerts.map(c => ({
    ...c,
    bookedTickets: c.totalTickets - c.availableTickets
  }));
  res.json(concertList);
});

// Get concert by ID
app.get('/api/concerts/:id', (req, res) => {
  const concert = concerts.find(c => c.id === req.params.id);
  if (!concert) {
    return res.status(404).json({ error: 'Concert not found' });
  }
  res.json({
    ...concert,
    bookedTickets: concert.totalTickets - concert.availableTickets
  });
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
    const concert = concerts.find(c => c.id === concertId);

    if (!concert) {
      releaseLock(concertId);
      return res.status(404).json({ error: 'Concert not found' });
    }

    if (concert.status !== 'open') {
      releaseLock(concertId);
      return res.status(400).json({ error: 'Booking is closed for this concert' });
    }

    // Check availability (Critical Section)
    if (concert.availableTickets < quantity) {
      releaseLock(concertId);
      return res.status(400).json({ 
        error: 'Not enough tickets available',
        available: concert.availableTickets
      });
    }

    // Atomic operation: Decrease tickets
    concert.availableTickets -= quantity;

    // Create reservation
    const reservation = {
      id: generateReservationId(),
      concertId,
      concertName: concert.name,
      customerName,
      customerEmail,
      quantity,
      totalPrice: concert.price * quantity,
      reservedAt: new Date().toISOString(),
      status: 'confirmed',
      googleAuth: !!req.isAuthenticated  // Mark if booked with Google auth
    };

    reservations.push(reservation);

    // Log for audit
    const authStatus = req.isAuthenticated ? '[GOOGLE AUTH]' : '[NO AUTH]';
    console.log(`${authStatus} [RESERVATION] ${reservation.id} - ${customerName} reserved ${quantity} tickets for ${concert.name}`);

    // Release lock
    releaseLock(concertId);

    res.status(201).json({
      success: true,
      reservation,
      message: 'Reservation successful!'
    });

  } catch (error) {
    releaseLock(concertId);
    console.error('Reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user reservations
app.get('/api/reservations/:email', (req, res) => {
  const userReservations = reservations.filter(
    r => r.customerEmail.toLowerCase() === req.params.email.toLowerCase()
  );
  res.json(userReservations);
});

// ========== ADMIN ROUTES ==========

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = adminUsers.find(
    a => a.username === username && a.password === password
  );

  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    success: true,
    user: { username: admin.username, role: admin.role },
    token: 'admin-token-' + uuidv4() // ในระบบจริงใช้ JWT
  });
});

// Admin: Get all reservations
app.get('/api/admin/reservations', (req, res) => {
  res.json(reservations);
});

// Admin: Get dashboard stats
app.get('/api/admin/stats', (req, res) => {
  const stats = {
    totalConcerts: concerts.length,
    activeConcerts: concerts.filter(c => c.status === 'open').length,
    totalReservations: reservations.length,
    totalRevenue: reservations.reduce((sum, r) => sum + r.totalPrice, 0),
    concerts: concerts.map(c => ({
      id: c.id,
      name: c.name,
      totalTickets: c.totalTickets,
      bookedTickets: c.totalTickets - c.availableTickets,
      availableTickets: c.availableTickets,
      revenue: (c.totalTickets - c.availableTickets) * c.price,
      status: c.status
    }))
  };
  res.json(stats);
});

// Admin: Update concert
app.put('/api/admin/concerts/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  await acquireLock(id);

  try {
    const concertIndex = concerts.findIndex(c => c.id === id);
    
    if (concertIndex === -1) {
      releaseLock(id);
      return res.status(404).json({ error: 'Concert not found' });
    }

    // Update allowed fields
    const concert = concerts[concertIndex];
    
    if (updates.name) concert.name = updates.name;
    if (updates.artist) concert.artist = updates.artist;
    if (updates.date) concert.date = updates.date;
    if (updates.venue) concert.venue = updates.venue;
    if (updates.price !== undefined) concert.price = updates.price;
    if (updates.status) concert.status = updates.status;
    
    // Special handling for ticket updates
    if (updates.totalTickets !== undefined) {
      const bookedTickets = concert.totalTickets - concert.availableTickets;
      if (updates.totalTickets < bookedTickets) {
        releaseLock(id);
        return res.status(400).json({ 
          error: 'Cannot reduce total tickets below booked tickets',
          bookedTickets
        });
      }
      concert.availableTickets = updates.totalTickets - bookedTickets;
      concert.totalTickets = updates.totalTickets;
    }

    console.log(`[ADMIN] Concert ${id} updated`);
    
    releaseLock(id);
    res.json({ success: true, concert });

  } catch (error) {
    releaseLock(id);
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Cancel reservation
app.delete('/api/admin/reservations/:id', async (req, res) => {
  const { id } = req.params;
  
  const reservationIndex = reservations.findIndex(r => r.id === id);
  
  if (reservationIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const reservation = reservations[reservationIndex];
  
  await acquireLock(reservation.concertId);

  try {
    const concert = concerts.find(c => c.id === reservation.concertId);
    
    if (concert) {
      // Return tickets
      concert.availableTickets += reservation.quantity;
    }

    // Remove reservation
    reservations.splice(reservationIndex, 1);

    console.log(`[ADMIN] Reservation ${id} cancelled, ${reservation.quantity} tickets returned`);

    releaseLock(reservation.concertId);
    res.json({ success: true, message: 'Reservation cancelled' });

  } catch (error) {
    releaseLock(reservation.concertId);
    console.error('Cancel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create new concert
app.post('/api/admin/concerts', (req, res) => {
  const { name, artist, date, venue, totalTickets, price } = req.body;

  if (!name || !artist || !date || !venue || !totalTickets || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newConcert = {
    id: String(concerts.length + 1),
    name,
    artist,
    date,
    venue,
    totalTickets,
    availableTickets: totalTickets,
    price,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'
  };

  concerts.push(newConcert);
  
  console.log(`[ADMIN] New concert created: ${newConcert.name}`);
  
  res.status(201).json({ success: true, concert: newConcert });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Concert Ticket System Backend running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Admin credentials: admin / admin123`);
});
