import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function AdminLogin() {
  const navigate = useNavigate()
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
      
      // Store token in localStorage
      localStorage.setItem('adminToken', response.data.token)
      localStorage.setItem('adminUser', JSON.stringify(response.data.user))
      
      navigate('/admin/dashboard')
    } catch (error) {
      setError(error.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ')
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>🔐 Admin Login</h1>
          <p>เข้าสู่ระบบจัดการ</p>
        </div>

        <div className="card" style={{maxWidth: '400px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '24px'}}>
            <div style={{
              fontSize: '64px',
              marginBottom: '16px'
            }}>
              👨‍💼
            </div>
            <h2>Admin Dashboard</h2>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="alert alert-info" style={{fontSize: '14px'}}>
            <strong>ทดสอบระบบ:</strong><br/>
            Username: admin<br/>
            Password: admin123
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="กรอก username"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="กรอก password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{width: '100%'}}
              disabled={loading}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
