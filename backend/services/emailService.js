/**
 * Email Service Module - Connection Pooling Version
 */

const nodemailer = require('nodemailer');

let transporter = null;

function initializeTransporter() {
  // ตรวจสอบว่ามีตัวแปรสำหรับ Gmail หรือไม่
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('[EMAIL] ⚙️ Configuring Gmail Transporter (Pooled)...');
    
    transporter = nodemailer.createTransport({
      // [ไม้ตาย] ใช้ pool: true เพื่อลดการสร้าง connection ใหม่ซ้ำซ้อน
      pool: true,
      maxConnections: 1, // จำกัดแค่ 1 ท่อเพื่อลดความเสี่ยงโดนบล็อก
      maxMessages: 100,
      
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // ใช้ SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        // บังคับไม่ตรวจสอบ Certificate (ช่วยเรื่อง Handshake ในบาง Network)
        rejectUnauthorized: false
      },
      // บังคับ IPv4 และตั้ง Timeout
      family: 4, 
      connectionTimeout: 10000, // ลดเวลาให้ Error เร็วขึ้นถ้าต่อไม่ได้
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
    
  } else if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
     // ส่วนรองรับ Custom SMTP (เช่น Brevo)
     console.log('[EMAIL] ⚙️ Configuring Custom SMTP...');
     transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  return transporter;
}

// เรียกใช้ฟังก์ชันทันทีเพื่อเริ่มการเชื่อมต่อ
if (!transporter) {
  initializeTransporter();
  // ทดสอบการเชื่อมต่อทันทีที่เริ่ม Server
  transporter.verify((error, success) => {
    if (error) {
      console.error('[EMAIL] ❌ Startup Connection Error:', error.message);
    } else {
      console.log('[EMAIL] ✅ Server is ready to take our messages');
    }
  });
}

// ... (คงฟังก์ชัน getLoginEmailTemplate, getBookingEmailTemplate ไว้เหมือนเดิม) ...

async function sendLoginEmail(userName, userEmail) {
  try {
    if (!transporter) initializeTransporter();

    const emailTemplate = getLoginEmailTemplate(userName, userEmail);
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    // ใช้ sendMail ตามปกติ
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Login email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send login email:`, error.message);
    return false;
  }
}

async function sendBookingConfirmationEmail(reservation, concert) {
  try {
    if (!transporter) initializeTransporter();

    const emailTemplate = getBookingEmailTemplate(
      reservation.customerName, 
      reservation.customerEmail, 
      reservation, 
      concert
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: reservation.customerEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Booking email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send booking email:`, error.message);
    return false;
  }
}

async function testEmailConfiguration() {
  // ฟังก์ชันนี้ไม่จำเป็นต้องใช้แล้วเพราะเรา verify ตอนเริ่ม
  return true;
}

module.exports = {
  sendLoginEmail,
  sendBookingConfirmationEmail,
  testEmailConfiguration
};