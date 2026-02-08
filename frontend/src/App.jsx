import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import HomePage from "./pages/HomePage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import MyReservations from "./pages/MyReservations";
import LoginModal from "./components/LoginModal";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import logo from "../assets/WaveLogo.png";
import "./App.css";

function AppContent() {
  const { user, admin, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="nav-brand">
            <img src={logo} alt="Logo" className="nav-logo" />

            <span>Concert Ticket System</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              หน้าหลัก
            </Link>
            <Link to="/my-reservations" className="nav-link">
              การจองของฉัน
            </Link>
            {admin && (
              <Link to="/admin/dashboard" className="nav-link">
                Admin
              </Link>
            )}
            {!admin && (
              <Link to="/admin" className="nav-link">
                🔐 Admin Login
              </Link>
            )}
            {user ? (
              <div className="user-section">
                <span className="user-name">👤 {user.name}</span>
                <button className="btn-logout" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="btn-login"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>

      <footer className="footer">
        <div className="container">
          <p>
            © 2026 Concert Ticket Reservation System | Built with React &
            Node.js
          </p>
          <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.8 }}>
            Features: Multithreading, Concurrency Control, Distributed System
            Architecture
          </p>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AppContent />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
