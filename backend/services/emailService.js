/**
 * Email Service Module
 * 
 * Purpose: Handle all email communications for the Concert Ticket System
 * - Login confirmation emails for OAuth users
 * - Booking confirmation emails with reservation details
 * 
 * Architecture:
 * - Sender: EMAIL_USER from .env (Gmail account with App Password)
 * - Recipient: User's actual email (from Google OAuth or booking form)
 * - Transport: Gmail SMTP via Nodemailer with OAuth credentials
 * 
 * Configuration (.env requirements):
 * - EMAIL_USER: Gmail address (e.g., 6710110264@psu.ac.th)
 * - EMAIL_PASSWORD: Gmail App Password (16 characters)
 * - EMAIL_FROM: Display name for sender (e.g., noreply@concertticket.com)
 * - SEND_LOGIN_EMAIL: Enable/disable login emails (default: true)
 * - SEND_BOOKING_EMAIL: Enable/disable booking emails (default: true)
 */

const nodemailer = require('nodemailer');

// Initialize email transporter - singleton pattern
let transporter = null;

// Initialize Nodemailer with Gmail or custom SMTP
function initializeTransporter() {
  // Check if using Gmail with App Password
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    // Or use custom SMTP server
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      } : undefined
    });
  }

  return transporter;
}

// Initialize on first use
if (!transporter) {
  initializeTransporter();
}

