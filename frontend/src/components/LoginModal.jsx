import { useState } from 'react'
import GoogleLoginComponent from './GoogleLogin'
import './LoginModal.css'
import { FaTimes } from 'react-icons/fa'
import Turnstile from 'react-turnstile'
import logo from '../../assets/WaveLogo.png'

// Log environment variables for debugging
console.log('VITE_TURNSTILE_SITE_KEY:', import.meta.env.VITE_TURNSTILE_SITE_KEY)

function LoginModal({ isOpen, onClose }) {
  const [captchaToken, setCaptchaToken] = useState(null)
  const [captchaError, setCaptchaError] = useState(false)

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAACY7SOAVZF09WFXk'

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token)
    setCaptchaError(false)
  }

  const handleCaptchaError = () => {
    setCaptchaToken(null)
    setCaptchaError(true)
  }

  const handleCaptchaExpire = () => {
    setCaptchaToken(null)
  }

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
            <div className="header-icon"><img src={logo} alt="Logo" style={{width: '50px', height: '50px', objectFit: 'contain'}} /></div>
            <h1 className="modal-title">เข้าสู่ระบบ</h1>
            <p className="modal-subtitle">เลือกวิธีการเข้าสู่ระบบเพื่อจองตั๋วคอนเสิร์ต</p>
          </div>

          {/* Body Section */}
          <div className="login-modal-body">
            <div className="login-option-label">กรุณาเลือกวิธีการล็อกอิน</div>
            
            {/* Cloudflare Turnstile Widget */}
            <div className="captcha-container">
              {siteKey ? (
                <Turnstile
                  sitekey={siteKey}
                  onSuccess={handleCaptchaChange}
                  onError={handleCaptchaError}
                  onExpire={handleCaptchaExpire}
                  theme="light"
                />
              ) : (
                <p className="captcha-error">⚠️ Turnstile Site Key not loaded. Please refresh the page.</p>
              )}
              {captchaError && (
                <p className="captcha-error">กรุณายืนยันการตรวจสอบ Cloudflare อีกครั้ง</p>
              )}
            </div>

            {/* Google Login - Only available if captcha verified */}
            <div className={captchaToken ? '' : 'login-disabled'}>
              <GoogleLoginComponent onLoginSuccess={onClose} />
            </div>
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
