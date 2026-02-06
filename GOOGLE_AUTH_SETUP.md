# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the Concert Ticket System.

## Overview

Users can now log in with their Google account before purchasing concert tickets. This adds a layer of authentication and security to the booking system.

## Prerequisites

1. A Google Cloud Project
2. The Concert Ticket System repository

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Concert Ticket System")
3. Wait for the project to be created

### 2. Enable Google OAuth APIs

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for and enable the following APIs:
   - Google+ API
   - Google Identity Services API

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. You may need to create an OAuth consent screen first:
   - Choose **External** user type
   - Fill in the required fields (app name, user support email, etc.)
   - Add required scopes (email, profile)
   - Add test users if in development
4. Back to creating OAuth client ID:
   - Choose **Web application**
   - Name: "Concert Ticket System"
   - Add Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:3000
     https://yourdomain.com
     ```
   - Add Authorized redirect URIs:
     ```
     http://localhost:5173
     http://localhost:3000
     https://yourdomain.com
     ```
5. Copy the **Client ID** (you'll need this)

### 4. Configure Frontend

1. Create a `.env` file in the `frontend` directory:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Edit `frontend/.env` and add your Google Client ID:
   ```
   VITE_REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```

3. Update `frontend/src/App.jsx` if needed to use the environment variable (already done)

### 5. Configure Backend

1. Create a `.env` file in the `backend` directory:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` and add your configuration:
   ```
   PORT=5000
   GOOGLE_CLIENT_ID=your_client_id_here
   ```

3. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

### 6. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## How It Works

### Frontend Flow

1. **Unauthenticated User**: When a user clicks "Book Tickets", they see a Google login button
2. **Login**: User clicks "Sign in with Google" and authenticates
3. **Authenticated**: After login, the booking form appears pre-filled with their Google account info
4. **Booking**: User completes the booking with their email

### Backend Verification

- The backend includes a middleware (`requireGoogleAuth`) that can verify Google tokens
- Reservations are marked with `googleAuth: true` when made by authenticated users
- Currently in demo mode (doesn't require production-level token verification)

## Testing

### Local Testing

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser
4. Click on a concert and try to book
5. You should see the Google login button
6. Click to sign in with your Google account
7. Complete the booking

### Demo Mode

For development/testing without full Google OAuth setup:
- The frontend accepts token-like strings
- The backend's `verifyGoogleToken()` function has a demo mode that accepts any token with length > 10
- To enable full verification, uncomment the production code in `backend/server.js`

## Enabling Production Token Verification

In `backend/server.js`, the `verifyGoogleToken()` function currently uses demo mode. To enable real verification:

1. Uncomment the production code block:
   ```javascript
   // In backend/server.js, verifyGoogleToken function
   const ticket = await googleClient.verifyIdToken({
     idToken: token,
     audience: GOOGLE_CLIENT_ID,
   });
   ```

2. Make sure your `.env` file has the correct `GOOGLE_CLIENT_ID`

3. Restart the backend

## Features

✅ Users must log in with Google to book tickets
✅ Google account info pre-fills the booking form
✅ Logout button in navbar
✅ User session persists (localStorage)
✅ Admin bookings not affected (still work without auth)
✅ All existing functionality preserved
✅ Concurrent booking protection maintained
✅ Audit logs show authentication status

## Troubleshooting

### "Invalid Google authentication" error
- Check that your Client ID is correct in both frontend and backend `.env` files
- Verify the redirect URIs are set correctly in Google Cloud Console
- Make sure the token is being passed correctly

### Google login button not appearing
- Verify `VITE_REACT_APP_GOOGLE_CLIENT_ID` is set in frontend/.env
- Check browser console for errors
- Ensure `@react-oauth/google` is installed: `npm install`

### Bookings still work without login
- In development/demo mode, this is intentional (uses token-like validation)
- To enforce strict authentication, uncomment production code in `verifyGoogleToken()`

## Security Notes

- Client IDs are not sensitive and can be in frontend config
- In production, enable the full token verification in `verifyGoogleToken()`
- Never commit `.env` files with real credentials to version control
- Use environment variables for all sensitive config

## Support

For issues with Google OAuth setup, visit:
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Identity Documentation](https://developers.google.com/identity)
- [React OAuth Library Documentation](https://www.npmjs.com/package/@react-oauth/google)
