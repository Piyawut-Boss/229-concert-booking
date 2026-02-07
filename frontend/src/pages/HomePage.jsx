import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import BookingModal from '../components/BookingModal'
import './HomePage.css'

function HomePage() {
  const [concerts, setConcerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConcert, setSelectedConcert] = useState(null)
  const [showModal, setShowModal] = useState(false)
  
  const sliderRef = useRef(null)
  
  // State สำหรับเก็บขนาดเพื่อใช้คำนวณ JS
  const [sliderParams, setSliderParams] = useState({
    cardWidth: 0,
    gap: 20,
    setWidth: 0
  })

  useEffect(() => {
    fetchConcerts()
    const interval = setInterval(fetchConcerts, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchConcerts = async () => {
    try {
      const response = await axios.get('/api/concerts')
      const sorted = response.data.sort((a, b) => new Date(a.date) - new Date(b.date))
      setConcerts(sorted)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  // Clone ข้อมูล 4 ชุด
  const originalRecommended = concerts.slice(0, 5) // สมมติ 1 Set มี 5 ใบ
  const infiniteConcerts = [
    ...originalRecommended, 
    ...originalRecommended, 
    ...originalRecommended, 
    ...originalRecommended
  ]
  const SET_SIZE = originalRecommended.length

  const updateSliderMetrics = () => {
    if (sliderRef.current && sliderRef.current.children.length > 0) {
      const firstCard = sliderRef.current.children[0];
      const cardW = firstCard.offsetWidth;
      const gap = 20; 
      
      const setW = (cardW + gap) * SET_SIZE;
      
      setSliderParams({
        cardWidth: cardW,
        gap: gap,
        setWidth: setW
      });

      if (sliderRef.current.scrollLeft === 0) {
        sliderRef.current.scrollLeft = setW;
      }
    }
  }

  useEffect(() => {
    if (!loading && originalRecommended.length > 0) {
      setTimeout(updateSliderMetrics, 100);
      window.addEventListener('resize', updateSliderMetrics);
      return () => window.removeEventListener('resize', updateSliderMetrics);
    }
  }, [loading, originalRecommended.length])

  const handleScroll = () => {
    if (!sliderRef.current || sliderParams.setWidth === 0) return;

    const scrollLeft = sliderRef.current.scrollLeft;
    const { setWidth } = sliderParams;
    
   
    if (scrollLeft >= setWidth * 2) { 
      sliderRef.current.scrollLeft = scrollLeft - setWidth;
    }
    else if (scrollLeft <= 0) {
       sliderRef.current.scrollLeft = setWidth;
    }
    else if (scrollLeft < setWidth / 2) {
       sliderRef.current.scrollLeft = setWidth + scrollLeft;
    }
  };

  const slideLeft = () => {
    if (sliderRef.current) {
      const moveAmount = sliderParams.cardWidth + sliderParams.gap;
      sliderRef.current.scrollBy({ left: -moveAmount, behavior: 'smooth' })
    }
  }

  const slideRight = () => {
    if (sliderRef.current) {
      const moveAmount = sliderParams.cardWidth + sliderParams.gap;
      sliderRef.current.scrollBy({ left: moveAmount, behavior: 'smooth' })
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

  const renderConcertCard = (concert, index) => {
    const { date, time } = formatDate(concert.date)
    const isSoldOut = concert.availableTickets <= 0
    const isClosed = concert.status !== 'open'

    return (
      <div key={`${concert.id}-${index}`} className={`ticket-card ${isSoldOut || isClosed ? 'disabled' : ''}`}>
        <div className="ticket-left">
          <img 
            src={concert.imageUrl} 
            alt={concert.name} 
            className="concert-poster"
            onError={(e) => {e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'}}
          />
        </div>

        <div className="ticket-right">
          <h2 className="concert-name">{concert.name}</h2>
          <p className="artist-name">{concert.artist}</p>
          
          <div className="meta-info">
            <div className="meta-item">
              <span>📅 {date} • {time}</span>
            </div>
            <div className="meta-item">
              <span>📍 {concert.venue}</span>
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
        </div>
      </div>
    )
  }

  if (loading) return <div className="page-content"><div className="spinner"></div></div>

  return (
    <div className="page-content">
      <div className="container">
        
        {/* --- Slider Section --- */}
        <section className="recommend-section">
          <div className="section-header">
            <h2 className="section-title">Recommended for You</h2>
          </div>

          <div className="slider-wrapper">
            <button className="nav-btn prev-btn" onClick={slideLeft}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div 
              className="slider-container" 
              ref={sliderRef}
              onScroll={handleScroll}
            >
              {infiniteConcerts.map((concert, index) => (
                <div key={`${concert.id}-${index}`} className="slider-item">
                  {renderConcertCard(concert, index)}
                </div>
              ))}
            </div>

            <button className="nav-btn next-btn" onClick={slideRight}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </section>

        {/* --- Grid Section --- */}
        <section className="all-concerts-section">
          <h2 className="section-title">All Concerts</h2>
          <div className="concert-list">
            {concerts.map((concert, index) => (
               <div key={`grid-${concert.id}-${index}`} className="grid-item"> 
                 {renderConcertCard(concert, index)}
               </div>
            ))}
          </div>
        </section>

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