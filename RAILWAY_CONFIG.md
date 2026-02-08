# 🚂 Railway Configuration Details

## Service Routing

### Backend Service
```
URL: https://your-project-backend.railway.app
Port: 8080
Start Command: node backend/server.js
Build Command: npm install (auto-detected)
```

### Frontend Service (Optional)
```
URL: https://your-project-frontend.railway.app
Port: 3000
Build Command: npm run build
Start Command: npm start (or serve dist/)
```

### PostgreSQL Service
```
Connection: Automatic
Environment: DATABASE_URL
Default Database: railway
User: postgres
```

### Redis Service (Optional)
```
Connection: Automatic
Environment: REDIS_URL
Port: 6379
```

---

## Network Configuration

### CORS Settings
Railway uses secure CORS by default. Update these in backend:

```javascript
// Allowed origins
const allowedOrigins = [
  'https://your-frontend.railway.app',
  'https://your-domain.com',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### API Keys & Secrets
All sensitive data in Railway dashboard:
1. Go to Service Settings
2. Click "Variables"
3. Add your secrets (marked as Secret type)
4. Never commit .env files

---

## Database Configuration

### Connection String Format
```
postgresql://user:password@host:port/database

Example:
postgresql://postgres:password123@db.railway.internal:5432/railway
```

### Automatic Failover
- Railway PostgreSQL: Multi-AZ with automatic failover
- Automatic backups: Daily
- Point-in-time recovery: 7 days

### Connection Pooling
```javascript
// Already configured in database-production.js
const poolConfig = {
  max: 20,           // Max connections
  min: 2,            // Min connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};
```

---

## SSL/TLS Configuration

### Automatic HTTPS
- Railway provides free SSL certs
- Auto-renewal enabled
- Update FRONTEND_URL and BACKEND_URL to use https://

### Custom Domains
1. In Railway dashboard > Service > Settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records

---

## Monitoring & Observability

### Health Checks
```bash
curl https://your-api.railway.app/api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-02-09T10:30:00Z",
  "uptime": 3600,
  "environment": "production",
  "database": "connected",
  "version": "1.0.0"
}
```

### Log Levels
```
NODE_ENV=production
LOG_LEVEL=info  // Options: error, warn, info, debug

In logs tab:
- Error logs (always visible)
- Warnings (when LOG_LEVEL >= warn)
- Info (when LOG_LEVEL >= info)
- Debug (when LOG_LEVEL >= debug)
```

### Resource Monitoring
Railway dashboard shows:
- CPU usage
- Memory usage
- Network in/out
- Disk storage

---

## Scale Configuration

### Auto-Scaling (Premium Feature)
```yaml
Minimum instances: 1
Maximum instances: 5
CPU threshold: 70%
Memory threshold: 80%
Scale up cooldown: 1 min
Scale down cooldown: 5 min
```

### Memory Allocation
```
Small: 512 MB
Medium: 1 GB
Large: 2 GB
XL: 4 GB
```

### CPU Options
```
Shared: 0.5 CPU (free tier)
Standard: 1 CPU (paid)
High: 2 CPU (paid)
```

---

## CI/CD Integration

### Auto-Deploy on Push
1. Service Settings > GitHub
2. Toggle "Enable auto-deploy"
3. Select branch (main, develop, etc.)
4. Auto-deploys on each push

### Manual Deploy
```bash
# Via CLI
railway up

# Via Dashboard
Click "Deploy" button on service
```

### Build Logs
```
1. Service > Build tab
2. View all build attempts
3. See build duration
4. Troubleshoot failures
```

---

## Environment by Stage

### Development
```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
DB_POOL_MAX=5
```

### Staging
```env
NODE_ENV=staging
DEBUG=false
LOG_LEVEL=info
DB_POOL_MAX=10
```

### Production
```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
DB_POOL_MAX=20
RATE_LIMIT_REQUESTS=100
```

---

## Backup & Disaster Recovery

### Database Backups
```bash
# Automatic daily backups
# Manual backup:
railway run npm run db:backup

# Restore from backup:
railway run npm run db:restore
```

### Data Retention
- Daily backups: 7 days
- Weekly backups: 30 days
- Custom retention: available on Pro plan

### Point-in-Time Recovery
```bash
# Recovery to specific timestamp
# Contact Railway support for assistance
```

---

## Cost Optimization

### Free Tier
- 512 MB RAM
- $5/month credit
- 1 concurrent project

### Shared CPU vs Dedicated
- Shared CPU: $7/month (0.5 CPU, 512 MB)
- Standard CPU: $12/month (1 CPU, 1 GB)
- PostgreSQL: $15/month
- Redis: $15/month

### Estimated Total (Starter)
- Backend: $7 (shared) + $15 (PostgreSQL) = $22/month
- Frontend: $7 (shared) = $7/month
- Optional Redis: $15/month
- **Total: $29-44/month**

---

## Troubleshooting

### Build Failures
```
Check:
1. nodejs version compatibility
2. package.json dependencies
3. Build commands
4. Disk space (logs available in build tab)
```

### Runtime Errors
```
Check:
1. Environment variables set
2. Database connection
3. Port 8080 available
4. Memory usage not exceeded
5. Network connectivity
```

### Cold Starts
```
Reduce by:
1. Optimize dependencies
2. Use smaller Docker image
3. Enable persistent disk
4. Pre-warm connections
```

### Database Connection Timeouts
```
Solution:
1. Increase connection timeout:
   DB_CONNECTION_TIMEOUT=5000
2. Reduce connection pool:
   DB_POOL_MAX=10
3. Check database load
4. Review network latency
```

---

## Best Practices

### Security
- [x] Use environment variables for secrets
- [x] Enable HTTPS (automatic)
- [x] Set rate limiting
- [x] Validate all inputs
- [x] Use strong session secrets

### Performance
- [x] Enable caching headers
- [x] Compress responses (gzip)
- [x] Use connection pooling
- [x] Optimize database queries
- [x] Monitor slow queries

### Reliability
- [x] Add health checks
- [x] Implement error handling
- [x] Enable automatic backups
- [x] Set up error alerts
- [x] Monitor uptime

### Operations
- [x] Use auto-deploy on git push
- [x] Keep logs for debugging
- [x] Monitor resource usage
- [x] Scale gradually
- [x] Test environments separately

---

**Your app is ready for production on Railway! 🚀**
