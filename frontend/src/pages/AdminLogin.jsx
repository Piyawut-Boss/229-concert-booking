import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { FaLock, FaUser } from 'react-icons/fa'
import './AdminLogin.css'

function AdminLogin() {
  const navigate = useNavigate()
  const { loginAdmin } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/admin/login', formData)
      
      // Use new loginAdmin function
      loginAdmin(response.data.user, response.data.token)
      
      navigate('/admin/dashboard')
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        {/* Left side - Branding */}
        <div className="admin-login-brand">
          <div className="brand-icon">🔐</div>
          <h1>Admin Portal</h1>
          <p>Concert Ticket Management System</p>
          <div className="brand-features">
            <div className="feature">✓ Secure Access</div>
            <div className="feature">✓ Role-Based Control</div>
            <div className="feature">✓ Real-time Analytics</div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="admin-login-form-container">
          <div className="form-header">
            <h2>Admin Login</h2>
            <p>Please login with your admin credentials</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="username">
                <FaUser /> Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter admin username"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FaLock /> Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter admin password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn-login-submit"
              disabled={loading}
            >
              {loading ? '🔄 Logging in...' : '🔓 Login'}
            </button>
          </form>

          <div className="form-notes">
            <div className="note-section">
              <h4>🚀 Demo Credentials:</h4>
              <p><strong>Username:</strong> admin</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
            <div className="note-section">
              <h4>📝 Security Note:</h4>
              <p>Only administrators with valid credentials can access this panel. User accounts created through Google login have limited access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
