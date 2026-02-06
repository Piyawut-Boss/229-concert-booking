import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './GoogleLogin.css'

function GoogleLoginComponent() {
  const { login } = useAuth()

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      // Decode the JWT token to get user info
      const token = credentialResponse.credential
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      
      const payload = JSON.parse(jsonPayload)
      
      // Create user object with decoded data
      const userData = {
        name: payload.name || 'Google User',
        email: payload.email,
        picture: payload.picture,
        token: token,
        googleId: payload.sub
      }
      
      // Save user to context (immediately, for UI update)
      login(userData)

      // Send login notification to backend (asynchronous, don't wait)
      try {
        await axios.post('/api/login', 
          {
            userName: userData.name,
            userEmail: userData.email,
            googleToken: token
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        console.log('✅ Login notification sent to server')
      } catch (error) {
        console.warn('⚠️ Could not send login notification:', error.message)
        // Don't fail the login if email sending fails
      }
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }

  const handleLoginError = () => {
    console.log('Login Failed')
  }

  return (
    <div className="google-login-container">
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
        text="signin"
        theme="outline"
        size="large"
      />
    </div>
  )
}

export default GoogleLoginComponent
