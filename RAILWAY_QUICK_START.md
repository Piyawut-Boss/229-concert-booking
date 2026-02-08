# 🚂 Railway Quick Deploy

Quick deployment steps for Railway:

## 1️⃣ Push Code to GitHub
```bash
git add .
git commit -m "Railway deployment ready"
git push origin main
```

## 2️⃣ Create Railway Project
- Go to https://railway.app
- Sign in with GitHub
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose this repository
- Select root directory (default)

## 3️⃣ Add PostgreSQL
- In Railway dashboard
- Click "Add Service"
- Select "PostgreSQL"
- Click "Deploy"

## 4️⃣ Add Redis (Optional)
- For real-time features (Pub/Sub)
- Click "Add Service"
- Select "Redis"
- Click "Deploy"

## 5️⃣ Set Environment Variables
```
NODE_ENV=production
PORT=8080
GOOGLE_CLIENT_ID=<your_id>
GOOGLE_CLIENT_SECRET=<your_secret>
EMAIL_USER=<your_email>
EMAIL_PASSWORD=<your_app_password>
FRONTEND_URL=<your_frontend_url>
BACKEND_URL=<your_backend_url>
SESSION_SECRET=<generate_random_string>
```

## 6️⃣ Deploy
- Click "Deploy" on backend service
- Wait for build to complete (2-5 minutes)
- Check logs for any errors

## 7️⃣ Initialize Database
```bash
# Via CLI:
railway run npm run db:init

# Or via Dashboard Shell:
npm run db:init
```

## 8️⃣ Test
```bash
curl https://your-api.railway.app/api/health
```

Done! 🎉

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed guide.
