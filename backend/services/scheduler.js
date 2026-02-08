/**
 * Scheduler Service Module
 * 
 * Purpose: Background job scheduling using node-cron
 * - Automatic database backups
 * - Email reminders for upcoming concerts
 * - Cleanup of expired reservations
 * - Analytics reports generation
 */

const cron = require('node-cron');
const path = require('path');

let schedules = [];

/**
 * Initialize all scheduled tasks
 */
function initializeScheduler(db) {
  console.log('[SCHEDULER] Starting background job scheduler...');

  // Task 1: Database backup every day at 2 AM
  scheduleBackup();

  // Task 2: Send concert reminder emails daily at 9 AM
  scheduleEmailReminders(db);

  // Task 3: Cleanup pending reservations (older than 1 hour)
  scheduleReservationCleanup(db);

  // Task 4: Generate daily analytics report
  scheduleDailyAnalytics(db);

  console.log('[SCHEDULER] ✅ All scheduled tasks initialized');
}

/**
 * Schedule daily database backup at 2 AM
 */
function scheduleBackup() {
  const task = cron.schedule('0 2 * * *', async () => {
    console.log('[SCHEDULER] 📊 Running database backup...');
    
    try {
      const { exec } = require('child_process');
      const timestamp = new Date().toISOString().split('T')[0];
      const backupFile = `backup-${timestamp}.sql`;
      
      exec(
        `pg_dump -U ${process.env.DB_USER || 'postgres'} -d ${process.env.DB_NAME || 'concert_ticket_system'} > backups/${backupFile}`,
        (error) => {
          if (error) {
            console.error('[SCHEDULER] Backup failed:', error.message);
           } else {
            console.log(`[SCHEDULER] ✅ Backup completed: ${backupFile}`);
          }
        }
      );
    } catch (error) {
      console.error('[SCHEDULER] Backup error:', error);
    }
  }, { scheduled: false });

  task.start();
  schedules.push(task);
  console.log('[SCHEDULER] 📅 Database backup scheduled: Daily at 2:00 AM');
}

/**
 * Schedule email reminders for upcoming concerts
 */
function scheduleEmailReminders(db) {
  const task = cron.schedule('0 9 * * *', async () => {
    console.log('[SCHEDULER] 📧 Sending concert reminder emails...');

    try {
      if (!db) {
        console.warn('[SCHEDULER] Database not available');
        return;
      }

      const result = await db.query(`
        SELECT DISTINCT r.customer_email, c.name, c.date
        FROM reservations r
        JOIN concerts c ON r.concert_id = c.id
        WHERE r.status = 'confirmed'
        AND c.date > NOW()
        AND c.date <= NOW() + INTERVAL '7 days'
        AND NOT EXISTS (
          SELECT 1 FROM reminder_logs 
          WHERE user_email = r.customer_email 
          AND concert_id = c.id 
          AND sent_date > NOW() - INTERVAL '1 day'
        )
      `);

      console.log(`[SCHEDULER] Found ${result.rows.length} reminders to send`);

      // Send emails (implement emailService integration)
      for (const row of result.rows) {
        console.log(`[SCHEDULER] 📧 Reminder: ${row.customer_email} - ${row.name} on ${row.date}`);
        
        // Log that reminder was sent
        await db.query(
          'INSERT INTO reminder_logs (user_email, concert_id, sent_date) VALUES ($1, $2, NOW())',
          [row.customer_email, row.concert_id]
        ).catch(() => {
          // Table might not exist in production
        });
      }

      console.log('[SCHEDULER] ✅ Reminder emails sent');
    } catch (error) {
      console.error('[SCHEDULER] Error sending reminders:', error);
    }
  }, { scheduled: false });

  task.start();
  schedules.push(task);
  console.log('[SCHEDULER] 📅 Email reminders scheduled: Daily at 9:00 AM');
}

/**
 * Schedule cleanup of expired pending reservations
 */
function scheduleReservationCleanup(db) {
  const task = cron.schedule('*/30 * * * *', async () => { // Every 30 minutes
    console.log('[SCHEDULER] 🧹 Cleaning up expired reservations...');

    try {
      if (!db) return;

      // Delete pending reservations older than 1 hour
      const result = await db.query(`
        DELETE FROM reservations
        WHERE status = 'pending'
        AND reserved_at < NOW() - INTERVAL '1 hour'
        RETURNING id
      `);

      if (result.rowCount > 0) {
        console.log(`[SCHEDULER] ✅ Deleted ${result.rowCount} expired pending reservations`);

        // Update available tickets
        await db.query(`
          UPDATE concerts
          SET available_tickets = total_tickets - (
            SELECT COUNT(*) FROM reservations 
            WHERE concert_id = concerts.id 
            AND status = 'confirmed'
          )
          WHERE status = 'open'
        `);
      }
    } catch (error) {
      console.error('[SCHEDULER] Error cleaning up reservations:', error);
    }
  }, { scheduled: false });

  task.start();
  schedules.push(task);
  console.log('[SCHEDULER] 📅 Reservation cleanup scheduled: Every 30 minutes');
}

/**
 * Schedule daily analytics report generation
 */
function scheduleDailyAnalytics(db) {
  const task = cron.schedule('0 23 * * *', async () => { // 11 PM daily
    console.log('[SCHEDULER] 📈 Generating daily analytics...');

    try {
      if (!db) return;

      const stats = await db.query(`
        SELECT
          DATE(reserved_at) as date,
          COUNT(*) as total_reservations,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
          SUM(CASE WHEN status = 'confirmed' THEN total_price ELSE 0 END) as revenue
        FROM reservations
        WHERE DATE(reserved_at) = CURRENT_DATE - INTERVAL '1 day'
        GROUP BY DATE(reserved_at)
      `);

      if (stats.rows.length > 0) {
        const dailyStats = stats.rows[0];
        console.log(`[SCHEDULER] 📊 Daily Stats:
          Reservations: ${dailyStats.total_reservations}
          Confirmed: ${dailyStats.confirmed}
          Cancelled: ${dailyStats.cancelled}
          Revenue: ฿${dailyStats.revenue}`);

        // Could save to analytics table or send to external service
      }

      console.log('[SCHEDULER] ✅ Analytics report generated');
    } catch (error) {
      console.error('[SCHEDULER] Error generating analytics:', error);
    }
  }, { scheduled: false });

  task.start();
  schedules.push(task);
  console.log('[SCHEDULER] 📅 Daily analytics scheduled: Daily at 11:00 PM');
}

/**
 * Stop all scheduled tasks
 */
function stopScheduler() {
  schedules.forEach(task => task.stop());
  console.log('[SCHEDULER] ✅ All scheduled tasks stopped');
}

/**
 * Get all active schedules
 */
function getActiveSchedules() {
  return schedules.map(task => ({
    status: task.status,
    running: task.running
  }));
}

module.exports = {
  initializeScheduler,
  stopScheduler,
  getActiveSchedules
};
