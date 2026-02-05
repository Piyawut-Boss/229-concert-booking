import { useState, useEffect } from 'react'
import axios from 'axios'
import BookingModal from '../components/BookingModal'

function HomePage() {
  const [concerts, setConcerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConcert, setSelectedConcert] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchConcerts()
    // Auto refresh every 5 seconds
    const interval = setInterval(fetchConcerts, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchConcerts = async () => {
    try {
      const response = await axios.get('/api/concerts')
      setConcerts(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching concerts:', error)
      setLoading(false)
    }
  }

  const handleBooking = (concert) => {
    if (concert.status !== 'open') {
      alert('การจองปิดแล้วสำหรับคอนเสิร์ตนี้')
      return
    }
    if (concert.availableTickets <= 0) {
      alert('บัตรหมดแล้ว')
      return
    }
    setSelectedConcert(concert)
    setShowModal(true)
  }

  const handleBookingSuccess = () => {
    setShowModal(false)
    fetchConcerts()
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>🎤 Concert Tickets</h1>
          <p>จองบัตรคอนเสิร์ตที่คุณชื่นชอบได้แล้ววันนี้</p>
        </div>

        <div className="grid grid-2">
          {concerts.map(concert => (
            <div key={concert.id} className="concert-card">
              <img 
                src={concert.imageUrl} 
                alt={concert.name}
                className="concert-image"
              />
              <div className="concert-info">
                <h2 className="concert-name">{concert.name}</h2>
                <p className="concert-artist">🎵 {concert.artist}</p>
                
                <div className="concert-detail">
                  📅 {new Date(concert.date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                
                <div className="concert-detail">
                  📍 {concert.venue}
                </div>

                <div className="concert-price">
                  ฿{concert.price.toLocaleString()}
                </div>

                <div className="concert-availability">
                  <div className="availability-item">
                    <div className="availability-label">ทั้งหมด</div>
                    <div className="availability-value">{concert.totalTickets}</div>
                  </div>
                  <div className="availability-item">
                    <div className="availability-label">จองแล้ว</div>
                    <div className="availability-value">{concert.bookedTickets}</div>
                  </div>
                  <div className="availability-item">
                    <div className="availability-label">คงเหลือ</div>
                    <div className="availability-value" style={{
                      color: concert.availableTickets > 0 ? '#10b981' : '#ef4444'
                    }}>
                      {concert.availableTickets}
                    </div>
                  </div>
                </div>

                {concert.status === 'open' ? (
                  concert.availableTickets > 0 ? (
                    <button 
                      className="btn btn-primary" 
                      style={{width: '100%'}}
                      onClick={() => handleBooking(concert)}
                    >
                      จองบัตร
                    </button>
                  ) : (
                    <button 
                      className="btn btn-secondary" 
                      style={{width: '100%'}}
                      disabled
                    >
                      บัตรหมดแล้ว
                    </button>
                  )
                ) : (
                  <button 
                    className="btn btn-secondary" 
                    style={{width: '100%'}}
                    disabled
                  >
                    ปิดการจองแล้ว
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {concerts.length === 0 && (
          <div className="card" style={{textAlign: 'center', padding: '60px'}}>
            <h2>ยังไม่มีคอนเสิร์ตในขณะนี้</h2>
            <p style={{color: '#6b7280', marginTop: '12px'}}>
              กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <BookingModal
          concert={selectedConcert}
          onClose={() => setShowModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}

export default HomePage
