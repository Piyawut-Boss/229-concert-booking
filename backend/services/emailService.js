/**
 * Email Service Module (Updated for Brevo/SMTP Support)
 */

const nodemailer = require('nodemailer');

let transporter = null;

function initializeTransporter() {
  // 1. ตรวจสอบการตั้งค่าแบบ Custom SMTP (เช่น Brevo) เป็นอันดับแรก
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    console.log('[EMAIL] ⚙️ Configuring Custom SMTP (Brevo/SendGrid)...');
    console.log(`        └─ Host: ${process.env.SMTP_HOST}`);
    console.log(`        └─ Port: ${process.env.SMTP_PORT}`);
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      // secure เป็น false ถ้าใช้ Port 587, เป็น true ถ้าใช้ 465
      secure: process.env.SMTP_SECURE === 'true', 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      // การตั้งค่า Timeout ป้องกันการค้าง
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  
  // 2. รองรับ Gmail (เผื่อต้องการกลับมาใช้ หรือยังไม่ได้ลบตัวแปรเก่า)
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('[EMAIL] ⚙️ Configuring Gmail Transporter...');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  return transporter;
}

// เริ่มต้นตรวจสอบการเชื่อมต่อทันทีที่ Server Start
if (!transporter) {
  initializeTransporter();
  if (transporter) {
    transporter.verify((error, success) => {
      if (error) {
        console.error('[EMAIL] ❌ Startup Connection Error:', error.message);
      } else {
        console.log('[EMAIL] ✅ Server is ready to send emails');
      }
    });
  } else {
    console.log('[EMAIL] ⚠️ No email configuration found.');
  }
}

// --- Email Templates ---

function getLoginEmailTemplate(userName, email) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    subject: 'เข้าสู่ระบบสำเร็จ - Concert Ticket System',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #dc2626;">Concert Ticket System</h2>
        </div>
        <h3>สวัสดี ${userName},</h3>
        <p>คุณได้ทำการเข้าสู่ระบบเรียบร้อยแล้ว</p>
        <p><strong>เวลา:</strong> ${new Date().toLocaleString('th-TH')}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ไปยังเว็บไซต์</a>
        </div>
        <p style="color: #666; font-size: 12px;">หากไม่ใช่คุณ โปรดติดต่อเราทันที</p>
      </div>
    `
  };
}

function getBookingEmailTemplate(customerName, email, reservation, concert) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    subject: `การจองสำเร็จ - ${concert.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0;">การจองสำเร็จ!</h2>
          <p>Confirmation ID: <strong>${reservation.id}</strong></p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">${concert.name}</h3>
          <p><strong>ศิลปิน:</strong> ${concert.artist}</p>
          <p><strong>วันที่:</strong> ${new Date(concert.date).toLocaleDateString('th-TH')}</p>
          <p><strong>สถานที่:</strong> ${concert.venue}</p>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>ผู้จอง:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>จำนวน:</strong> ${reservation.quantity} ใบ</p>
          <p style="margin: 5px 0; font-size: 18px; color: #dc2626;"><strong>ราคารวม: ฿${reservation.totalPrice.toLocaleString()}</strong></p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${frontendUrl}/my-reservations" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ดูตั๋วของฉัน</a>
        </div>
      </div>
    `
  };
}

// --- Send Functions ---

async function sendLoginEmail(userName, userEmail) {
  try {
    if (!transporter) initializeTransporter();
    if (!transporter) return false;

    const template = getLoginEmailTemplate(userName, userEmail);
    
    // เลือกผู้ส่ง: EMAIL_FROM > SMTP_USER > EMAIL_USER
    const sender = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

    await transporter.sendMail({
      from: sender,
      to: userEmail,
      subject: template.subject,
      html: template.html
    });

    console.log(`[EMAIL] ✅ Login email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send login email: ${error.message}`);
    return false;
  }
}

async function sendBookingConfirmationEmail(reservation, concert) {
  try {
    if (!transporter) initializeTransporter();
    if (!transporter) return false;

    const template = getBookingEmailTemplate(
      reservation.customerName, 
      reservation.customerEmail, 
      reservation, 
      concert
    );

    // เลือกผู้ส่ง: EMAIL_FROM > SMTP_USER > EMAIL_USER
    const sender = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

    await transporter.sendMail({
      from: sender,
      to: reservation.customerEmail,
      subject: template.subject,
      html: template.html
    });

    console.log(`[EMAIL] ✅ Booking email sent to ${reservation.customerEmail}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send booking email: ${error.message}`);
    return false;
  }
}

// ฟังก์ชันนี้เก็บไว้เพื่อให้ server.js เรียกใช้ได้ แต่ข้างในไม่ทำอะไรเพราะเรา verify ตอน start แล้ว
async function testEmailConfiguration() {
  return true;
}

module.exports = {
  sendLoginEmail,
  sendBookingConfirmationEmail,
  testEmailConfiguration
};