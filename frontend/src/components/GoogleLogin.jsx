import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import './GoogleLogin.css'

function GoogleLoginComponent() {
  const { login } = useAuth()

  const handleLoginSuccess = (credentialResponse) => {
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
      
      login(userData)
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }

  const handleLoginError = () => {
    console.log('Login Failed')
  }

  return (
    <div className="google-login-container">      <GoogleLogin
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