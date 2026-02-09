/**
 * Email Service Module - API Version (Bypasses SMTP Blocking)
 */

// ไม่จำเป็นต้องใช้ nodemailer ในการส่งแล้ว แต่เก็บไว้เผื่ออนาคตหรือ Template
const nodemailer = require('nodemailer'); 

// ฟังก์ชันสำหรับส่งอีเมลผ่าน Brevo API (HTTPS)
async function sendEmailViaBrevoAPI(toEmail, toName, subject, htmlContent) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com'; // อีเมลผู้ส่ง (ควรตรงกับที่ verify ใน Brevo)
  const senderName = process.env.EMAIL_FROM_NAME || 'Concert Ticket System';

  // แยกชื่อและอีเมลจากรูปแบบ "Name <email>" ถ้ามี
  let finalSenderEmail = senderEmail;
  let finalSenderName = senderName;
  
  if (process.env.EMAIL_FROM) {
    const match = process.env.EMAIL_FROM.match(/(.*)<(.*)>/);
    if (match) {
      finalSenderName = match[1].trim();
      finalSenderEmail = match[2].trim();
    } else {
      finalSenderEmail = process.env.EMAIL_FROM;
    }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: finalSenderName,
          email: finalSenderEmail
        },
        to: [
          {
            email: toEmail,
            name: toName
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[EMAIL] ❌ API Error:', JSON.stringify(errorData));
      return false;
    }

    const data = await response.json();
    console.log(`[EMAIL] ✅ Email sent via API MessageId: ${data.messageId}`);
    return true;

  } catch (error) {
    console.error('[EMAIL] ❌ Failed to call Brevo API:', error.message);
    return false;
  }
}

// --- Email Templates (เหมือนเดิม) ---

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

// --- Main Export Functions ---

async function sendLoginEmail(userName, userEmail) {
  // ถ้าไม่มี API Key ให้ลองกลับไปใช้ SMTP แบบเดิม (เผื่อไว้) หรือ Log Error
  if (!process.env.BREVO_API_KEY) {
     console.error('[EMAIL] ❌ BREVO_API_KEY is missing. Cannot send email via API.');
     return false;
  }

  const template = getLoginEmailTemplate(userName, userEmail);
  return await sendEmailViaBrevoAPI(userEmail, userName, template.subject, template.html);
}

async function sendBookingConfirmationEmail(reservation, concert) {
  if (!process.env.BREVO_API_KEY) {
     console.error('[EMAIL] ❌ BREVO_API_KEY is missing. Cannot send email via API.');
     return false;
  }

  const template = getBookingEmailTemplate(
    reservation.customerName, 
    reservation.customerEmail, 
    reservation, 
    concert
  );

  return await sendEmailViaBrevoAPI(
    reservation.customerEmail, 
    reservation.customerName, 
    template.subject, 
    template.html
  );
}

// ฟังก์ชัน Test ไม่จำเป็นต้องใช้แล้ว แต่คงไว้ไม่ให้ error
async function testEmailConfiguration() {
  if (process.env.BREVO_API_KEY) {
    console.log('[EMAIL] ✅ Using Brevo API Mode');
    return true;
  }
  return false;
}

module.exports = {
  sendLoginEmail,
  sendBookingConfirmationEmail,
  testEmailConfiguration
};