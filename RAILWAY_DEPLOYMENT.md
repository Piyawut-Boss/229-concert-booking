# 🚂 Railway Deployment Guide

## Quick Start

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository with your code
- PostgreSQL database (Railway can provision)
- Redis (optional, for Pub/Sub features)

---

## Step 1: Prepare Environment Variables

Update these critical variables in Railway dashboard:

```env
# Required
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:password@host:5432/concert_ticket_system

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Application URLs
FRONTEND_URL=https://your-app.railway.app
BACKEND_URL=https://your-api.railway.app

# Optional but recommended
SESSION_SECRET=generate_random_string_here
REDIS_URL=redis://your-redis-url
```

---

## Step 2: Deploy on Railway

### Option A: Deploy from GitHub (Recommended)

1. Go to railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub repository
5. Select this repository
6. Railway auto-detects Dockerfile and deploys

### Option B: Deploy from CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link project
railway link

# Deploy
railway up
```

---

## Step 3: Add Services

### PostgreSQL Database
```bash
# In Railway dashboard:
1. Click "Add Service"
2. Select "PostgreSQL"
3. Copy DATABASE_URL from service variables
4. Add to your project's environment variables
```

### Redis (Optional)
```bash
# For real-time features (Pub/Sub):
1. Click "Add Service"
2. Select "Redis"
3. Copy REDIS_URL from service variables
4. Add to your project's environment variables
```

---

## Step 4: Initialize Database

Once deployed, run migrations:

```bash
# Via Railway CLI
railway run npm run db:init

# Or via Dashboard > Service > Shell:
npm run db:init
```

---

## Step 5: Configure Domain

### Frontend Domain
1. In Railway dashboard, go to Frontend service
2. Click "Settings" > "Custom Domain"
3. Add your domain (e.g., concert-tickets.railway.app)
4. Update FRONTEND_URL in environment

### Backend Domain
1. In Railway dashboard, go to Backend service
2. Click "Settings" > "Custom Domain"
3. Add your domain (e.g., api.concert-tickets.railway.app)
4. Update BACKEND_URL in environment

---

## Step 6: SSL/TLS Setup

Railway automatically provides SSL certificates. Just use HTTPS URLs:
- Frontend: `https://concert-tickets.railway.app`
- Backend: `https://api.concert-tickets.railway.app`

---

## Step 7: Monitor & Debug

### View Logs
```bash
# Via CLI
railway logs -f

# Via Dashboard
1. Go to service
2. Click "Logs" tab
3. Follow real-time output
```

### Check Health
```bash
curl https://api.concert-tickets.railway.app/api/health
```

### View Metrics
- Dashboard > Service > Metrics tab
- Monitor CPU, Memory, Network usage

---

## Environment Variables Setup

### Create in Railway Dashboard:

| Variable | Value | Type |
|----------|-------|------|
| NODE_ENV | production | Config |
| PORT | 8080 | Config |
| DATABASE_URL | From PostgreSQL service | Config |
| REDIS_URL | From Redis service (optional) | Config |
| GOOGLE_CLIENT_ID | From Google Cloud | Secret |
| GOOGLE_CLIENT_SECRET | From Google Cloud | Secret |
| EMAIL_USER | Your Gmail | Secret |
| EMAIL_PASSWORD | Gmail app password | Secret |
| FRONTEND_URL | Your frontend URL | Config |
| BACKEND_URL | Your backend URL | Config |
| SESSION_SECRET | Generate random string | Secret |

---

## Build & Deployment Settings

### Dockerfile Configuration
- **Builder:** Dockerfile (multi-stage)
- **Start Command:** `node backend/server.js`
- **Port:** 8080

### Build Output
```
Stage 1: Backend dependencies
Stage 2: Frontend build (Vite)
Stage 3: Combined production image
```

---

## Performance Optimization

### Database Connection Pooling
```javascript
// Automatically configured in database-production.js
Max connections: 20
Min connections: 2
Idle timeout: 30s
```

### Frontend Static Files
- Vite builds optimized production files
- Served from `/frontend/dist` directory
- Auto-minified and tree-shaken

### Caching Headers
```
/dist/* -> Cache: 1 year (immutable)
/api/* -> Cache: no-cache
/uploads/* -> Cache: 1 hour
```

---

## Monitoring & Alerts

### Health Check
```
Endpoint: /api/health
Interval: 30 seconds
Timeout: 10 seconds
```

### Error Tracking
1. Configure error logs in dashboard
2. Set up notifications
3. Monitor database connection errors

---

## Backup & Recovery

### Automatic Backups
Railway PostgreSQL includes:
- Daily automated backups
- 7-day retention
- Point-in-time recovery

### Manual Backup
```bash
railway run npm run db:backup
```

### Restore from Backup
```bash
railway run npm run db:restore
```

---

## Common Issues & Solutions

### Issue: Database Connection Failed
```
Solution:
1. Check DATABASE_URL is set correctly
2. Verify PostgreSQL service is running
3. Check network access in Firebase settings
4. Review logs for detailed error
```

### Issue: Frontend Doesn't Load
```
Solution:
1. Check FRONTEND_URL environment variable
2. Verify Vite build completed successfully
3. Check domain DNS settings
4. Review browser console for API errors
```

### Issue: Email Not Sending
```
Solution:
1. Verify Gmail app password (not regular password)
2. Check EMAIL_USER and EMAIL_PASSWORD are set
3. Enable 2FA on Google account
4. Review SMTP rate limits (100 emails/day free tier)
```

### Issue: Slow Performance
```
Solution:
1. Check database connection pool settings
2. Monitor PostgreSQL resource usage
3. Enable Redis for caching
4. Review API response times in logs
```

---

## Production Checklist

- [x] Environment variables configured
- [x] Database initialized and seeded
- [x] SSL/TLS enabled (automatic)
- [x] Health checks passing
- [x] Logs monitoring configured
- [x] Database backups enabled
- [x] Error alerting set up
- [x] Domain configured
- [x] Performance optimized
- [x] Security headers enabled

---

## Next Steps

### After Successful Deployment:

1. **Set up CI/CD**
   ```bash
   # Automatic deploys on git push
   1. Go to Settings > Source
   2. Select "GitHub" as source
   3. Auto-Deploy on push enabled
   ```

2. **Add Monitoring**
   - Set up error tracking (Sentry, LogRocket)
   - Configure performance monitoring
   - Set up uptime alerts

3. **Scale Infrastructure**
   - Add caching layer (Redis)
   - Enable database read replicas
   - Configure CDN for static files

4. **Implement Analytics**
   - Track user behavior
   - Monitor revenue metrics
   - Analyze performance bottlenecks

---

## Support & Resources

- Railway Docs: https://docs.railway.app
- Railway Community: https://railway.app/community
- Status Page: https://status.railway.app

---

**Your Concert Ticket System is now ready for production on Railway! 🚀**
