import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Log environment variables for debugging
console.log('=== Environment Variables ===')
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
console.log('VITE_TURNSTILE_SITE_KEY:', import.meta.env.VITE_TURNSTILE_SITE_KEY)
console.log('NODE_ENV:', import.meta.env.NODE_ENV)
console.log('============================')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
