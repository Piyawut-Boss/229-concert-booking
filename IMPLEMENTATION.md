# 🎵 Email Notification System - Implementation Guide

## Overview

Your Concert Ticket System now has a complete email notification system that sends:
- ✅ **Login Confirmation Emails** - When users sign in with Google
- ✅ **Booking Confirmation Emails** - When tickets are successfully booked

## What Changed

### Backend Changes

#### 1. New Email Service Module
**File:** `backend/services/emailService.js`
- Handles all email operations
- Supports Gmail and custom SMTP
- Beautiful HTML email templates
- Error handling and logging

#### 2. Updated `server.js`
```javascript
// Added email service import
const emailService = require('./services/emailService');

// New POST /api/login endpoint
app.post('/api/login', requireGoogleAuth, async (req, res) => {
  // Sends login confirmation email
  await emailService.sendLoginEmail(userName, userEmail);
})

// Updated POST /api/reservations endpoint
app.post('/api/reservations', requireGoogleAuth, async (req, res) => {
  // ... existing reservation logic ...
  
  // Sends booking confirmation email
  await emailService.sendBookingConfirmationEmail(reservation, concert);
})
```

#### 3. Updated `package.json`
- Added `nodemailer` dependency for email sending

#### 4. Updated `.env` Configuration
- Gmail app password support
- Custom SMTP server option
- Email notification toggles

### Frontend Changes

#### 1. Updated `GoogleLogin.jsx`
```javascript
// Calls backend POST /api/login to trigger email
const handleLoginSuccess = async (credentialResponse) => {
  // ... decode token ...
  login(userData) // UI update
  
  // Send login notification to backend
  await axios.post('/api/login', {
    userName: userData.name,
    userEmail: userData.email,
    googleToken: token
  })
}
```

---

## Code Examples

### Backend: Email Service Usage

```javascript
const emailService = require('./services/emailService');

// Send login email
await emailService.sendLoginEmail('John Doe', 'john@example.com');

// Send booking confirmation
await emailService.sendBookingConfirmationEmail(reservation, concert);

// Test configuration
const isConfigured = await emailService.testEmailConfiguration();
```

### Backend: New Login Endpoint

```javascript
app.post('/api/login', requireGoogleAuth, async (req, res) => {
  const { userName, userEmail } = req.body;

  try {
    // Send email asynchronously (non-blocking)
    emailService.sendLoginEmail(userName, userEmail).catch(error => {
      console.error('[LOGIN] Email sending failed:', error);
    });

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { name: userName, email: userEmail }
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
```

### Frontend: Login with Email Notification

```javascript
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function GoogleLoginComponent() {
  const { login } = useAuth();

  const handleLoginSuccess = async (credentialResponse) => {
    // Decode JWT and extract user info
    const pool = JSON.parse(jsonPayload);
    const userData = {
      name: payload.name,
      email: payload.email,
      token: credentialResponse.credential,
    };

    // Update UI immediately
    login(userData);

    // Send email notification to backend
    try {
      await axios.post('/api/login', {
        userName: userData.name,
        userEmail: userData.email,
        googleToken: userData.token
      }, {
        headers: { 'Authorization': `Bearer ${userData.token}` }
      });
      console.log('✅ Login notification sent');
    } catch (error) {
      console.warn('⚠️ Email not sent:', error.message);
      // Don't fail login if email fails
    }
  };

  return <GoogleLogin onSuccess={handleLoginSuccess} />;
}
```

### Backend: Booking with Email

```javascript
app.post('/api/reservations', requireGoogleAuth, async (req, res) => {
  // ... validation and database logic ...

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
  };

  reservations.push(reservation);

  // Send booking confirmation email
  if (process.env.SEND_BOOKING_EMAIL !== 'false') {
    emailService.sendBookingConfirmationEmail(reservation, concert)
      .catch(error => {
        console.error('[BOOKING] Email sending failed:', error);
      });
  }

  res.status(201).json({
    success: true,
    reservation,
    message: 'Reservation successful!'
  });
});
```

