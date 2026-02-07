import GoogleLoginComponent from './GoogleLogin'
import './LoginModal.css'
import { FaTimes } from 'react-icons/fa'

function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="login-modal-backdrop" onClick={onClose}></div>

      {/* Modal */}
      <div className="login-modal">
        <div className="login-modal-content">
          {/* Close Button */}
          <button className="login-modal-close" onClick={onClose}>
            <FaTimes />
          </button>

          {/* Decorative Background Elements */}
          <div className="modal-decoration top-left"></div>
          <div className="modal-decoration bottom-right"></div>

          {/* Header Section */}
          <div className="login-modal-header">
            <div className="header-icon">🎵</div>
            <h1 className="modal-title">เข้าสู่ระบบ</h1>
            <p className="modal-subtitle">เลือกวิธีการเข้าสู่ระบบเพื่อจองตั๋วคอนเสิร์ต</p>
          </div>

          {/* Body Section */}
          <div className="login-modal-body">
            <div className="login-option-label">กรุณาเลือกวิธีการล็อกอิน</div>
            <GoogleLoginComponent onLoginSuccess={onClose} />
          </div>

          {/* Divider */}
          <div className="login-modal-divider"></div>

          {/* Footer Section */}
          <div className="login-modal-footer">
            <p className="footer-text">🔒 การเข้าสู่ระบบของคุณมีความปลอดภัย</p>
            <p className="footer-subtext">เราใช้เทคโนโลยีเข้ารหัส SSL เพื่อปกป้องข้อมูลของคุณ</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginModal
