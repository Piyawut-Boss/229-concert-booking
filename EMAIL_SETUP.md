# 📧 Email Notification System Setup Guide

This guide will help you set up the email notification system for your Concert Ticket Booking website.

## Features

- ✅ **Login Email Notifications** - Send welcome email when user logs in with Google
- ✅ **Booking Confirmation Emails** - Send detailed confirmation email after ticket purchase
- ✅ **Beautiful HTML Templates** - Professional email templates with concert details
- ✅ **Configurable SMTP** - Support for Gmail and custom SMTP servers
- ✅ **Async Email Sending** - Non-blocking email sending (won't delay API responses)
- ✅ **Error Handling** - Graceful handling if email service is not configured

---

## Quick Start (Gmail - Easiest Option)

### Step 1: Enable 2-Factor Authentication on Google Account

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. After enabling 2FA, you'll see the option for "App passwords"

### Step 2: Create Gmail App Password

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Windows Computer** (or your device)
3. Google will generate a 16-character password
4. Copy this password - you'll need it in the next step

### Step 3: Configure Backend `.env` File

Create or update `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Gmail Configuration (Easiest Option)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=noreply@concertticket.com

# Email Notifications
SEND_LOGIN_EMAIL=true
SEND_BOOKING_EMAIL=true
```

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

### Step 5: Start Backend

```bash
npm run dev
```

You should see in console:
```
[EMAIL] ✅ Email configuration verified successfully
[EMAIL] 📧 Email notifications enabled
```

---

## Alternative: Custom SMTP Configuration

If you're using a custom email service (SendGrid, Office 365, etc.), create `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Custom SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com

# Email Notifications
SEND_LOGIN_EMAIL=true
SEND_BOOKING_EMAIL=true
```

### Common SMTP Configurations:

#### Gmail SMTP (Advanced)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key
```

#### Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@company.com
SMTP_PASSWORD=your-password
```

---

## File Structure

```
backend/
├── server.js                    # Main server (updated with email endpoints)
├── services/
│   └── emailService.js         # Email service module (NEW)
├── package.json                 # Updated with nodemailer dependency
├── .env                         # Your email configuration (create this)
└── .env.example                 # Example configuration

frontend/
├── src/
│   └── components/
│       └── GoogleLogin.jsx      # Updated to trigger login email
```

---

## How It Works

### Login Flow
1. User clicks "Sign in with Google" button
2. Frontend decodes Google JWT token
3. Frontend saves user to context (instant UI update)
4. Frontend calls `POST /api/login` with user details
5. Backend verifies Google token via middleware
6. Backend sends login confirmation email (async, non-blocking)
7. User sees instant feedback without waiting for email

### Booking Flow
1. User fills booking form and clicks "จองบัตร"
2. Frontend calls `POST /api/reservations` with ticket details
3. Backend verifies Google token via middleware
4. Backend creates reservation and decrements ticket count
5. Backend sends booking confirmation email (async, non-blocking)
6. Frontend shows success message with reservation ID
7. Email arrives in user's inbox within seconds

---

## Email Templates

### Login Email Template ✉️
- ✅ Sends when user successfully logs in
- ✅ Includes: User name, email, login timestamp
- ✅ Professional design with your branding
- ✅ Link to website dashboard

### Booking Confirmation Email Template 🎫
- ✅ Sends when booking is confirmed
- ✅ Includes:
  - Reservation ID (confirmation number)
  - Concert details (name, artist, date, venue)
  - Ticket details (quantity, price, total)
  - Customer information
  - Professional styling
  - Link to view all reservations

---

## Environment Variables Explained

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `EMAIL_USER` | Yes (Gmail) | user@gmail.com | Gmail address |
| `EMAIL_PASSWORD` | Yes (Gmail) | abcd1234efgh5678 | 16-char Gmail app password |
| `EMAIL_FROM` | No | noreply@concertticket.com | Sender email address |
| `FRONTEND_URL` | No | http://localhost:3000 | Used for links in emails |
| `SEND_LOGIN_EMAIL` | No | true | Enable/disable login emails |
| `SEND_BOOKING_EMAIL` | No | true | Enable/disable booking emails |
| `SMTP_HOST` | Yes (SMTP) | smtp.gmail.com | SMTP server hostname |
| `SMTP_PORT` | Yes (SMTP) | 587 | SMTP port (usually 587 or 465) |
| `SMTP_SECURE` | No | false | Use TLS (false for 587, true for 465) |
| `SMTP_USER` | Maybe (SMTP) | user@gmail.com | SMTP username |
| `SMTP_PASSWORD` | Maybe (SMTP) | password | SMTP password |

---

## Testing Email

### Test 1: Check Backend Configuration on Startup

```bash
cd backend
npm run dev
```

Look for messages:
- ✅ `[EMAIL] ✅ Email configuration verified successfully` - Configuration OK
- ⚠️ `[EMAIL] ⚠️ Email transporter not configured` - Missing configuration

### Test 2: Send a Test Email

Create `backend/test-email.js`:

```javascript
require('dotenv').config();
const emailService = require('./services/emailService');

async function test() {
  console.log('Sending test login email...');
  await emailService.sendLoginEmail('Test User', 'your-email@gmail.com');
  
  console.log('Sending test booking email...');
  const mockReservation = {
    id: 'TEST-123',
    customerName: 'Test User',
    customerEmail: 'your-email@gmail.com',
    quantity: 2,
    totalPrice: 3000,
    status: 'confirmed'
  };
  const mockConcert = {
    name: 'Test Concert',
    artist: 'Test Artist',
    date: '2026-03-20',
    venue: 'Test Venue',
    price: 1500
  };
  await emailService.sendBookingConfirmationEmail(mockReservation, mockConcert);
}

test().catch(console.error);
```

Run test:
```bash
node test-email.js
```

---

## Email Logs

The system logs all email activities:

```
[EMAIL] ✅ Email configuration verified successfully
[EMAIL] 📧 Email notifications enabled
[EMAIL] ✅ Login email sent to user@gmail.com: <message-id>
[EMAIL] ✅ Booking confirmation email sent to user@gmail.com: <message-id>
[EMAIL] ❌ Error sending login email to user@gmail.com: Connection timeout
```

---

## Troubleshooting

### Problem: "Email transporter not configured"

**Solution**: Check your `.env` file has email configuration:
```bash
# On Windows
type backend\.env | findstr EMAIL

# On Mac/Linux
grep EMAIL backend/.env
```

### Problem: "Invalid login credentials"

**Possible causes**:
1. **Wrong Gmail app password**: Make sure you generated it from [App Passwords](https://myaccount.google.com/apppasswords), not your regular password
2. **2FA not enabled**: Gmail requires 2-Factor Authentication first
3. **App Password invalid**: Regenerate a new one

**Solution**:
```env
# Correct format (16 characters with spaces removed)
EMAIL_PASSWORD=abcdefghijklmnop

# Incorrect formats that won't work:
# - Your regular Gmail password
# - Password with spaces
# - A random string
```

### Problem: "Error: connect timeout"

**Possible causes**:
1. Gmail blocking connection
2. Firewall blocking port
3. Wrong SMTP port

**Solution**: Try different port:
```env
# Try this:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
```

### Problem: Emails not arriving

**Possible causes**:
1. Email going to spam folder
2. Email address typo
3. Email service rate limit

**Solution**:
1. Check spam/junk folder
2. Verify email in database: `SELECT * FROM users WHERE email='your-email'`
3. Check backend logs: `[EMAIL]` messages

### Problem: "TypeError: emailService is undefined"

**Solution**: Make sure you're importing correctly in server.js:
```javascript
const emailService = require('./services/emailService');
```

---

## Production Checklist

- [ ] Gmail App Password created (or SMTP configured)
- [ ] `.env` file created with email configuration
- [ ] `.env` file added to `.gitignore` (never commit secrets)
- [ ] Email configuration tested on startup (check logs)
- [ ] Test email received in inbox
- [ ] Frontend URL correct in emails (`FRONTEND_URL` env var)
- [ ] Email sender name set (`EMAIL_FROM` env var)

---

## Disabling Emails (if needed)

If you want to disable email notifications temporarily:

```env
SEND_LOGIN_EMAIL=false
SEND_BOOKING_EMAIL=false
```

Or remove email configuration entirely from `.env` - the system will run fine, just without sending emails.

---

## Email Service API Reference

### `sendLoginEmail(userName, userEmail)`

Sends login confirmation email.

```javascript
await emailService.sendLoginEmail('John Doe', 'john@example.com');
```

**Parameters:**
- `userName` (string): User's display name
- `userEmail` (string): User's email address

**Returns:** `Promise<boolean>` - true if sent, false if failed

### `sendBookingConfirmationEmail(reservation, concert)`

Sends booking confirmation email.

```javascript
await emailService.sendBookingConfirmationEmail(reservation, concert);
```

**Parameters:**
- `reservation` (object): Reservation with `id`, `customerName`, `customerEmail`, `quantity`, `totalPrice`, `status`
- `concert` (object): Concert with `name`, `artist`, `date`, `venue`, `price`

**Returns:** `Promise<boolean>` - true if sent, false if failed

### `testEmailConfiguration()`

Tests if email service is properly configured.

```javascript
const isConfigured = await emailService.testEmailConfiguration();
```

**Returns:** `Promise<boolean>` - true if configured and working, false otherwise

---

## Support & More Information

For more details on email templates, check:
- `backend/services/emailService.js` - Email templates and logic
- `backend/.env.example` - Configuration examples
- Console logs with `[EMAIL]` prefix - Debugging information

Happy ticketing! 🎫🎵
