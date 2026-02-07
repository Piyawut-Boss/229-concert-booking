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
  
  // State สำหรับเก็บขนาดการ์ดจริง (คำนวณจากหน้าจอ)
  const [sliderParams, setSliderParams] = useState({
    cardWidth: 0,
    gap: 20,
    setWidth: 0,
    peekWidth: 0 // ความกว้างของขอบที่จะให้โผล่มา
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
  const originalRecommended = concerts.slice(0, 5)
  const infiniteConcerts = [
    ...originalRecommended, 
    ...originalRecommended, 
    ...originalRecommended, 
    ...originalRecommended
  ]
  const SET_SIZE = originalRecommended.length

  // ฟังก์ชันคำนวณขนาดและตำแหน่งเริ่มต้น
  const updateSliderMetrics = () => {
    if (sliderRef.current && sliderRef.current.children.length > 0) {
      const firstCard = sliderRef.current.children[0];
      const cardW = firstCard.offsetWidth;
      const gap = 20; // ตรงกับ CSS
      const containerW = sliderRef.current.offsetWidth;
      
      // คำนวณความกว้างรวมของ 1 Set
      const setW = (cardW + gap) * SET_SIZE;
      
      // คำนวณ Peek Width (ระยะที่ต้องถอยหลังเพื่อให้เห็นใบซ้าย)
      // สูตร: (พื้นที่เหลือจากการวาง 4 ใบ) / 2
      // หรือแค่ถอยหลังไปสัก 10% ของการ์ด
      const visibleCards = 4; // อยากเห็น 4 ใบ
      const totalContentWidth = (cardW + gap) * visibleCards - gap;
      const remainingSpace = containerW - totalContentWidth;
      const peek = remainingSpace / 2; // แบ่งซ้ายขวาเท่ากัน

      setSliderParams({
        cardWidth: cardW,
        gap: gap,
        setWidth: setW,
        peekWidth: peek > 0 ? peek : 0
      });

      // ตั้งค่า Scroll เริ่มต้นไปที่ Set 2 - Peek
      // (ลบ peek ออก เพื่อให้เห็นใบสุดท้ายของ Set 1 โผล่มาทางซ้าย)
      if (sliderRef.current.scrollLeft === 0) {
        sliderRef.current.scrollLeft = setW - (peek > 0 ? peek : 0); 
      }
    }
  }

  // เรียกคำนวณเมื่อโหลดเสร็จหรือ Resize
  useEffect(() => {
    if (!loading && originalRecommended.length > 0) {
      // รอให้ Render เสร็จสักนิด
      setTimeout(updateSliderMetrics, 100);
      window.addEventListener('resize', updateSliderMetrics);
      return () => window.removeEventListener('resize', updateSliderMetrics);
    }
  }, [loading, originalRecommended.length])

  // Infinite Scroll Logic
  const handleScroll = () => {
    if (!sliderRef.current || sliderParams.setWidth === 0) return;

    const scrollLeft = sliderRef.current.scrollLeft;
    const { setWidth, peekWidth } = sliderParams;
    
    // จุดที่ดีดกลับต้องคำนึงถึง peekWidth ด้วย
    // เลื่อนขวาเกิน -> ดีดกลับ Set 2
    if (scrollLeft >= (setWidth * 3) - peekWidth) {
      sliderRef.current.scrollLeft = (setWidth * 2) - peekWidth + (scrollLeft - ((setWidth * 3) - peekWidth));
    }
    // เลื่อนซ้ายเกิน -> ดีดไป Set 3
    else if (scrollLeft <= (setWidth * 1) - peekWidth) {
      sliderRef.current.scrollLeft = (setWidth * 2) - peekWidth - (((setWidth * 1) - peekWidth) - scrollLeft);
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

  // ... (Helper Functions เดิม: handleBooking, renderConcertCard ฯลฯ)
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