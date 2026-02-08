# 🚀 Post-Deployment Quick-Start - Railway Backend + Frontend

## Your Status: ✅ BACKEND LIVE ON RAILWAY

Backend is actively running on Railway with:
- ✅ PostgreSQL database connected
- ✅ Migrations executed successfully  
- ✅ API endpoints operational
- ✅ Health checks passing

**Time to complete:** 5-10 minutes

---

## 🎯 What to Do Now (In Order)

### STEP 1: Get Your Backend URL (2 minutes)

1. Open https://railway.app
2. Select your Concert Ticket project
3. Click on Backend service
4. **Copy the domain** (looks like `https://concert-ticket-xyz-123.railway.app`)
5. Save it somewhere - you'll use it 3 times

---

### STEP 2: Test Backend is Working (2 minutes)

Run the test script to verify all endpoints:

```bash
# Replace with your actual Railway URL
node test-railway.js https://your-domain.railway.app

# Expected output:
# ✓ Health Check Endpoint
# ✓ Get Concerts List  
# ✓ Upload Endpoint Available
# ✓ Admin Endpoints Available
# ✓ Database Connection Working
# ✓ CORS Headers Present
# ✓ Response Time < 1000ms
# ✓ JSON Content-Type

# 🎉 All tests passed!
```

**If tests fail:** Check backend URL is correct and includes **https://**

---

### STEP 3: Configure Email (Optional, 3 minutes)

Email is optional but recommended for:
- Login notifications
- Reservation confirmations  
- Admin alerts

**Follow:** [EMAIL_RAILWAY_SETUP.md](EMAIL_RAILWAY_SETUP.md)

Quick version:
1. Generate Gmail app password (requires 2FA)
2. Add to Railway Variables:
   - `EMAIL_USER` = your Gmail
   - `EMAIL_PASSWORD` = app password
3. Backend automatically restarts and uses email

✅ Check logs: Should show "✓ Email notifications enabled"

---

### STEP 4: Connect Frontend to Backend (3 minutes)

**Option A: Build Frontend (Recommended)**

```bash
cd frontend

# Create environment file
cp .env.example .env.local

# Edit .env.local and update:
# VITE_API_BASE_URL=https://your-railway-backend-url
# VITE_GOOGLE_CLIENT_ID=your_client_id

# Build for production
npm run build

# Result: frontend/dist/ ready to deploy
```

**Option B: Run Frontend Locally**

```bash
cd frontend

# Create environment file
cp .env.example .env.local

# Edit with your backend URL and Google Client ID:
# VITE_API_BASE_URL=https://your-railway-backend-url

# Run development server
npm run dev

# Opens http://localhost:3000
# Frontend connects to Railway backend
```

---

### STEP 5: Deploy Frontend (Optional, 5 minutes)

#### Choice 1: Deploy to Railway (with backend)

```bash
# In Railway Dashboard > Your Project > Add Service
# Select GitHub repo
# Search for: frontend
# Build command: cd frontend && npm run build
# Start command: npm run preview

# Add Variables:
VITE_API_BASE_URL=https://your-railway-backend-url
VITE_GOOGLE_CLIENT_ID=your_client_id
```

#### Choice 2: Deploy to Vercel (Recommended for Frontend)

```bash
# 1. Go https://vercel.com
# 2. Click "New Project"  
# 3. Select your GitHub repo
# 4. Vercel auto-detects frontend
# 5. Add Environment Variables > same as above
# 6. Deploy (2-3 minutes)
```

#### Choice 3: Keep Locally

```bash
# Just run inside frontend folder:
npm run dev

# Frontend runs on http://localhost:3000
# Connects to Railway backend via VITE_API_BASE_URL
```

---

## ✅ Verify Everything Works

### Test 1: Backend Endpoints

```bash
# Test health check
curl https://your-railway-backend-url/api/health

# Test concerts list
curl https://your-railway-backend-url/api/concerts | head
```

### Test 2: Frontend Connects

1. **Open frontend** (local, Railway, or Vercel)
2. **Should see concert list** immediately
3. **Click a concert** → booking modal opens
4. **Click "Book Now"** → should say "Sign in with Google"
5. **If this works:** ✅ Frontend + Backend connected!

### Test 3: Full User Flow

1. Sign in with Google
2. Make a reservation
3. View "My Reservations"
4. See your booking details

If all 3 steps work: **System is production-ready! 🎉**

---

## 📋 Environment Variables Reference

### Backend (Railway Dashboard Variables Tab)

```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://...  # Auto-provided by PostgreSQL service
GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=secret_key
EMAIL_USER=your@gmail.com  # Optional
EMAIL_PASSWORD=16char_password  # Optional
FRONTEND_URL=https://your-frontend-url  # If you have a frontend
```

### Frontend (frontend/.env or .env.local)

```
VITE_API_BASE_URL=https://your-railway-backend-url
VITE_GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
VITE_TURNSTILE_SITE_KEY=optional_cloudflare_key
```

---

## 🔍 Troubleshooting

**"Can't connect to backend"**
- Check URL includes `https://`
- Remove trailing slash `/`
- Run test script: `node test-railway.js YOUR_URL`

**"Concerts not loading in frontend"**
- Open DevTools (F12) → Console tab
- Check for CORS error or network error
- Verify `VITE_API_BASE_URL` is set correctly
- Test: `curl YOUR_URL/api/concerts`

**"Google login not working"**
- Check `VITE_GOOGLE_CLIENT_ID` in frontend .env
- Verify in Google Cloud Console it includes your frontend domain
- Add to OAuth redirect URIs in Google Cloud if needed

**"Email not sending"**
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in Railway variables
- Gmail requires 2FA + app-specific password (not regular password)
- See [EMAIL_RAILWAY_SETUP.md](EMAIL_RAILWAY_SETUP.md) for step-by-step

---

## 📚 Detailed Guides

For more information:
- **Email Setup:** [EMAIL_RAILWAY_SETUP.md](EMAIL_RAILWAY_SETUP.md)
- **Frontend Connection:** [FRONTEND_RAILWAY_SETUP.md](FRONTEND_RAILWAY_SETUP.md)
- **Backend Testing:** [README in root](README.md)
- **Deployment Details:** [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

---

## 🎯 Quick Checklist

- [ ] Get backend URL from Railway
- [ ] Run test script - all 8 tests pass
- [ ] (Optional) Configure email per EMAIL_RAILWAY_SETUP.md
- [ ] Create frontend .env with backend URL + Google Client ID
- [ ] (Optional) Build frontend: `npm run build`
- [ ] (Optional) Deploy frontend to Vercel/Railway/local
- [ ] Open frontend → should see concerts
- [ ] Click concert → modal opens
- [ ] Login with Google → works
- [ ] Make reservation → success
- [ ] Check "My Reservations" → booking appears

**If all ✓:** System is fully operational! 🚀

---

## One-Liner Tests

```bash
# Test backend
node test-railway.js https://YOUR-DOMAIN.railway.app

# Test specific endpoint
curl https://YOUR-DOMAIN.railway.app/api/health | jq

# Build frontend  
cd frontend && npm run build && cd ..

# Run frontend locally
cd frontend && npm run dev
```

---

**You're almost done! Deploy your frontend and celebrate 🎉**

Questions? Check the detailed guides above or review your Railway Dashboard logs.
