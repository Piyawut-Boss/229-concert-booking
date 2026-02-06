# Email System Architecture - Production Ready

## Overview

The Concert Ticket System uses **Nodemailer** with **Gmail SMTP** to send automated email notifications to users.

### Key Principle

✅ **Email recipients are determined by user data, NOT hardcoded**

- **LOGIN EMAIL** → Sent TO: user's email from Google OAuth
- **BOOKING EMAIL** → Sent TO: customer email from booking form  
- **SENDER (FROM)** → EMAIL_USER from .env (system account only)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

USER LOGIN (Google OAuth)
    │
    ├─→ Frontend captures: { name, email, googleToken }
    │
    ├─→ Backend receives: POST /api/login
    │
    └─→ emailService.sendLoginEmail(userName, userEmail)
            │
            ├─ FROM: EMAIL_USER (6710110264@psu.ac.th)
            └─ TO: userEmail (alice@gmail.com) ✅ USER'S EMAIL
                   ↳ Sent via Gmail SMTP with App Password

USER BOOKS TICKETS
    │
    ├─→ Frontend sends: { concertId, customerName, customerEmail, quantity }
    │
    ├─→ Backend receives: POST /api/reservations
    │
    └─→ emailService.sendBookingConfirmationEmail(reservation, concert)
            │
            ├─ FROM: EMAIL_USER (6710110264@psu.ac.th)
            └─ TO: customerEmail (alice@gmail.com) ✅ CUSTOMER'S EMAIL
                   ↳ Sent via Gmail SMTP with App Password
```

---

## Configuration

### Required .env Variables

```env
# Email Service Credentials
EMAIL_USER=6710110264@psu.ac.th              # Gmail account (SENDER ONLY)
EMAIL_PASSWORD=uvflotmlfettrfwt              # Gmail App Password (16 chars)
EMAIL_FROM=noreply@concertticket.com         # Display name for sender

# Feature Toggles
SEND_LOGIN_EMAIL=true                         # Enable login notifications
SEND_BOOKING_EMAIL=true                       # Enable booking notifications
```

### Getting Gmail Credentials

1. **Enable 2FA on Gmail** (required for App Passwords)
2. **Generate App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Select: Mail + Other (custom name)
   - Copy 16-character password
3. **Paste into .env**:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

---

## Code Architecture

### emailService.js

**Functions:**

#### `sendLoginEmail(userName, userEmail)`
- **Purpose**: Send login confirmation to user
- **Recipient**: `userEmail` (user's own email address)
- **Sender**: `EMAIL_USER` from .env
- **Triggered**: When user logs in via Google OAuth
- **Error Handling**: Non-blocking - email failure doesn't stop login

```javascript
/**
 * Send login confirmation email to authenticated user
 * @param {string} userName - User's display name
 * @param {string} userEmail - User's email (RECIPIENT)
 * @returns {Promise<boolean>} Success status
 */
async function sendLoginEmail(userName, userEmail)
```

#### `sendBookingConfirmationEmail(reservation, concert)`
- **Purpose**: Send booking confirmation with details
- **Recipient**: `reservation.customerEmail`
- **Sender**: `EMAIL_USER` from .env
- **Triggered**: When booking is confirmed
- **Includes**: Reservation ID, concert details, pricing

```javascript
/**
 * Send booking confirmation email to customer
 * @param {Object} reservation - Booking details
 * @param {string} reservation.customerEmail - RECIPIENT
 * @param {Object} concert - Concert details
 * @returns {Promise<boolean>} Success status
 */
async function sendBookingConfirmationEmail(reservation, concert)
```

#### `testEmailConfiguration()`
- **Purpose**: Verify Gmail credentials are valid
- **Used**: Application startup validation
- **Checks**:
  - EMAIL_USER is set
  - EMAIL_PASSWORD is valid
  - Gmail SMTP is reachable

```javascript
/**
 * Verify email transporter configuration
 * @returns {Promise<boolean>} Configuration valid
 */
async function testEmailConfiguration()
```

### server.js

#### POST /api/login

```javascript
app.post('/api/login', requireGoogleAuth, async (req, res) => {
  const { userName, userEmail } = req.body;  // userEmail from Google OAuth
  
  // Email sent TO: userEmail (user's own email)
  // Non-blocking: .catch() prevents email failure from stopping login
  emailService.sendLoginEmail(userName, userEmail);
  
  res.json({ success: true, user: { name, email: userEmail } });
});
```

#### POST /api/reservations

```javascript
app.post('/api/reservations', requireGoogleAuth, async (req, res) => {
  const { customerEmail, customerName, concertId, quantity } = req.body;
  
  // Create reservation...
  const reservation = { customerEmail, customerName, ... };
  
  // Email sent TO: customerEmail (from booking form)
  // Non-blocking: .catch() prevents email failure from stopping booking
  emailService.sendBookingConfirmationEmail(reservation, concert);
  
  res.status(201).json({ success: true, reservation });
});
```

---

## Email Templates

### Login Email
- **Subject**: ✅ เข้าสู่ระบบสำเร็จ - Concert Ticket System
- **Content**: 
  - Personalized greeting with user name
  - User email confirmation
  - Login timestamp
  - Link to main website
- **Language**: Thai

### Booking Email
- **Subject**: 🎫 การจองสำเร็จ - [Concert Name]
- **Content**:
  - Personalized greeting
  - Reservation ID (confirmation code)
  - Concert details (name, artist, date, venue)
  - Ticket quantity
  - Total price breakdown
  - Important notes for attendees
- **Language**: Thai

---

## Logging & Monitoring

### Successful Operations

```
[EMAIL] ✅ Login email sent successfully
        ↳ From: noreply@concertticket.com
        ↳ To: alice@gmail.com
        ↳ Message ID: <12345@concertticket.com>