// Login Success Email Template
function getLoginEmailTemplate(userName, email) {
  return {
    subject: '✅ เข้าสู่ระบบสำเร็จ - Concert Ticket System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; color: white; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; }
          .info-block { background: #f3f4f6; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
          .info-label { font-weight: 600; color: #667eea; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 Concert Ticket System</h1>
          </div>
          <div class="content">
            <div class="success-badge">✅ เข้าสู่ระบบสำเร็จ</div>
            <h2>สวัสดี ${userName}!</h2>
            <p>ยินดีต้อนรับเข้าสู่ระบบจองตั๋วคอนเสิร์ต คุณได้เข้าสู่ระบบเรียบร้อยแล้ว</p>
            
            <div class="info-block">
              <div class="info-label">📧 อีเมล:</div>
              <div>${email}</div>
            </div>

            <div class="info-block">
              <div class="info-label">🕒 เวลา:</div>
              <div>${new Date().toLocaleString('th-TH')}</div>
            </div>

            <p>คุณสามารถจองบัตรคอนเสิร์ตของคุณได้ทันทีหลังจากเข้าสู่ระบบ</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
                👉 ไปยังเว็บไซต์
              </a>
            </div>

            <div class="divider"></div>
            <p style="font-size: 14px; color: #6b7280;">
              ⚠️ หากคุณไม่ได้ทำการเข้าสู่ระบบนี้ โปรดติดต่อเรา: support@concertticket.com
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Concert Ticket Reservation System. All rights reserved.</p>
            <p>ไม่ต้องตอบกลับอีเมลนี้</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// Booking Success Email Template
function getBookingEmailTemplate(customerName, email, reservation, concert) {
  return {
    subject: `🎫 การจองสำเร็จ - ${concert.name} - Confirmation #${reservation.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; color: white; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; }
          .concert-info { background: #f0f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .ticket-details { background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: 600; color: #667eea; }
          .detail-value { text-align: right; }
          .total-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 15px 0; border-top: 2px solid #667eea; font-size: 18px; font-weight: 700; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .confirmation-id { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 Concert Ticket System</h1>
          </div>
          <div class="content">
            <div class="success-badge">✅ การจองสำเร็จ</div>
            <h2>ขอบคุณที่จองบัตร ${customerName}!</h2>
            
            <div class="confirmation-id">
              🎫 รหัสการจอง: <strong>${reservation.id}</strong>
            </div>

            <div class="concert-info">
              <h3 style="margin-top: 0; color: #667eea;">🎤 ข้อมูลคอนเสิร์ต</h3>
              <div style="margin: 10px 0;"><strong>ชื่อคอนเสิร์ต:</strong> ${concert.name}</div>
              <div style="margin: 10px 0;"><strong>ศิลปิน:</strong> ${concert.artist}</div>
              <div style="margin: 10px 0;"><strong>วันที่:</strong> ${new Date(concert.date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div style="margin: 10px 0;"><strong>สถานที่:</strong> ${concert.venue}</div>
            </div>

            <div class="ticket-details">
              <h3 style="margin-top: 0; color: #667eea;">🎫 รายละเอียดการจอง</h3>
              <div class="detail-row">
                <span class="detail-label">ผู้จอง:</span>
                <span class="detail-value">${reservation.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">อีเมล:</span>
                <span class="detail-value">${reservation.customerEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">จำนวนบัตร:</span>
                <span class="detail-value">${reservation.quantity} ใบ</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ราคาต่อใบ:</span>
                <span class="detail-value">฿${concert.price.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>ราคารวม:</span>
                <span style="color: #10b981;">฿${reservation.totalPrice.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">สถานะ:</span>
                <span class="detail-value">
                  <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                    ${reservation.status === 'confirmed' ? 'ยืนยันแล้ว' : reservation.status}
                  </span>
                </span>
              </div>
            </div>

            <p>📌 กรุณาเก็บรหัสการจองนี้ไว้เพื่อใช้อ้างอิง คุณจะต้องใช้รหัสนี้เมื่อเข้าถึงที่นั่ง</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL ? process.env.FRONTEND_URL + '/my-reservations' : 'http://localhost:3000/my-reservations'}" class="button">
                📋 ดูการจองของฉัน
              </a>
            </div>

            <div class="divider" style="border-top: 1px solid #e5e7eb; margin: 20px 0;"></div>
            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              📧 หากมีข้อสงสัยติดต่อ: support@concertticket.com<br>
              📞 โทร: +66-2-XXXX-XXXX
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Concert Ticket Reservation System. All rights reserved.</p>
            <p>ไม่ต้องตอบกลับอีเมลนี้</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

/**
 * Send login confirmation email to authenticated user
 * 
 * @param {string} userName - User's display name (from Google OAuth)
 * @param {string} userEmail - User's email address (from Google OAuth)
 * @returns {Promise<boolean>} - True if email sent successfully, false otherwise
 * 
 * @example
 * // When user logs in via Google OAuth
 * const result = await sendLoginEmail('Alice Smith', 'alice@gmail.com');
 * // Email sent FROM: noreply@concertticket.com
 * // Email sent TO: alice@gmail.com
 * 
 * Flow:
 * 1. Validate email transporter is configured
 * 2. Generate HTML email template with personalized content
 * 3. Send email via Gmail SMTP
 * 4. Log message ID for tracking
 * 5. Return success/failure status
 */
async function sendLoginEmail(userName, userEmail) {
  try {
    // Validate prerequisites
    if (!transporter) {
      console.log('[EMAIL] ⚠️ Email transporter not configured. Skipping login email.');
      return false;
    }

    if (!userEmail || !userName) {
      console.error('[EMAIL] ❌ Missing required parameters for login email');
      return false;
    }

    const emailTemplate = getLoginEmailTemplate(userName, userEmail);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@concertticket.com',
      to: userEmail,  // CRITICAL: Send to user's email, not EMAIL_USER
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Login email sent successfully`);
    console.log(`        └─ From: ${mailOptions.from}`);
    console.log(`        └─ To: ${userEmail}`);
    console.log(`        └─ Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ Error sending login email to ${userEmail}:`, error.message);
    console.error(`        └─ Error details:`, error.code || error.response?.message);
    return false;
  }
}

/**
 * Send booking confirmation email to customer
 * 
 * @param {Object} reservation - Booking reservation object
 * @param {string} reservation.id - Unique reservation ID
 * @param {string} reservation.customerName - Customer's name
 * @param {string} reservation.customerEmail - Customer's email address
 * @param {number} reservation.quantity - Number of tickets booked
 * @param {number} reservation.totalPrice - Total booking price
 * @param {Object} concert - Concert details object
 * @param {string} concert.name - Concert name
 * @param {string} concert.artist - Artist/performer name
 * @param {string} concert.date - Concert date
 * @param {string} concert.venue - Venue location
 * @returns {Promise<boolean>} - True if email sent successfully, false otherwise
 * 
 * @example
 * // When user books tickets
 * const result = await sendBookingConfirmationEmail(
 *   { id: 'RES123', customerName: 'Alice', customerEmail: 'alice@gmail.com', quantity: 2, totalPrice: 1000 },
 *   { name: 'Concert XYZ', artist: 'Artist ABC', date: '2026-02-20', venue: 'Bangkok' }
 * );
 * // Email sent FROM: noreply@concertticket.com
 * // Email sent TO: alice@gmail.com (not system email)
 * 
 * Flow:
 * 1. Validate email transporter and input data
 * 2. Generate professional HTML email with reservation details
 * 3. Send via Gmail SMTP
 * 4. Log transaction for audit trail
 */
async function sendBookingConfirmationEmail(reservation, concert) {
  try {
    // Validate prerequisites
    if (!transporter) {
      console.log('[EMAIL] ⚠️ Email transporter not configured. Skipping booking email.');
      return false;
    }

    if (!reservation?.customerEmail || !concert?.name) {
      console.error('[EMAIL] ❌ Missing required parameters for booking email');
      return false;
    }

    const emailTemplate = getBookingEmailTemplate(
      reservation.customerName,
      reservation.customerEmail,
      reservation,
      concert
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@concertticket.com',
      to: reservation.customerEmail,  // CRITICAL: Send to customer's email, not EMAIL_USER
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Booking confirmation email sent successfully`);
    console.log(`        └─ From: ${mailOptions.from}`);
    console.log(`        └─ To: ${reservation.customerEmail}`);
    console.log(`        └─ Reservation: ${reservation.id}`);
    console.log(`        └─ Concert: ${concert.name}`);
    console.log(`        └─ Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ Error sending booking email to ${reservation.customerEmail}:`, error.message);
    console.error(`        └─ Reservation ID: ${reservation.id}`);
    console.error(`        └─ Error details:`, error.code || error.response?.message);
    return false;
  }
}

/**
 * Verify email transporter configuration
 * 
 * Used during application startup to ensure email credentials are valid
 * and the SMTP connection can be established with Gmail
 * 
 * @returns {Promise<boolean>} - True if configured correctly, false otherwise
 * 
 * Checks:
 * - EMAIL_USER and EMAIL_PASSWORD are set in .env
 * - Gmail SMTP connection is reachable
 * - Authentication credentials are valid
 * 
 * @example
 * if (await testEmailConfiguration()) {
 *   console.log('Email system ready to send notifications');
 * } else {
 *   console.log('Email system unavailable');
 * }
 */
async function testEmailConfiguration() {
  try {
    if (!transporter) {
      console.log('[EMAIL] ⚠️ Email transporter not configured. Check .env file.');
      return false;
    }

    // Verify SMTP connection and credentials
    await transporter.verify();
    console.log('[EMAIL] ✅ Email configuration verified successfully');
    console.log(`        └─ Sender: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
    console.log(`        └─ SMTP: Gmail (${process.env.EMAIL_USER})`);
    console.log(`        └─ Status: Ready to send emails`);
    return true;
  } catch (error) {
    console.error('[EMAIL] ❌ Email configuration error:', error.message);
    console.error('[EMAIL] ⚠️  Check your .env file:');
    console.error(`        - EMAIL_USER: ${process.env.EMAIL_USER ? '✓ Set' : '✗ Missing'}`);
    console.error(`        - EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Missing'}`);
    console.error(`        - EMAIL_FROM: ${process.env.EMAIL_FROM ? '✓ Set' : '✗ Missing'}`);
    return false;
  }
}

module.exports = {
  sendLoginEmail,
  sendBookingConfirmationEmail,
  testEmailConfiguration
};