---

## Email Templates

### Login Email Template

**Subject:** ✅ เข้าสู่ระบบสำเร็จ - Concert Ticket System

Features:
- ✅ Welcome message with user name
- ✅ Login timestamp
- ✅ User email confirmation
- ✅ Link back to website
- ✅ Professional HTML layout
- ✅ Security notice

**Sample Content:**
```
User: John Doe
Email: john@example.com
Login Time: Feb 6, 2026 2:45 PM

If you didn't perform this login, please contact: support@concertticket.com
```

### Booking Confirmation Template

**Subject:** 🎫 การจองสำเร็จ - [Concert Name] - Confirmation #ABC123

Features:
- ✅ Confirmation ID (for reference)
- ✅ Concert details (name, artist, date, venue)
- ✅ Ticket information (quantity, price breakdown)
- ✅ Total amount in Thai Baht
- ✅ Booking status badge
- ✅ Link to view all reservations
- ✅ Professional HTML styling
- ✅ Contact information

**Sample Content:**
```
Confirmation #: TEST-123

Concert Details:
- Name: LAMPANG MUSIC FESTIVAL 2026
- Artist: Various Artists
- Date: March 15, 2026
- Venue: ลานกาดกองต้า ลำปาง

Ticket Details:
- Quantity: 2 tickets
- Price per ticket: ฿1,500
- Total: ฿3,000

Status: ยืนยันแล้ว (Confirmed)

[View My Reservations Button]
```

---

## Configuration Options

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication:**
   - Visit: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Get App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. **Update `.env`:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=noreply@concertticket.com
   ```

### Custom SMTP Setup

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EMAIL_USER` | - | Gmail username |
| `EMAIL_PASSWORD` | - | Gmail app password |
| `SMTP_HOST` | - | SMTP server hostname |
| `SMTP_PORT` | 587 | SMTP port number |
| `SMTP_SECURE` | false | Use TLS security |
| `SMTP_USER` | - | SMTP username |
| `SMTP_PASSWORD` | - | SMTP password |
| `EMAIL_FROM` | noreply@concertticket.com | Sender email address |
| `FRONTEND_URL` | http://localhost:3000 | Frontend URL for email links |
| `SEND_LOGIN_EMAIL` | true | Enable login emails |
| `SEND_BOOKING_EMAIL` | true | Enable booking emails |

---

## File Structure

```
concert-ticket-system/
├── backend/
│   ├── services/
│   │   └── emailService.js          [NEW] Email sending module
│   ├── server.js                     [UPDATED] Added email integration
│   ├── package.json                  [UPDATED] Added nodemailer
│   ├── .env                          [UPDATED] Email configuration
│   └── .env.example                  [UPDATED] Configuration template
├── frontend/
│   ├── src/components/
│   │   └── GoogleLogin.jsx           [UPDATED] Sends login email
│   └── .env.example                  [UPDATED] Added note about backend email
├── EMAIL_SETUP.md                    [NEW] Email setup guide
└── IMPLEMENTATION.md                 [NEW] This file
```

---

## Testing Email Notifications

### Test 1: Verify Configuration on Startup

**Run backend:**
```bash
cd backend
npm install
npm run dev
```

**Expected output:**
```
[EMAIL] Testing email configuration...
[EMAIL] ✅ Email configuration verified successfully
[EMAIL] 📧 Email notifications enabled
```

### Test 2: Trigger Login Email

1. Go to frontend: http://localhost:3000
2. Click "Sign in with Google"
3. Complete Google authentication
4. Check email inbox for login confirmation email

**Expected:**
- Email arrives within seconds
- Subject: ✅ เข้าสู่ระบบสำเร็จ - Concert Ticket System
- Contains your name and login timestamp

### Test 3: Trigger Booking Email

1. Navigate to a concert on the website
2. Click "จองบัตร" button
3. Complete booking form
4. Submit booking

