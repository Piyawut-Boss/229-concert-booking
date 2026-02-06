# 🚀 Email System - Quick Start Checklist

Get email notifications working in 5 minutes!

## Step 1: Gmail Setup (2 minutes)

- [ ] Go to https://myaccount.google.com/security
- [ ] Enable 2-Step Verification (if not already enabled)
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Select **Mail** and **Windows Computer** (or your device)
- [ ] Copy the 16-character password Google generates

## Step 2: Backend Configuration (1 minute)

Update `backend/.env`:

```env
# Email Gmail Settings
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=noreply@concertticket.com

# Notifications
SEND_LOGIN_EMAIL=true
SEND_BOOKING_EMAIL=true
```

**Important:**
- Replace `your-email@gmail.com` with YOUR Gmail address
- Paste the 16-character app password (remove spaces)
- Save the file

## Step 3: Install Dependencies (1 minute)

```bash
cd backend
npm install
```

## Step 4: Start Backend (30 seconds)

```bash
npm run dev
```

**You should see:**
```
[EMAIL] ✅ Email configuration verified successfully
[EMAIL] 📧 Email notifications enabled
```

If you see this ✅ - You're ready! If not, check Step 2.

## Step 5: Test Email (1 minute)

1. Go to frontend: http://localhost:3000
2. Click "Sign in with Google"
3. Complete Google login
4. **Check your email inbox for login confirmation** ✉️

---

## Files Changed

### Created (New Files)
- ✅ `backend/services/emailService.js` - Email service module
- ✅ `EMAIL_SETUP.md` - Detailed setup guide
- ✅ `IMPLEMENTATION.md` - Implementation guide
- ✅ This checklist file

### Updated (Modified Files)
- ✅ `backend/server.js` - Added email integration
- ✅ `backend/package.json` - Added nodemailer
- ✅ `backend/.env` - Email configuration
- ✅ `backend/.env.example` - Updated template
- ✅ `frontend/src/components/GoogleLogin.jsx` - Sends login email
- ✅ `frontend/.env.example` - Added note

---

## Features Now Available

✅ **Login Email** - Sent when user signs in with Google
- User name
- Login timestamp
- Welcome message
- Link to website

✅ **Booking Email** - Sent when tickets are purchased
- Confirmation ID
- Concert details
- Ticket quantity and price
- Total amount in Thai Baht
- Link to view reservations

---

## Troubleshooting

### Problem: "Invalid login credentials"
**Solution:**
1. Make sure 2-Factor Authentication is enabled
2. Use 16-character App Password (not your Gmail password)
3. Remove spaces from password: `xxxx xxxx xxxx xxxx` → `xxxxxxxxxxxxxxxx`

### Problem: "Email transporter not configured"
**Solution:**
1. Check `EMAIL_USER` is in `.env`
2. Check `EMAIL_PASSWORD` is in `.env`
3. Restart backend: `npm run dev`

### Problem: Emails not arriving
**Solution:**
1. Check spam/junk folder
2. Check app is sending email (look for `[EMAIL]` in console)
3. Wait 30 seconds (email might be delayed)

---

## Next Steps

1. **Customize Email:**
   - Edit templates in `backend/services/emailService.js`
   - Change sender name in `EMAIL_FROM`
   - Update `FRONTEND_URL` for email links

2. **Use Different Email Provider:**
   - See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for SendGrid, Office 365, etc.

3. **Monitor Email:**
   - Check console for `[EMAIL]` messages
   - Look for ✅ success and ❌ error logs

4. **Production Setup:**
   - See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for production checklist

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `[EMAIL] ⚠️ Email transporter not configured` | Add `EMAIL_USER` and `EMAIL_PASSWORD` to `.env` |
| `[EMAIL] ❌ Invalid login credentials` | Check Gmail 2FA is enabled, use correct app password |
| Emails in spam | Mark as "Not Spam" in email client |
| No `[EMAIL]` messages in logs | Make sure you restarted backend after updating `.env` |

---

## Command Reference

```bash
# Install dependencies
npm install

# Start backend with email enabled
npm run dev

# Test without email (hardcoded)
npm start

# View .env file
cat backend/.env

# View email service
cat backend/services/emailService.js
```

---

## That's It! 🎉

Your Concert Ticket System now sends:
- ✅ Login confirmation emails
- ✅ Booking confirmation emails

**Need help?** See the detailed guides:
- [EMAIL_SETUP.md](./EMAIL_SETUP.md) - Complete setup guide
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Technical details

**Ready for production?** Review the production checklist in [EMAIL_SETUP.md](./EMAIL_SETUP.md#production-checklist)

Happy ticketing! 🎵🎫
