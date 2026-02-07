# Cloudflare Turnstile Setup Guide

This guide explains how to set up Cloudflare Turnstile for bot protection in your concert booking application.

## What is Cloudflare Turnstile?

Cloudflare Turnstile is a free and modern bot management solution that:
- Protects against bot abuse without annoying users
- Uses intelligent behavior analysis instead of puzzles
- Works on all devices (mobile, desktop, tablet)
- Free tier includes 1 million requests/month
- No Cloudflare account subscription required

## Development Setup (Already Configured)

The application comes pre-configured with Cloudflare's test key:
```
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

This test key automatically passes all verification requests for development and testing purposes.

## Production Setup

### Step 1: Create Cloudflare Account
1. Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. Sign up for a free Cloudflare account (no payment required for Turnstile)
3. Verify your email address

### Step 2: Create Turnstile Site
1. In Cloudflare dashboard, navigate to **Turnstile** in the left sidebar
2. Click **Create Site** button
3. Fill in the form:
   - **Site name**: `Concert Booking System` (or your preferred name)
   - **Domain**: Your production domain (e.g., `example.com`)
   - **Mode**: Select `Managed Challenge` (recommended) or `Challenge Mode`
   
   **Mode Explanation:**
   - **Managed Challenge**: Cloudflare automatically decides when to show verification (recommended)
   - **Challenge Mode**: Always shows verification to users
   - **Non-Interactive**: Invisible bot detection (enterprise only)

4. Accept the terms and click **Create**

### Step 3: Get Your Site Key
1. After creation, you'll see your **Site Key** and **Secret Key**
2. Copy the **Site Key** (you'll need this for frontend)
3. Save the **Secret Key** safely (use for backend verification)

### Step 4: Update Environment Variables

**Frontend (.env file):**
```dotenv
# Replace with your production Site Key from Cloudflare Turnstile
VITE_TURNSTILE_SITE_KEY=YOUR_PRODUCTION_SITE_KEY_HERE
```

**Backend (.env file - if implementing verification):**
```dotenv
CLOUDFLARE_TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY_HERE
```

### Step 5: Backend Implementation (Optional but Recommended)

To verify tokens on the backend (more secure):

```javascript
// In your backend (Node.js/Express example)
const verifyTurnstileToken = async (token) => {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY
  
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: secretKey,
      response: token
    })
  })
  
  const data = await response.json()
  return data.success
}
```

## Testing

### Development Testing
1. Run `npm run dev` in the frontend directory
2. Click "เข้าสู่ระบบ" (Login) button
3. You should see the Turnstile widget
4. Complete the verification (test key auto-passes)
5. Google login button becomes enabled after verification
6. Try logging in with Google

### Production Testing
1. Deploy frontend with your production Site Key
2. Visit your site and test the login flow
3. Verify Turnstile widget appears and works
4. Check Cloudflare dashboard for verification analytics

## Deployment Checklist

- [ ] Created Cloudflare account
- [ ] Created Turnstile site in Cloudflare dashboard
- [ ] Copied production Site Key
- [ ] Updated `.env` with production Site Key
- [ ] Tested login flow in development
- [ ] Deployed to production
- [ ] Verified Turnstile widget loads on production site
- [ ] Checked Cloudflare dashboard for bot detection analytics

## Dashboard Analytics

In Cloudflare dashboard, you can view:
- **Challenge Success Rate**: Percentage of users who successfully verified
- **Challenge Requests**: Total verification requests
- **Bot Traffic Blocked**: Number of detected bot attempts
- **User Experience**: Performance metrics

## Pricing

- **Free**: Up to 1,000,000 requests/month
- **Pro**: Unlimited requests (starts at $20/month)
- **Enterprise**: Custom solutions

For most concert booking systems, the free tier is sufficient.

## Troubleshooting

### Widget not appearing
- Verify `VITE_TURNSTILE_SITE_KEY` is set in `.env`
- Check browser console for errors
- Ensure `react-turnstile` package is installed

### "Invalid Site Key" error
- Verify the Site Key is copied correctly
- Ensure Site Key domain matches your website domain
- Check in Cloudflare dashboard that site is active

### Token verification fails (backend)
- Verify Secret Key is correct
- Ensure backend has internet connection to Cloudflare API
- Check that POST request to `challenges.cloudflare.com` is not blocked

## Security Notes

1. **Frontend Only**: Currently, the implementation verifies on frontend only
2. **Recommendation**: Implement backend verification for production (see Step 5)
3. **Secret Key**: Never expose Secret Key in frontend code or repositories
4. **Token Validation**: Add token validation to your login API endpoint

## Additional Resources

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [React Turnstile Package](https://github.com/marsidev/react-turnstile)
- [Bot Management Best Practices](https://developers.cloudflare.com/turnstile/get-started/)

## Support

For issues with:
- **Cloudflare Setup**: Visit [https://support.cloudflare.com](https://support.cloudflare.com)
- **React Turnstile**: Check [GitHub Issues](https://github.com/marsidev/react-turnstile/issues)
- **Application Integration**: Refer to LoginModal.jsx component