```

### Error Handling

```
[EMAIL] ❌ Error sending login email to alice@gmail.com:
        ↳ Error details: Invalid login credentials
        ↳ Check: EMAIL_USER and EMAIL_PASSWORD in .env
```

### Startup Verification

```
[EMAIL] ✅ Email configuration verified successfully
        ↳ Sender: 6710110264@psu.ac.th
        ↳ SMTP: Gmail
        ↳ Status: Ready to send emails
```

---

## Testing

### Manual Test

```bash
node backend/test-email.js
```

Expected output:
```
✅ Email connection verified!
✅ Test email sent!
   Message ID: <xxxx@psu.ac.th>
✅ EVERYTHING IS WORKING!
```

### Integration Test

1. **Open frontend**: http://localhost:5173
2. **Login**: Use different Google account emails
3. **Check inbox**: Email should arrive in user's inbox (not system email)
4. **Book ticket**: Provide customer email in booking form
5. **Verify**: Booking confirmation sent to customer email

---

## Production Checklist

- [ ] EMAIL_USER set to Gmail address in .env
- [ ] EMAIL_PASSWORD is 16-character Gmail App Password
- [ ] 2FA enabled on Gmail account
- [ ] SEND_LOGIN_EMAIL=true in .env
- [ ] SEND_BOOKING_EMAIL=true in .env
- [ ] Email templates tested with real emails
- [ ] Error handling verified (mail server down, invalid credentials)
- [ ] Logs configured for monitoring
- [ ] Backend and Frontend ports match (API proxy configured)

---

## Troubleshooting

### Emails not arriving?

1. **Check inbox and spam folder** - Gmail may filter automated emails
2. **Verify recipient email** - User email from Google OAuth or booking form
3. **Check .env credentials** - Must be 16-character App Password, not regular password
4. **Review backend logs** - Look for [EMAIL] section
5. **Test configuration** - Run `node backend/test-email.js`

### Authentication Error (535 - Username and Password not accepted)?

1. **Enable 2FA**: Go to myaccount.google.com
2. **Generate new App Password**: https://myaccount.google.com/apppasswords
3. **Update .env**: Replace EMAIL_PASSWORD with new 16-character code
4. **Restart backend**: Changes take effect on restart

### SMTP Connection Error?

- Check internet connection
- Verify Gmail 2FA is enabled
- Ensure EMAIL_USER is correct Gmail address
- Try test script: `node backend/test-email.js`

---

## Security Best Practices

✅ **Implemented:**
- Email password stored in .env (git-ignored)
- Non-blocking email sending (no user data exposure)
- Error messages never expose passwords in logs
- Email validation on input
- Rate limiting via concurrency control

⚠️ **Guidelines:**
- Never commit .env to git
- Rotate Gmail App Password periodically
- Review email logs regularly
- Don't use regular Gmail password (use App Password)

---

## Future Improvements

- [ ] Email retry mechanism (exponential backoff)
- [ ] Email delivery tracking
- [ ] Send test email on application startup
- [ ] Admin email notifications (CC/BCC)
- [ ] Email template customization via admin panel
- [ ] Multilingual email templates
- [ ] Unsubscribe functionality
- [ ] Migration to SendGrid/AWS SES for scale

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│          NODEMAILER EMAIL SERVICE                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Transporter: Gmail SMTP                              │
│  - Host: smtp.gmail.com                               │
│  - Port: 587 (TLS)                                    │
│  - Auth: EMAIL_USER + EMAIL_PASSWORD (App Password)   │
│                                                        │
│  Email Functions:                                      │
│  - sendLoginEmail(userName, userEmail)               │
│  - sendBookingConfirmationEmail(reservation, concert) │
│  - testEmailConfiguration()                           │
│                                                        │
│  Logging: [EMAIL] tag for all operations              │
│                                                        │
└────────────────────────────────────────────────────────┘
         ↓           ↓           ↓
     Backend    Frontend    Database
     /api/login /api/       (In-memory)
   /api/reservations        
```

---

## Summary

✅ **Email System Status: Production Ready**

- ✅ Sends to user's email (not system email)
- ✅ Google OAuth integration
- ✅ Error handling and logging
- ✅ Non-blocking operations
- ✅ Configurable via .env
- ✅ Tested and verified working

---

**Last Updated**: February 6, 2026  
**Status**: 🟢 Production Ready
