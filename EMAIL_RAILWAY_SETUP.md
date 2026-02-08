# 📧 Email Configuration Guide for Railway

## Step 1: Get Gmail App Password

### Prerequisites:
- Gmail account
- Google account with 2FA enabled

### Steps:

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com
   - Click "Security" on left sidebar
   - Find "2-Step Verification"
   - Follow prompts to enable if not already done

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Click "Generate"
   - Copy the 16-character password shown

   **Example:** `abcd efgh ijkl mnop`

---

## Step 2: Set Email Variables in Railway

### In Railway Dashboard:

1. **Go to Your Project**
   - Log in to https://railway.app
   - Click your "concert-ticket-system" project
   - Select "Backend" service

2. **Go to Variables Tab**
   - Click "Variables" or "Settings"
   - Look for Variables section

3. **Add These Variables**

   | Key | Value |
   |-----|-------|
   | EMAIL_USER | `your_email@gmail.com` |
   | EMAIL_PASSWORD | `abcd efgh ijkl mnop` (the 16-char password) |
   | EMAIL_FROM | `noreply@concerttickets.com` (optional) |

4. **Save & Deploy**
   - Click Save
   - Railway auto-redeploys with new variables

---

## Step 3: Verify Email Configuration

### Check Logs

After redeployment, check logs:
```
Railway Dashboard → Backend Service → Logs
Look for:
  ✅ Email transporter configured
  ✅ Email notifications enabled

Not:
  ⚠️ Email transporter not configured
```

### Send Test Email

```bash
# Via API
curl -X POST https://your-api.railway.app/api/auth/verify-google \
  -H "Content-Type: application/json" \
  -d {\"token\":\"test_token\"}

# Check your email for notifications
```

---

## Step 4: Troubleshooting

### Problem: "Email transporter not configured"
```
❌ EMAIL_USER or EMAIL_PASSWORD not set
✅ Set both variables in Railway dashboard
✅ Redeploy service
✅ Check logs again
```

### Problem: "Invalid credentials"
```
❌ Using regular Gmail password (won't work)
✅ Use 16-character app password instead
✅ Verify it's from https://myaccount.google.com/apppasswords
✅ Regenerate if unsure
```

### Problem: "Connection timeout"
```
❌ Gmail blocking less secure apps
✅ Using app password already handles this
✅ Check if 2FA is enabled
✅ Try regenerating app password
```

### Problem: "Email not received"
```
❌ Check spam/promotions folder
✅ Verify EMAIL_USER is correct
✅ Check email templates in backend/services/emailService.js
✅ Review deployment logs
```

---

## Email Features Available

Once configured, email notifications work for:

✅ **Login Notifications**
- User logs in → Email sent with login details

✅ **Booking Confirmations**
- User makes reservation → Confirmation email sent

✅ **Admin Notifications**
- New booking → Admin notified

✅ **Email Templates**
- Professional templates with red theme
- Gradient backgrounds (coral/pink)
- Responsive design

---

## Quick Reference

```bash
# Get EMAIL_USER
# Your Gmail address (e.g., your_name@gmail.com)

# Get EMAIL_PASSWORD
# 1. Go to https://myaccount.google.com/apppasswords
# 2. Select Mail + your device
# 3. Generate
# 4. Copy 16-character password (without spaces for Railway)

# Set in Railway
1. Service Variables
2. Add EMAIL_USER=your_email@gmail.com
3. Add EMAIL_PASSWORD=16charapppassword
4. Save
5. Redeploy
```

---

## Testing Email Locally

If testing locally:

```bash
# Create .env in backend/
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=16charapppassword
NODE_ENV=development

# Start server
npm start

# Make a booking to trigger email
# Check your email
```

---

**Email configuration complete! 📧✅**

See logs in Railway to confirm: `✅ Email notifications enabled`
