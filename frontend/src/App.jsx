import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import MyReservations from './pages/MyReservations'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="container nav-container">
            <Link to="/" className="nav-brand">
              🎵 Concert Ticket System
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">หน้าหลัก</Link>
              <Link to="/my-reservations" className="nav-link">การจองของฉัน</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>

        <footer className="footer">
          <div className="container">
            <p>© 2026 Concert Ticket Reservation System | Built with React & Node.js</p>
            <p style={{fontSize: '14px', marginTop: '8px', opacity: 0.8}}>
              Features: Multithreading, Concurrency Control, Distributed System Architecture
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
