# 🚀 Deployment Ready - Follow These Steps

## Your Status: ✅ READY TO DEPLOY

- ✅ Code: All committed to GitHub
- ✅ Backend: Working locally (http://localhost:5000)
- ✅ Frontend: Working locally (http://localhost:3001)
- ✅ Database: PostgreSQL connected
- 📋 Next: Deploy to Railway

---

## 🎯 EASY 3-Step Deployment

### STEP 1️⃣: Set Railway Backend Variables (5 minutes)

**Go to:** https://railway.app

1. **Select your project** `229-concert-booking`
2. **Click "Backend" service**
3. **Click "Variables" tab** on the right
4. **Replace/Add these variables:**

```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://postgres:Boss12345@localhost:5432/concert_ticket_system
GOOGLE_CLIENT_ID=164061782280-6nl35e4kcagntgu622iqgl2i0hjfcf31.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret_here
EMAIL_USER=6710110264@psu.ac.th
EMAIL_PASSWORD=uvflotmlfettrfwt
FRONTEND_URL=https://[your-frontend-domain-after-deployment]
BACKEND_URL=https://[your-backend-url]
```

**Note:** 
- For `BACKEND_URL`: Use your Railway backend domain (shown in the service URL)
- For `FRONTEND_URL`: You'll get this after deploying frontend in Step 2

5. **Click "Deploy"** (automatic redeploy with new variables)

---

### STEP 2️⃣: Deploy Frontend to Railway (10 minutes)

**Go to:** https://railway.app → Your Project

1. **Click "Add Service"** (+ button)
2. **Select "GitHub"**
3. **Search for your repo** `229-concert-booking`
4. **Click it to select**
5. **For the frontend, configure:**
   - **Service Name:** Frontend (or similar)
   - **Build command:** `cd frontend && npm run build`
   - **Start command:** `npm run preview`
   - **Working directory:** `frontend` (optional, helps Railway find it)

6. **Click "Deploy"** - Takes 3-5 minutes
7. **Wait for deployment** (green checkmark = success)
8. **Get your Frontend URL:**
   - Go to Frontend service
   - Look at the top for the domain URL (like `https://concert-frontend-xyz.railway.app`)
   - **Copy this URL**

9. **Update Backend Variables with Frontend URL:**
   - Go back to Backend service → Variables
   - Update `FRONTEND_URL=https://concert-frontend-xyz.railway.app`
   - Click Deploy

---

### STEP 3️⃣: Verify Everything Works (5 minutes)

**Test your production deployment:**

1. **Open Frontend URL in browser**
   - Should see concert listing page
   - No errors in browser console (F12)

2. **Check if concerts load**
   - Should show data from Railway backend
   - Not hardcoded/local data

3. **Test booking flow:**
   - Click concert → modal opens
   - Click "Book Now" → Google login
   - Complete booking → should save to database

4. **Check admin panel:**
   - Frontend URL + `/admin`
   - Login: admin / admin123
   - Should show 3 concerts and any reservations

---

## ✨ Your Deployment URLs

After completion, you'll have:

```
Backend API:  https://[railway-backend-domain]/api
Frontend:     https://[railway-frontend-domain]/
Admin Panel:  https://[railway-frontend-domain]/admin
```

---

## 🧪 Quick Test Commands

### Test Backend API (after deployment)
```bash
curl https://[your-railway-backend-url]/api/health
# Should return: {"status":"ok","database":"connected"}

curl https://[your-railway-backend-url]/api/concerts
# Should return: [{"id":1,"name":"Concert 1",...}]
```

### Test Frontend (after deployment)
```
Open in browser: https://[your-frontend-url]/
Should see: Concert listing page with data from backend
```

---

## 🆘 Troubleshooting

### Frontend says "Can't connect to backend"
- **Fix:** Update `VITE_API_BASE_URL` in Frontend's Variables
  1. Railway → Frontend service → Variables
  2. Set: `VITE_API_BASE_URL=https://[your-backend-url]`
  3. **Redeploy** (click the deploy button again)

### Backend not responding
- **Check logs:** Railway → Backend → Logs tab
  - Look for error messages
  - Common issue: Missing `DATABASE_URL` variable

### Admin page shows "Network Error"
- **Fix:** Make sure `FRONTEND_URL` is set correctly in Backend variables
  - It needs to match your actual frontend domain

---

## 📊 Deployment Checklist

- [ ] Step 1: Set Backend variables in Railway
- [ ] Step 1: Backend redeploys automatically
- [ ] Step 2: Add Frontend service to Railway
- [ ] Step 2: Frontend builds and deploys (3-5 min wait)
- [ ] Step 2: Copy Frontend URL
- [ ] Step 1b: Update Backend `FRONTEND_URL` variable
- [ ] Step 1b: Backend redeploys again
- [ ] Step 3: Test frontend URL in browser
- [ ] Step 3: Test concerts load from backend
- [ ] Step 3: Test booking flow works
- [ ] Step 3: Test admin panel works

---

## 🎉 Success Indicators

✅ Everything works if:
1. Frontend loads without errors
2. Concerts appear (from backend database)
3. Can click concert and see booking modal
4. Can login with Google
5. Can make a reservation
6. Admin panel shows data
7. No red errors in browser console

---

## 📞 Quick Reference

**Your GitHub Repo:**
```
https://github.com/Piyawut-Boss/229-concert-booking
```

**Your Admin Credentials:**
```
Username: admin
Password: admin123
```

**Your Google OAuth:**
```
Client ID: 164061782280-6nl35e4kcagntgu622iqgl2i0hjfcf31.apps.googleusercontent.com
```

**Your Email:**
```
Email: 6710110264@psu.ac.th
Password: uvflotmlfettrfwt (app password)
```

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| Set Backend Variables | 5 min | ⏳ Do this first |
| Deploy Frontend | 10 min | ⏳ Do this second |
| Test Everything | 5 min | ⏳ Do this third |
| **Total** | **20 min** | 🚀 Live! |

---

**Follow these 3 easy steps and your concert booking system will be LIVE in 20 minutes! 🎵**

---

### One More Thing

If you get stuck on any step or see an error:

1. **Check Railway logs:** railway.app → Your service → Logs tab
2. **Check browser console:** Open frontend, press F12, look at Console tab
3. **Check all variables are set:** Railway → Variables tab (make sure nothing is blank)

**You've got this! 🚀**
