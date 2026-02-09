// This file will be overwritten during Docker build with actual values
window.__CONCERT_CONFIG__ = {
  VITE_API_BASE_URL: 'https://229-concert-booking-production.up.railway.app',
  VITE_GOOGLE_CLIENT_ID: '164061782280-6nl35e4kcagntgu622iqgl2i0hjfcf31.apps.googleusercontent.com',
  VITE_TURNSTILE_SITE_KEY: '0x4AAAAAAACY7SOAVZF09WFXk'
};

console.log('=== Concert Config Loaded ===');
console.log('API Base URL:', window.__CONCERT_CONFIG__.VITE_API_BASE_URL);
console.log('Turnstile Key:', window.__CONCERT_CONFIG__.VITE_TURNSTILE_SITE_KEY);
console.log('============================');
