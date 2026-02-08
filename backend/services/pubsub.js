/**
 * Pub/Sub Service Module
 * 
 * Purpose: Real-time event handling using Redis Pub/Sub and Socket.IO
 * - Broadcast ticket availability updates
 * - Real-time reservation notifications
 * - Admin dashboard updates
 */

const redis = require('redis');

// Redis clients for Pub/Sub
let publisherClient = null;
let subscriberClient = null;
let socketIOServer = null;

/**
 * Initialize Redis Pub/Sub connection
 */
function initializePubSub() {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    publisherClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    subscriberClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    publisherClient.on('error', (err) => {
      console.error('[REDIS Publisher] Error:', err.message);
    });

    subscriberClient.on('error', (err) => {
      console.error('[REDIS Subscriber] Error:', err.message);
    });

    subscriberClient.on('message', (channel, message) => {
      handleRedisMessage(channel, message);
    });

    publisherClient.connect().catch(err => {
      console.error('[REDIS] Publisher connection failed:', err.message);
      console.log('[REDIS] Falling back to in-memory mode');
    });

    subscriberClient.connect().catch(err => {
      console.error('[REDIS] Subscriber connection failed:', err.message);
    });

    console.log('[PUBSUB] ✅ Redis Pub/Sub initialized');
    return true;
  } catch (error) {
    console.warn('[PUBSUB] Redis not available, using in-memory mode:', error.message);
    return false;
  }
}

/**
 * Initialize Socket.IO for real-time communication
 */
function initializeSocketIO(server) {
  const { Server } = require('socket.io');
  
  socketIOServer = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  socketIOServer.on('connection', (socket) => {
    console.log(`[SOCKET.IO] Client connected: ${socket.id}`);

    // Join specific concert room for updates
    socket.on('join-concert', (concertId) => {
      socket.join(`concert-${concertId}`);
      console.log(`[SOCKET.IO] User joined concert room: concert-${concertId}`);
    });

    // Leave concert room
    socket.on('leave-concert', (concertId) => {
      socket.leave(`concert-${concertId}`);
      console.log(`[SOCKET.IO] User left concert room: concert-${concertId}`);
    });

    // Join admin room
    socket.on('join-admin', (adminId) => {
      socket.join(`admin-${adminId}`);
      console.log(`[SOCKET.IO] Admin joined: admin-${adminId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET.IO] Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error(`[SOCKET.IO] Error:`, error);
    });
  });

  console.log('[PUBSUB] ✅ Socket.IO initialized');
  return socketIOServer;
}

/**
 * Handle incoming Redis messages
 */
function handleRedisMessage(channel, message) {
  try {
    const data = JSON.parse(message);
    
    if (channel.startsWith('concert:')) {
      const concertId = channel.split(':')[1];
      console.log(`[PUBSUB] Broadcasting to concert-${concertId}:`, data.event);
      
      if (socketIOServer) {
        socketIOServer.to(`concert-${concertId}`).emit('concert-update', data);
      }
    } else if (channel.startsWith('admin:')) {
      const adminId = channel.split(':')[1];
      console.log(`[PUBSUB] Broadcasting to admin-${adminId}:`, data.event);
      
      if (socketIOServer) {
        socketIOServer.to(`admin-${adminId}`).emit('admin-update', data);
      }
    }
  } catch (error) {
    console.error('[PUBSUB] Error processing message:', error);
  }
}

/**
 * Publish concert availability update
 * @param {number} concertId - Concert ID
 * @param {object} data - Update data (available tickets, etc)
 */
async function publishConcertUpdate(concertId, data) {
  try {
    const message = {
      event: 'tickets-updated',
      concertId,
      timestamp: new Date().toISOString(),
      ...data
    };

    // Publish via Redis
    if (publisherClient && publisherClient.isOpen) {
      await publisherClient.publish(
        `concert:${concertId}`,
        JSON.stringify(message)
      );
    }

    // Also send directly via Socket.IO
    if (socketIOServer) {
      socketIOServer.to(`concert-${concertId}`).emit('concert-update', message);
    }

    console.log(`[PUBSUB] Published update for concert ${concertId}`);
  } catch (error) {
    console.error('[PUBSUB] Error publishing concert update:', error);
  }
}

/**
 * Publish admin notification
 * @param {number} adminId - Admin ID
 * @param {object} data - Notification data
 */
async function publishAdminNotification(adminId, data) {
  try {
    const message = {
      event: data.event || 'notification',
      adminId,
      timestamp: new Date().toISOString(),
      ...data
    };

    // Publish via Redis
    if (publisherClient && publisherClient.isOpen) {
      await publisherClient.publish(
        `admin:${adminId}`,
        JSON.stringify(message)
      );
    }

    // Also send directly via Socket.IO
    if (socketIOServer) {
      socketIOServer.to(`admin-${adminId}`).emit('admin-update', message);
    }

    console.log(`[PUBSUB] Published notification to admin ${adminId}`);
  } catch (error) {
    console.error('[PUBSUB] Error publishing admin notification:', error);
  }
}

/**
 * Broadcast reservation confirmation
 * @param {string} userEmail - User's email
 * @param {object} reservation - Reservation data
 */
async function broadcastReservationConfirm(userEmail, reservation) {
  try {
    const message = {
      event: 'reservation-confirmed',
      email: userEmail,
      reservationId: reservation.id,
      concertId: reservation.concertId,
      timestamp: new Date().toISOString()
    };

    // Broadcast to Socket.IO room
    if (socketIOServer) {
      socketIOServer.emit('reservation:confirmed', message);
    }

    console.log(`[PUBSUB] Broadcasted reservation confirmation for ${userEmail}`);
  } catch (error) {
    console.error('[PUBSUB] Error broadcasting reservation:', error);
  }
}

/**
 * Close all connections
 */
async function closePubSub() {
  try {
    if (publisherClient) {
      await publisherClient.quit();
    }
    if (subscriberClient) {
      await subscriberClient.quit();
    }
    console.log('[PUBSUB] ✅ Pub/Sub connections closed');
  } catch (error) {
    console.error('[PUBSUB] Error closing connections:', error);
  }
}

module.exports = {
  initializePubSub,
  initializeSocketIO,
  publishConcertUpdate,
  publishAdminNotification,
  broadcastReservationConfirm,
  closePubSub,
  getSocketIO: () => socketIOServer
};
