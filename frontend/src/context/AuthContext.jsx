import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Regular user state (Google login)
  const [user, setUser] = useState(null)
  // Admin state
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user/admin is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // Add user role if not present
        if (!userData.role) {
          userData.role = 'user'
        }
        setUser(userData)
      } catch (e) {
        localStorage.removeItem('user')
      }
    }

    const storedAdmin = localStorage.getItem('adminUser')
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin)
        setAdmin(adminData)
      } catch (e) {
        localStorage.removeItem('adminUser')
        localStorage.removeItem('adminToken')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    // userData comes with: name, email, picture, token, googleId
    // Add user role
    const userWithRole = { ...userData, role: 'user' }
    setUser(userWithRole)
    localStorage.setItem('user', JSON.stringify(userWithRole))
    return userWithRole
  }

  const loginAdmin = (adminData, token) => {
    // adminData comes with: id, username, role
    setAdmin(adminData)
    localStorage.setItem('adminUser', JSON.stringify(adminData))
    localStorage.setItem('adminToken', token)
    return adminData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    // Also ensure admin data is cleared when user logs out
    setAdmin(null)
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminToken')
  }

  const logoutAdmin = () => {
    setAdmin(null)
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminToken')
    // Keep user login if they're also logged in as user
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      admin,
      loading, 
      login, 
      logout,
      loginAdmin,
      logoutAdmin,
      isAdminLoggedIn: !!admin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
