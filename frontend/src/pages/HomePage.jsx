import { useState, useEffect, useRef } from "react";
import axios from "axios";
import BookingModal from "../components/BookingModal";
import "./HomePage.css";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

function HomePage() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const sliderRef = useRef(null);
  const [sliderParams, setSliderParams] = useState({
    cardWidth: 0,
    gap: 20,
    setWidth: 0,
  });

  useEffect(() => {
    fetchConcerts();
    const interval = setInterval(fetchConcerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchConcerts = async () => {
    try {
      const response = await axios.get("/api/concerts");
      const sorted = response.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );
      setConcerts(sorted);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const originalRecommended = concerts.slice(0, 5);
  const infiniteConcerts = [
    ...originalRecommended,
    ...originalRecommended,
    ...originalRecommended,
    ...originalRecommended,
  ];
  const SET_SIZE = originalRecommended.length;

  const updateSliderMetrics = () => {
    if (sliderRef.current && sliderRef.current.children.length > 0) {
      const firstCard = sliderRef.current.children[0];
      const cardW = firstCard.offsetWidth;
      const gap = 20;
      const setW = (cardW + gap) * SET_SIZE;
      setSliderParams({ cardWidth: cardW, gap: gap, setWidth: setW });
      if (sliderRef.current.scrollLeft === 0)
        sliderRef.current.scrollLeft = setW;
    }
  };

  useEffect(() => {
    if (!loading && originalRecommended.length > 0) {
      setTimeout(updateSliderMetrics, 100);
      window.addEventListener("resize", updateSliderMetrics);
      return () => window.removeEventListener("resize", updateSliderMetrics);
    }
  }, [loading, originalRecommended.length]);

  const handleScroll = () => {
    if (!sliderRef.current || sliderParams.setWidth === 0) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const { setWidth } = sliderParams;
    if (scrollLeft >= setWidth * 2)
      sliderRef.current.scrollLeft = scrollLeft - setWidth;
    else if (scrollLeft <= 0) sliderRef.current.scrollLeft = setWidth;
  };

  const slideLeft = () => {
    if (sliderRef.current)
      sliderRef.current.scrollBy({
        left: -(sliderParams.cardWidth + sliderParams.gap),
        behavior: "smooth",
      });
  };
  const slideRight = () => {
    if (sliderRef.current)
      sliderRef.current.scrollBy({
        left: sliderParams.cardWidth + sliderParams.gap,
        behavior: "smooth",
      });
  };

  const handleBooking = (concert) => {
    if (concert.status !== "open" || concert.availableTickets <= 0) return;
    setSelectedConcert(concert);
    setShowModal(true);
  };

  const handleBookingSuccess = () => {
    setShowModal(false);
    fetchConcerts();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      }),
    };
  };

  const renderConcertCard = (concert, index) => {
    const { date } = formatDate(concert.date);
    const isSoldOut = concert.availableTickets <= 0;
    const isClosed = concert.status !== "open";

    return (
      <div
        key={`${concert.id}-${index}`}
        className={`ticket-card ${isSoldOut || isClosed ? "disabled" : ""}`}
      >
        <div className="ticket-left">
          <img
            src={concert.imageUrl}
            alt={concert.name}
            className="concert-poster"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x450?text=No+Image";
            }}
          />
        </div>

        <div className="ticket-right">
          <h2 className="concert-name">{concert.name}</h2>
          <p className="artist-name">{concert.artist}</p>

          <div className="meta-info">
            <div className="meta-item">
              {/* เปลี่ยน Emoji เป็นไอคอน */}
              <FaCalendarAlt className="icon-calendar" />
              <span>{date}</span>
            </div>
            <div className="meta-item">
              {/* เปลี่ยน Emoji เป็นไอคอน */}
              <FaMapMarkerAlt className="icon-location" />
              <span>{concert.venue}</span>
            </div>
          </div>

          <div className="ticket-action">
            <div className="price-tag">
              <span className="currency">฿</span>
              <span className="amount">{concert.price.toLocaleString()}</span>
            </div>

            {!isClosed && !isSoldOut ? (
              <button
                className="book-btn"
                onClick={() => handleBooking(concert)}
              >
                Buy Ticket
              </button>
            ) : (
              <button className="book-btn disabled" disabled>
                {isClosed ? "Closed" : "Sold Out"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHorizontalConcertCard = (concert) => {
    const { date } = formatDate(concert.date);
    const isSoldOut = concert.availableTickets <= 0;
    const isClosed = concert.status !== "open";

    return (
      <div
        key={concert.id}
        className={`horizontal-card ${isSoldOut || isClosed ? "disabled" : ""}`}
      >
        <div className="horizontal-left">
          <img
            src={concert.imageUrl}
            alt={concert.name}
            className="horizontal-poster"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/150x200?text=No+Image";
            }}
          />
        </div>

        <div className="horizontal-right">
          <div className="horizontal-info">
            <h3>{concert.name}</h3>

            <div className="hz-meta-item">
              <FaCalendarAlt className="icon-calendar" />
              <span>{date}</span>
            </div>

            <div className="hz-meta-item">
              <FaMapMarkerAlt className="icon-location" />
              <span>{concert.venue}</span>
            </div>
          </div>

          <div className="horizontal-divider"></div>

          <div className="horizontal-action">
            {!isClosed && !isSoldOut ? (
              <button
                className="hz-book-btn"
                onClick={() => handleBooking(concert)}
              >
                ซื้อบัตร
              </button>
            ) : (
              <button className="hz-book-btn disabled" disabled>
                {isClosed ? "ปิดรับ" : "บัตรหมด"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="page-content">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="page-content">
      <div className="container">
        <section className="recommend-section">
          <div className="section-header">
            <h2 className="section-title">Recommended for You</h2>
          </div>
          <div className="slider-wrapper">
            <button className="nav-btn prev-btn" onClick={slideLeft}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </section>

        <section className="all-concerts-section">
          <h2 className="section-title">All Concerts</h2>
          <div className="concert-list">
            {concerts.map((concert) => renderHorizontalConcertCard(concert))}
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
  );
}

export default HomePage;