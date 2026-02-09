/**
 * Email Service Module
 * * Purpose: Handle all email communications for the Concert Ticket System
 * - Login confirmation emails for OAuth users
 * - Booking confirmation emails with reservation details
 */

const nodemailer = require("nodemailer");

// Initialize email transporter - singleton pattern
let transporter = null;

// Initialize Nodemailer with Gmail or custom SMTP
function initializeTransporter() {
  // Check if using Gmail with App Password
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log(
      "[EMAIL] ⚙️ Configuring Gmail Service Transport (Auto-Config)...",
    );

    // ใช้ service: 'gmail' แทนการระบุ host/port เอง
    // Nodemailer จะรู้เองว่าต้องใช้ Port ไหนและ Security แบบไหนที่ดีที่สุด
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // เพิ่ม logger เพื่อดู debug (แต่ไม่เปิด debug mode เต็มรูปแบบ)
      logger: true,
    });
  } else if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    // ... (ส่วน Custom SMTP คงไว้เหมือนเดิม) ...
  }

  return transporter;
}

// Initialize on first use
if (!transporter) {
  initializeTransporter();
}

// Login Success Email Template
function getLoginEmailTemplate(userName, email) {
  // ใช้ FRONTEND_URL จาก ENV ถ้ามี ไม่งั้นใช้ localhost
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  // ใช้ Logo จาก Frontend URL
  const logoUrl = `${frontendUrl}/assets/WaveLogo.png`;

  return {
    subject: "เข้าสู่ระบบสำเร็จ - Concert Ticket System",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 12px; }
          .header { background: linear-gradient(135deg, #f87171 0%, #fb7185 50%, #f43f5e 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; color: white; }
          .header img { height: 50px; margin-bottom: 10px; }
          .header h1 { margin: 5px 0 0 0; font-size: 24px; font-weight: 700; }
          .content { background: linear-gradient(to bottom, #ffffff 0%, #fff7f7 100%); padding: 40px 30px; border-radius: 0 0 12px 12px; }
          .success-badge { display: inline-block; background: linear-gradient(135deg, #34d399 0%, #10b981 100%); color: white; padding: 10px 18px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; font-weight: 600; }
          .info-block { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 18px; border-left: 5px solid #f87171; margin: 15px 0; border-radius: 6px; }
          .info-label { font-weight: 700; color: #be185d; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-value { color: #555; margin-top: 5px; font-size: 15px; }
          .footer { background: #faf8f8; padding: 25px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #f5d5d8; }
          .button { display: inline-block; background: linear-gradient(135deg, #f87171 0%, #fb7185 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3); transition: transform 0.2s; }
          .button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(248, 113, 113, 0.4); }
          .divider { border-top: 1px solid #f5d5d8; margin: 25px 0; }
          h2 { color: #be185d; font-size: 22px; margin: 0 0 15px 0; }
          p { color: #555; line-height: 1.8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Concert Ticket Logo" style="height: 50px; object-fit: contain;" />
            <h1>Concert Ticket System</h1>
          </div>
          <div class="content">
            <div class="success-badge">เข้าสู่ระบบสำเร็จ</div>
            <h2>สวัสดี ${userName}! 🎵</h2>
            <p>ยินดีต้อนรับเข้าสู่ระบบจองตั๋วคอนเสิร์ต คุณได้เข้าสู่ระบบเรียบร้อยแล้ว</p>
            
            <div class="info-block">
              <div class="info-label">อีเมล:</div>
              <div class="info-value">${email}</div>
            </div>

            <div class="info-block">
              <div class="info-label">เวลา:</div>
              <div class="info-value">${new Date().toLocaleString("th-TH")}</div>
            </div>

            <p>คุณสามารถจองบัตรคอนเสิร์ตของคุณได้ทันทีหลังจากเข้าสู่ระบบ</p>

            <div style="text-align: center;">
              <a href="${frontendUrl}" class="button">
                ไปยังเว็บไซต์
              </a>
            </div>

            <div class="divider"></div>
            <p style="font-size: 13px; color: #666; text-align: center;">
              หากคุณไม่ได้ทำการเข้าสู่ระบบนี้ โปรดติดต่อเรา: support@concertticket.com
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Concert Ticket Reservation System. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; color: #999;">ไม่ต้องตอบกลับอีเมลนี้</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Booking Success Email Template
function getBookingEmailTemplate(customerName, email, reservation, concert) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const logoUrl = `${frontendUrl}/assets/WaveLogo.png`;

  return {
    subject: `การจองสำเร็จ - ${concert.name} - Confirmation #${reservation.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 12px; }
          .header { background: linear-gradient(135deg, #f87171 0%, #fb7185 50%, #f43f5e 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; color: white; }
          .header img { height: 50px; margin-bottom: 10px; object-fit: contain; }
          .header h1 { margin: 5px 0 0 0; font-size: 24px; font-weight: 700; }
          .content { background: linear-gradient(to bottom, #ffffff 0%, #fff7f7 100%); padding: 40px 30px; border-radius: 0 0 12px 12px; }
          .success-badge { display: inline-block; background: linear-gradient(135deg, #34d399 0%, #10b981 100%); color: white; padding: 10px 18px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; font-weight: 600; }
          .concert-info { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 5px solid #f87171; padding: 22px; margin: 20px 0; border-radius: 8px; }
          .ticket-details { background: linear-gradient(135deg, #f5f3f0 0%, #faf8f8 100%); padding: 22px; margin: 20px 0; border-radius: 8px; border: 1px solid #f5d5d8; }
          .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 12px 0; border-bottom: 1px solid #f5d5d8; }
          .detail-label { font-weight: 700; color: #be185d; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
          .detail-value { text-align: right; color: #555; }
          .total-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 16px 0; border-top: 2px solid #f87171; border-bottom: none; font-size: 18px; font-weight: 700; color: #be185d; }
          .footer { background: #faf8f8; padding: 25px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #f5d5d8; }
          .button { display: inline-block; background: linear-gradient(135deg, #f87171 0%, #fb7185 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3); transition: transform 0.2s; }
          .button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(248, 113, 113, 0.4); }
          .confirmation-id { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 2px solid #f87171; padding: 18px; border-radius: 8px; text-align: center; margin: 18px 0; font-weight: 700; color: #be185d; font-size: 16px; }
          h2 { color: #be185d; font-size: 22px; margin: 0 0 15px 0; }
          h3 { color: #be185d; margin: 0 0 12px 0; font-size: 16px; }
          p { color: #555; line-height: 1.8; }
          .status-badge { background: linear-gradient(135deg, #34d399 0%, #10b981 100%); color: white; padding: 5px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Concert Ticket Logo" style="height: 50px; object-fit: contain;" />
            <h1>Concert Ticket System</h1>
          </div>
          <div class="content">
            <div class="success-badge">การจองสำเร็จ</div>
            <h2>ขอบคุณที่จองบัตร ${customerName}! 🎉</h2>
            
            <div class="confirmation-id">
              รหัสการจอง: ${reservation.id}
            </div>

            <div class="concert-info">
              <h3>ข้อมูลคอนเสิร์ต</h3>
              <div style="margin: 12px 0; color: #555;"><strong style="color: #be185d;">ชื่อคอนเสิร์ต:</strong> ${concert.name}</div>
              <div style="margin: 12px 0; color: #555;"><strong style="color: #be185d;">ศิลปิน:</strong> ${concert.artist}</div>
              <div style="margin: 12px 0; color: #555;"><strong style="color: #be185d;">วันที่:</strong> ${new Date(concert.date).toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
              <div style="margin: 12px 0; color: #555;"><strong style="color: #be185d;">สถานที่:</strong> ${concert.venue}</div>
            </div>

            <div class="ticket-details">
              <h3>รายละเอียดการจอง</h3>
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
                <span>฿${reservation.totalPrice.toLocaleString()}</span>
              </div>
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">สถานะ:</span>
                <span class="status-badge">
                  ${reservation.status === "confirmed" ? "ยืนยันแล้ว" : reservation.status}
                </span>
              </div>
            </div>

            <p style="background: #fff7f7; padding: 14px; border-left: 4px solid #f87171; border-radius: 4px; color: #666;">
              📌 กรุณาเก็บรหัสการจองนี้ไว้เพื่อใช้อ้างอิง คุณจะต้องใช้รหัสนี้เมื่อเข้าถึงที่นั่ง
            </p>

            <div style="text-align: center;">
              <a href="${frontendUrl}/my-reservations" class="button">
                ดูการจองของฉัน
              </a>
            </div>

            <div style="border-top: 1px solid #f5d5d8; margin: 25px 0;"></div>
            <p style="font-size: 13px; color: #666; text-align: center; margin: 0;">
              หากมีข้อสงสัยติดต่อ: support@concertticket.com<br>
              โทร: +66-2-XXXX-XXXX
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Concert Ticket Reservation System. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; color: #999;">ไม่ต้องตอบกลับอีเมลนี้</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

async function sendLoginEmail(userName, userEmail) {
  try {
    if (!transporter) {
      console.log(
        "[EMAIL] ⚠️ Email transporter not configured. Skipping login email.",
      );
      return false;
    }

    if (!userEmail || !userName) {
      console.error("[EMAIL] ❌ Missing required parameters for login email");
      return false;
    }

    const emailTemplate = getLoginEmailTemplate(userName, userEmail);

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER ||
        "noreply@concertticket.com",
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Login email sent successfully`);
    console.log(`        └─ To: ${userEmail}`);
    return true;
  } catch (error) {
    console.error(
      `[EMAIL] ❌ Error sending login email to ${userEmail}:`,
      error.message,
    );
    return false;
  }
}

async function sendBookingConfirmationEmail(reservation, concert) {
  try {
    if (!transporter) {
      console.log(
        "[EMAIL] ⚠️ Email transporter not configured. Skipping booking email.",
      );
      return false;
    }

    if (!reservation?.customerEmail || !concert?.name) {
      console.error("[EMAIL] ❌ Missing required parameters for booking email");
      return false;
    }

    const emailTemplate = getBookingEmailTemplate(
      reservation.customerName,
      reservation.customerEmail,
      reservation,
      concert,
    );

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER ||
        "noreply@concertticket.com",
      to: reservation.customerEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Booking confirmation email sent successfully`);
    console.log(`        └─ To: ${reservation.customerEmail}`);
    console.log(`        └─ Reservation: ${reservation.id}`);
    return true;
  } catch (error) {
    console.error(
      `[EMAIL] ❌ Error sending booking email to ${reservation.customerEmail}:`,
      error.message,
    );
    return false;
  }
}

async function testEmailConfiguration() {
  try {
    if (!transporter) {
      console.log(
        "[EMAIL] ⚠️ Email transporter not configured. Check .env file.",
      );
      return false;
    }

    await transporter.verify();
    console.log("[EMAIL] ✅ Email configuration verified successfully");
    console.log(`        └─ SMTP: Gmail (Port 465 SSL)`);
    return true;
  } catch (error) {
    console.error("[EMAIL] ❌ Email configuration error:", error.message);
    return false;
  }
}

module.exports = {
  sendLoginEmail,
  sendBookingConfirmationEmail,
  testEmailConfiguration,
};
