# 🚀 FRONTEND DEPLOYMENT - COPY & PASTE ONLY

**This will take 5 minutes. Just follow the steps and copy-paste values.**

---

## STEP 1: Open Railway
Go to: https://railway.app

---

## STEP 2: Click "Add Service"
- You'll see your project dashboard
- Look for **"+ Add Service"** button (top right area)
- Click it

---

## STEP 3: Select GitHub
- A menu appears
- Click **"GitHub"**
- It asks you to select a repository

---

## STEP 4: Search Repository
- Search box appears
- Type: `229-concert-booking`
- Click on it when it appears
- Click to confirm selection

---

## STEP 5: Configure Build

**You'll see a form with "Build Command" field**

DELETE what's there and PASTE THIS:
```
cd frontend && npm run build
```

---

## STEP 6: Configure Start

**You'll see a form with "Start Command" field**

DELETE what's there and PASTE THIS:
```
npm run preview
```

---

## STEP 7: Click "Variables" Tab

On the deployment configuration page, look for "Variables" tab.
Click it.

---

## STEP 8: Add Variable 1

Click **"New Variable"** or **"Add Variable"**

**Field 1 (Name):** Copy-paste this:
```
VITE_API_BASE_URL
```

**Field 2 (Value):** Copy-paste this:
```
https://concert-booking-production.railway.app
```

Click **"Add"** or **"Save"**

---

## STEP 9: Add Variable 2

Click **"New Variable"** again

**Field 1 (Name):** Copy-paste this:
```
VITE_GOOGLE_CLIENT_ID
```

**Field 2 (Value):** Copy-paste this:
```
164061782280-6nl35e4kcagntgu622iqgl2i0hjfcf31.apps.googleusercontent.com
```

Click **"Add"** or **"Save"**

---

## STEP 10: Add Variable 3

Click **"New Variable"** one more time

**Field 1 (Name):** Copy-paste this:
```
NODE_ENV
```

**Field 2 (Value):** Copy-paste this:
```
production
```

Click **"Add"** or **"Save"**

---

## STEP 11: Deploy

Look for **"Deploy"** button or **"Create Deployment"** button.
Click it.

**You'll see "Deploying..." or status updates.**

**WAIT 3-5 MINUTES** for it to finish.

---

## STEP 12: Get Your Frontend URL

Once deployment is done (green checkmark ✅ appears):

- Look at the service name/header
- You'll see a domain that looks like:
  ```
  https://concert-frontend-xyz123.railway.app
  ```
- **Copy this URL** - this is your FRONTEND!

---

## ✅ DONE!

Your complete system is now LIVE:

```
🌐 Frontend:  https://[your-frontend-url]
🔗 Backend:   https://concert-booking-production.railway.app/api
👨‍💼 Admin:     https://[your-frontend-url]/admin
```

---

## 🧪 Test It

1. **Open your frontend URL** in browser
2. **Should see concert list** loading
3. **Click a concert** → Booking modal opens
4. **Click "Book Now"** → Google login appears
5. **Go to /admin** → Login with admin/admin123

---

## ⚠️ COMMON MISTAKES TO AVOID

❌ Don't accidentally click "Delete" instead of "Deploy"
❌ Don't edit values after copying - paste them exactly
❌ Don't forget the 3 variables - all 3 are needed
❌ Don't close the page before it finishes deploying

---

## 🆘 If Something Goes Wrong

**"Build failed"**
- Check: Did you paste build command correctly?
- Try: Redeploy (click Deploy again)

**"Can't see concerts"**
- Check: Browser console (F12)
- Fix: Make sure VITE_API_BASE_URL is correct

**"Admin login broken"**
- Check: Go to /admin (not just domain)
- Login: admin / admin123

---

**Follow these 12 steps exactly. Should take 5-10 minutes total. Let me know when done! 🚀**
