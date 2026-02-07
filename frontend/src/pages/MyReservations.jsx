import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { FaTicketAlt, FaCalendarAlt, FaUser, FaEnvelope, FaMusic, FaTimes, FaMapMarkerAlt, FaMicrophone } from 'react-icons/fa'
import './MyReservations.css'

function MyReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [concertDetails, setConcertDetails] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!user || !user.email) {
      setLoading(false)
      return
    }

    // Fetch reservations automatically when user is logged in
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/reservations/${user.email}`)
        setReservations(response.data)
      } catch (error) {
        console.error('Error fetching reservations:', error)
        setReservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [user])

  // Function to handle concert card click and fetch details
  const handleConcertCardClick = async (reservation) => {
    try {
      setSelectedReservation(reservation)
      // Fetch concert details
      const response = await axios.get(`/api/concerts/${reservation.concertId}`)
      setConcertDetails(response.data)
      setShowModal(true)
    } catch (error) {
      console.error('Error fetching concert details:', error)
      // Show reservation details even if concert fetch fails
      setConcertDetails(null)
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReservation(null)
    setConcertDetails(null)
  }

  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filter)

  if (!user) {
    return (
      <div className="reservations-page">
        <div className="reservations-container">
          <div className="reservations-header">
            <h1><FaTicketAlt /> การจองของฉัน</h1>
            <p>ตรวจสอบสถานะการจองบัตรของคุณ</p>
          </div>

          <div className="empty-state not-logged-in">
            <div className="empty-icon">🔐</div>
            <h3>กรุณาเข้าสู่ระบบ</h3>
            <p>คุณต้องเข้าสู่ระบบเพื่อดูการจองของคุณ</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reservations-page">
      <div className="reservations-container">
        {/* Header Section */}
        <div className="reservations-header">
          <h1><FaTicketAlt /> การจองของฉัน</h1>
          <p>ตรวจสอบสถานะการจองบัตรของคุณ</p>
        </div>

        {/* User Profile Card */}
        <div className="user-profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">ทั้งหมด</span>
              <span className="stat-value">{reservations.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">ยืนยันแล้ว</span>
              <span className="stat-value">{reservations.filter(r => r.status === 'confirmed').length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">ค่าใช้จ่ายทั้งหมด</span>
              <span className="stat-value">฿{reservations.reduce((sum, r) => sum + r.totalPrice, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && reservations.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>ไม่พบการจอง</h3>
            <p>คุณยังไม่มีการจองบัตรใดๆ</p>
          </div>
        )}

        {/* Reservations List */}
        {!loading && reservations.length > 0 && (
          <div>
            {/* Filter Buttons */}
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                ทั้งหมด ({reservations.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilter('confirmed')}
              >
                ยืนยันแล้ว ({reservations.filter(r => r.status === 'confirmed').length})
              </button>
            </div>

            {/* Reservations Grid */}
            <div className="reservations-grid">
              {filteredReservations.map((reservation, index) => (
                <div 
                  key={reservation.id} 
                  className="reservation-card"
                  onClick={() => handleConcertCardClick(reservation)}
                  style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
                >
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="card-title-section">
                      <div className="concert-icon">
                        <FaMusic />
                      </div>
                      <div>
                        <h3>{reservation.concertName}</h3>
                        <p className="reservation-id">#{reservation.id}</p>
                      </div>
                    </div>
                    <span className={`status-badge status-${reservation.status}`}>
                      {reservation.status === 'confirmed' ? '✓ ยืนยันแล้ว' : reservation.status}
                    </span>
                  </div>

                  {/* Card Divider */}
                  <div className="card-divider"></div>

                  {/* Card Details */}
                  <div className="card-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-icon"><FaUser /></span>
                        <div>
                          <p className="detail-label">ผู้จอง</p>
                          <p className="detail-value">{reservation.customerName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-icon"><FaEnvelope /></span>
                        <div>
                          <p className="detail-label">อีเมล</p>
                          <p className="detail-value">{reservation.customerEmail}</p>
                        </div>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">จำนวนบัตร</span>
                        <p className="detail-value">{reservation.quantity} ใบ</p>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">ราคา/ใบ</span>
                        <p className="detail-value">฿{Math.round(reservation.totalPrice / reservation.quantity).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-icon"><FaCalendarAlt /></span>
                        <div>
                          <p className="detail-label">วันที่จอง</p>
                          <p className="detail-value">{new Date(reservation.reservedAt).toLocaleString('th-TH')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer">
                    <span className="total-label">ราคารวม</span>
                    <span className="total-price">฿{reservation.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredReservations.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>ไม่พบการจอง</h3>
                <p>ไม่มีการจองกับสถานะที่เลือก</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Concert Details Modal */}
      {showModal && selectedReservation && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <h2>รายละเอียดคอนเสิร์ต</h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            {/* Concert Details */}
            <div className="modal-body">
              {concertDetails ? (
                <div className="concert-details">
                  {/* Concert Image */}
                  {concertDetails.imageUrl && (
                    <div className="concert-image">
                      <img src={concertDetails.imageUrl} alt={concertDetails.name} />
                    </div>
                  )}

                  {/* Concert Info */}
                  <div className="concert-info">
                    <h3 className="concert-title">{concertDetails.name}</h3>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <FaMicrophone className="info-icon" />
                        <div>
                          <p className="info-label">ศิลปิน</p>
                          <p className="info-value">{concertDetails.artist}</p>
                        </div>
                      </div>

                      <div className="info-item">
                        <FaCalendarAlt className="info-icon" />
                        <div>
                          <p className="info-label">วันที่แสดง</p>
                          <p className="info-value">{new Date(concertDetails.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>

                      <div className="info-item">
                        <FaMapMarkerAlt className="info-icon" />
                        <div>
                          <p className="info-label">สถานที่</p>
                          <p className="info-value">{concertDetails.venue}</p>
                        </div>
                      </div>

                      <div className="info-item">
                        <FaTicketAlt className="info-icon" />
                        <div>
                          <p className="info-label">ราคาต่อใบ</p>
                          <p className="info-value">฿{concertDetails.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="info-item">
                        <FaMusic className="info-icon" />
                        <div>
                          <p className="info-label">บัตรที่เหลือ</p>
                          <p className="info-value">{concertDetails.availableTickets} / {concertDetails.totalTickets} ใบ</p>
                        </div>
                      </div>

                      <div className="info-item">
                        <div className="status-badge-modal">
                          <p className="info-label">สถานะ</p>
                          <p className="info-value" style={{ 
                            color: concertDetails.status === 'open' ? '#10b981' : '#ef4444',
                            fontWeight: '700'
                          }}>
                            {concertDetails.status === 'open' ? '📅 เปิดจอง' : '❌ ปิดจอง'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reservation Summary */}
                    <div className="reservation-summary">
                      <h4>สรุปการจอง</h4>
                      <div className="summary-item">
                        <span>จำนวนบัตร:</span>
                        <strong>{selectedReservation.quantity} ใบ</strong>
                      </div>
                      <div className="summary-item">
                        <span>ราคาต่อใบ:</span>
                        <strong>฿{Math.round(selectedReservation.totalPrice / selectedReservation.quantity).toLocaleString()}</strong>
                      </div>
                      <div className="summary-item total">
                        <span>ราคารวม:</span>
                        <strong>฿{selectedReservation.totalPrice.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="concert-details">
                  <div className="concert-info">
                    <h3 className="concert-title">{selectedReservation.concertName}</h3>
                    <p className="no-details">ไม่สามารถโหลดรายละเอียดคอนเสิร์ต</p>
                    
                    {/* Show available reservation info */}
                    <div className="reservation-summary">
                      <h4>สรุปการจอง</h4>
                      <div className="summary-item">
                        <span>จำนวนบัตร:</span>
                        <strong>{selectedReservation.quantity} ใบ</strong>
                      </div>
                      <div className="summary-item">
                        <span>ราคารวม:</span>
                        <strong>฿{selectedReservation.totalPrice.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button className="btn-close" onClick={closeModal}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyReservations