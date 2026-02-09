import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Log all config sources for debugging
console.log('=== Config Sources ===')
console.log('1. Window Config:', window.__CONCERT_CONFIG__)
console.log('2. Import Meta Env:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  VITE_TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  NODE_ENV: import.meta.env.NODE_ENV
})
console.log('======================')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
