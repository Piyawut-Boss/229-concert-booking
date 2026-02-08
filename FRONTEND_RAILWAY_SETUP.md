# 🎯 Connect Frontend to Railway Backend - Complete Guide

## Overview

Your Concert Ticket System has:
- ✅ **Backend:** Running on Railway (https://your-api.railway.app)
- ⏳ **Frontend:** Ready to deploy (can run on Railway, Vercel, Netlify, or locally)

This guide connects them together.

---

## Step-by-Step Setup

### Step 1: Get Your Railway Backend URL

1. **In Railway Dashboard:**
   - Go to https://railway.app
   - Select your project → Backend service
   - Look for the deployment URL (shows under service name)
   - Example: `https://concert-ticket-backend-xyz123.railway.app`

2. **Save this URL** - you'll need it in the next steps

---

### Step 2: Configure Frontend Environment Variables

#### Local Development

**Create `frontend/.env.local`:**
```bash
# Copy template
cp frontend/.env.example frontend/.env.local

# Edit the file and update:
VITE_API_BASE_URL=https://your-railway-backend-url
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Replace:**
- `your-railway-backend-url` with your actual Railway backend URL
- `your_google_client_id` with your Google OAuth client ID

#### Production Build

**Build with environment variables:**
```bash
cd frontend

# Set backend URL (for production)
VITE_API_BASE_URL=https://your-railway-backend-url npm run build

# Or create .env file first, then build
npm run build
```

---

### Step 3: Test Backend Connection

**Before deploying frontend, verify backend is working:**

```bash
# Run the test script
node test-railway.js https://your-railway-backend-url

# Expected output:
# ✓ Health Check Endpoint
# ✓ Get Concerts List
# ✓ Upload Endpoint Available
# ✓ Database Connection Working
# ... etc

# Should show: 🎉 All tests passed!
```

---

### Step 4: Deploy Frontend to Railway

#### Option A: Deploy Frontend Service on Same Railway Project

1. **Add Frontend Service**
   - Railway Dashboard → Your Project → Add Service
   - Select GitHub & choose your repo
   - Set build command: `cd frontend && npm run build`
   - Set start command: `npm run preview`
   - Set working directory: `frontend`

2. **Configure Environment Variables**
   - Dashboard → Frontend Service → Variables
   - Add:
     ```
     VITE_API_BASE_URL=https://your-backend-api-url
     VITE_GOOGLE_CLIENT_ID=your_client_id
     NODE_ENV=production
     ```

3. **Deploy**
   - Click Deploy
   - Wait 3-5 minutes

#### Option B: Deploy to Vercel (Recommended for Frontend)

1. **Connect Repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repo
   - Vercel auto-detects frontend

2. **Set Environment Variables**
   - Vercel Dashboard → Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_BASE_URL=https://your-railway-backend-url
     VITE_GOOGLE_CLIENT_ID=your_google_client_id
     ```

3. **Deploy**
   - Click Deploy
   - Takes 2-3 minutes

#### Option C: Deploy Frontend Anywhere

The frontend builds to a static site in `frontend/dist/`:
- Can deploy to: Netlify, GitHub Pages, AWS S3, Cloudflare Pages, etc.
- Just set `VITE_API_BASE_URL` environment variable during build

---

### Step 5: Update API Configuration for Cross-Origin

**Frontend requests Backend - verify CORS is working:**

Backend (already configured) handles this:
```javascript
// In backend/server.js
app.use(cors());  // ✅ Already enabled
```

Your frontend will automatically use the `VITE_API_BASE_URL` for all API calls.

---

## Verify Connection

### Test 1: Check API Calls

**In Frontend Console (F12):**
```javascript
// Paste in browser console:
fetch('https://YOUR_RAILWAY_URL/api/concerts')
  .then(r => r.json())
  .then(data => console.log('✅ Connected! Concerts:', data))
  .catch(e => console.error('❌ Error:', e))

// Should see list of concerts
```

### Test 2: Test Full Flow

1. **Open frontend** in browser
2. **Home page should load** with concert listings
3. **Concerts appear from backend** (not hardcoded)
4. **Click concert** → modal appears
5. **Login button works** → Google OAuth
6. **Make reservation** → sent to Railway backend
7. **View reservations** → loads from backend

---

## Environment Variables Quick Reference

| Variable | Location | Value | Example |
|----------|----------|-------|---------|
| VITE_API_BASE_URL | frontend/.env | Your Railway backend URL | `https://api.railway.app` |
| VITE_GOOGLE_CLIENT_ID | frontend/.env | Google OAuth ID | `123456789.apps.googleusercontent.com` |
| DATABASE_URL | Railway backend vars | From PostgreSQL service | Auto-provided by Railway |
| EMAIL_USER | Railway backend vars | Your Gmail | `your@gmail.com` |
| EMAIL_PASSWORD | Railway backend vars | Gmail app password | 16-char password |

---

## Troubleshooting

### Problem: "Failed to fetch concerts"

```javascript
// In browser console, check:
console.log(import.meta.env.VITE_API_BASE_URL)
// Should show: https://your-railway-backend-url
```

**Solution:**
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend URL is correct
- Test with: `curl https://your-url/api/health`

### Problem: "CORS error"

```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' 
has been blocked by CORS policy
```

**Solution:**
- ✅ CORS is enabled in backend already
- Make sure frontend and backend URLs are correct
- Try without www/with www (consistency)

### Problem: "Google OAuth not working"

**Solution:**
- Check `VITE_GOOGLE_CLIENT_ID` is set
- Verify in Google Cloud Console
- Add frontend domain to authorized redirect URIs:
  1. Google Cloud Console
  2. Credentials → OAuth Client
  3. Add authorized redirect URI: `https://your-frontend-url/`

### Problem: "Can't log in"

```
Failed to verify token / Invalid credentials
```

**Solution:**
- Frontend and backend are communicating ✓
- Check Google Client ID is correct
- Check backend logs for error details

---

## Local Development Setup

**Run both locally for testing:**

### Terminal 1 - Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
VITE_API_BASE_URL=http://localhost:5000 npm run dev
# Runs on http://localhost:3000
```

### Terminal 3 - Test script
```bash
node test-railway.js http://localhost:5000
```

---

## Production Deployment Checklist

- [ ] Backend running on Railway ✅
- [ ] Backend URL copied
- [ ] Frontend environment variables set with backend URL
- [ ] Google Client ID configured in frontend .env
- [ ] Test backend with `test-railway.js` script
- [ ] Test frontend connects by viewing concerts
- [ ] Email configured (optional but recommended)
- [ ] Sentry/error tracking set up
- [ ] Custom domains configured
- [ ] SSL certificates active (automatic on Railway)

---

## One-Command Test

After deploying, verify everything works:

```bash
# Replace URLs with your actual URLs
BACKEND=https://your-railway-backend-url node test-railway.js $BACKEND

# Should pass all 8 tests:
# ✓ Health Check Endpoint
# ✓ Get Concerts List
# ✓ Upload Endpoint Available
# ✓ Admin Endpoints Available
# ✓ Database Connection Working
# ✓ CORS Headers Present
# ✓ Response Time < 1000ms
# ✓ JSON Content-Type

# Then test frontend connects to it:
curl $BACKEND/api/concerts | head -20
```

---

## Next: Full End-to-End Test

Once frontend is deployed:
1. Open frontend in browser
2. Should see list of concerts
3. Click concert → booking modal
4. Login with Google
5. Make a reservation
6. View in "My Reservations"
7. Admin can see in dashboard

**If all steps work: ✅ System is fully operational!**

---

## Need Help?

**Check logs:**
- Backend logs: Railway Dashboard → Backend → Logs
- Frontend logs: Browser DevTools → Console (F12)
- Build errors: Railway → Deployments → Show build logs

**Test endpoints directly:**
- Health: `curl https://your-api.railway.app/api/health`
- Concerts: `curl https://your-api.railway.app/api/concerts`
- Your frontend: `https://your-frontend-domain`

---

**Your system is ready to shine! 🚀**