**Expected:**
- Email arrives within seconds
- Subject: 🎫 การจองสำเร็จ - [Concert Name]
- Contains confirmation ID and full booking details

### Test Console Output

```
[LOGIN] ✅ User logged in: user@example.com
[EMAIL] ✅ Login email sent to user@example.com: <message-id>

[GOOGLE AUTH] [RESERVATION] RES-12345 - John Doe reserved 2 tickets
[EMAIL] ✅ Booking confirmation email sent to user@example.com: <message-id>
```

---

## Error Handling

The system gracefully handles email errors:

### Configuration Missing
```
[EMAIL] ⚠️ Email transporter not configured. Skipping login email.
```
- **Solution:** Configure `.env` with email settings

### Email Send Failure
```
[EMAIL] ❌ Error sending login email to user@example.com: Connection timeout
```
- **Solution:** Check network and email provider settings
- **Important:** Login/booking still succeeds even if email fails

### Incorrect Credentials
```
[EMAIL] ❌ Error sending login email: Invalid login credentials
```
- **Solution:** Verify Gmail app password is correct (16 characters, no spaces)

---

## Security Considerations

✅ **What's Secure:**
- Email credentials stored in `.env` (not committed to git)
- Emails sent asynchronously (non-blocking)
- User data encrypted in transit (HTTPS)
- Google OAuth token verification
- No sensitive data in email logs

⚠️ **Best Practices:**
- Never commit `.env` file to git repository
- Use Gmail App Password (not your real password)
- Enable 2-Factor Authentication on Gmail
- Regenerate app password if compromised
- Monitor email logs for suspicious activity

---

## Troubleshooting

### Q: Emails not being sent
**A:** Check:
1. `.env` file has Gmail credentials
2. Gmail 2-Factor Authentication is enabled
3. App password is correct (check it was copied fully)
4. Backend console shows `[EMAIL] ✅ Email configuration verified successfully`

### Q: "Invalid login credentials" error
**A:** Make sure:
1. Email address is correct (e.g., `user@gmail.com`)
2. Using 16-character App Password, not your Gmail password
3. App Password doesn't have spaces (remove them)
4. 2-Factor Authentication is enabled

### Q: Emails going to spam
**A:** Try:
1. Check spam/junk folder
2. Mark email as "Not Spam"
3. Add sender to contacts
4. Use a professional domain email (not Gmail) for production

### Q: Async performance
**A:** Emails are sent asynchronously:
- User gets instant feedback (no delay)
- Email delivery happens in background
- If email fails, login/booking still succeeds
- Check console logs `[EMAIL]` to verify

---

## Performance & Scalability

### Design Decisions

1. **Async Email Sending**
   - Emails sent in background (non-blocking)
   - API responses don't wait for email
   - Users get instant feedback
   - Email delivery is fire-and-forget

2. **Graceful Degradation**
   - If email fails, booking/login still succeeds
   - Email is treated as "nice to have", not critical
   - System continues to work without email

3. **Error Handling**
   - Errors logged but don't interrupt flow
   - Console shows `[EMAIL]` tagged messages
   - Administrators can monitor email status

### For Production

1. Consider using email queue service (Sidekiq, Bull)
2. Add email retry logic for failed sends
3. Use cloud email provider (SendGrid, AWS SES)
4. Monitor email delivery rate
5. Add unsubscribe link to emails
6. Implement email bounce handling

---

## Support

For detailed setup instructions, see: [EMAIL_SETUP.md](./EMAIL_SETUP.md)

For questions or issues:
1. Check console logs with `[EMAIL]` prefix
2. Verify `.env` configuration
3. Test email credentials separately
4. Review email templates in `backend/services/emailService.js`

---

## Summary

Your Concert Ticket System now has:
✅ Automatic login confirmation emails
✅ Detailed booking confirmation emails
✅ Professional HTML email templates
✅ Gmail integration (easy setup)
✅ Custom SMTP support
✅ Graceful error handling
✅ Async non-blocking delivery
✅ Complete configuration options

Ready to start using email notifications! 🚀📧
