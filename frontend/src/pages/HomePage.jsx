import { useState, useEffect } from 'react'
import axios from 'axios'
import BookingModal from '../components/BookingModal'
import './HomePage.css' // Import styles เฉพาะหน้า

function HomePage() {
  const [concerts, setConcerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConcert, setSelectedConcert] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchConcerts()
    const interval = setInterval(fetchConcerts, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchConcerts = async () => {
    try {
      const response = await axios.get('/api/concerts')
      // เรียงลำดับ: วันที่ใกล้สุดขึ้นก่อน
      const sorted = response.data.sort((a, b) => new Date(a.date) - new Date(b.date))
      setConcerts(sorted)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleBooking = (concert) => {
    if (concert.status !== 'open') return
    if (concert.availableTickets <= 0) return
    setSelectedConcert(concert)
    setShowModal(true)
  }

  const handleBookingSuccess = () => {
    setShowModal(false)
    fetchConcerts()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
  }

  if (loading) return <div className="page-content"><div className="container"><div className="spinner"></div></div></div>

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>Upcoming Concerts</h1>
          <p>จองบัตรคอนเสิร์ตศิลปินที่คุณชื่นชอบ</p>
        </div>

        <div className="concert-list">
          {concerts.map(concert => {
            const { date, time } = formatDate(concert.date)
            const isSoldOut = concert.availableTickets <= 0
            const isClosed = concert.status !== 'open'

            return (
              <div key={concert.id} className={`ticket-card ${isSoldOut || isClosed ? 'disabled' : ''}`}>
                
                {/* Image Section */}
                <div className="ticket-left">
                  <img 
                    src={concert.imageUrl} 
                    alt={concert.name} 
                    className="concert-poster"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}}
                  />
                </div>

                {/* Info Section */}
                <div className="ticket-right">
                  <h2 className="concert-name">{concert.name}</h2>
                  <p className="artist-name">{concert.artist}</p>
                  
                  <div className="meta-info">
                    <div className="meta-item">
                      <i className="far fa-calendar-alt"></i> {date} • {time}
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-map-marker-alt"></i> {concert.venue}
                    </div>
                  </div>

                  <div className="ticket-stats">
                    <div className="stat-item text-left">
                      <span className="stat-label">Total</span>
                      <span className="stat-value">{concert.totalTickets}</span>
                    </div>
                    <div className="stat-item text-center">
                      <span className="stat-label">Booked</span>
                      <span className="stat-value">{concert.bookedTickets}</span>
                    </div>
                    <div className="stat-item text-right">
                      <span className="stat-label">Left</span>
                      <span className={`stat-value ${concert.availableTickets < 20 ? 'text-danger' : 'text-success'}`}>
                        {concert.availableTickets}
                      </span>
                    </div>
                  </div>

                  <div className="ticket-divider-dashed"></div>

                  <div className="ticket-action">
                    <div className="price-tag">
                      <span className="currency">฿</span>
                      <span className="amount">{concert.price.toLocaleString()}</span>
                    </div>

                    {!isClosed && !isSoldOut ? (
                      <button className="book-btn" onClick={() => handleBooking(concert)}>
                        Buy Ticket
                      </button>
                    ) : (
                      <button className="book-btn disabled" disabled>
                        {isClosed ? 'Closed' : 'Sold Out'}
                      </button>
                    )}
                  </div>
                  
                  {/* Notches for ticket effect */}
                  <div className="notch notch-left"></div>
                  <div className="notch notch-right"></div>
                </div>
              </div>
            )
          })}
        </div>
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