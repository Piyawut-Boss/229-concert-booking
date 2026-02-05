import { useState } from 'react'
import axios from 'axios'

function BookingModal({ concert, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    quantity: 1
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/reservations', {
        concertId: concert.id,
        ...formData,
        quantity: parseInt(formData.quantity)
      })

      alert(`✅ จองบัตรสำเร็จ!\n\nหมายเลขการจอง: ${response.data.reservation.id}\nจำนวนบัตร: ${response.data.reservation.quantity}\nราคารวม: ฿${response.data.reservation.totalPrice.toLocaleString()}\n\nกรุณาตรวจสอบอีเมลของคุณ`)
      
      onSuccess()
    } catch (error) {
      setError(error.response?.data?.error || 'เกิดข้อผิดพลาดในการจอง')
      setLoading(false)
    }
  }

  const totalPrice = concert.price * formData.quantity

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>จองบัตรคอนเสิร์ต</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px'}}>
          <h3 style={{marginBottom: '8px'}}>{concert.name}</h3>
          <p style={{color: '#6b7280', marginBottom: '4px'}}>🎵 {concert.artist}</p>
          <p style={{color: '#6b7280', marginBottom: '4px'}}>
            📅 {new Date(concert.date).toLocaleDateString('th-TH')}
          </p>
          <p style={{color: '#6b7280'}}>📍 {concert.venue}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>ชื่อ-นามสกุล *</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              placeholder="กรอกชื่อ-นามสกุลของคุณ"
            />
          </div>

          <div className="input-group">
            <label>อีเมล *</label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="input-group">
            <label>จำนวนบัตร (สูงสุด 10 ใบ) *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              max={Math.min(10, concert.availableTickets)}
              required
            />
          </div>

          <div style={{
            padding: '16px',
            background: '#f0fdf4',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <span>ราคาต่อใบ:</span>
              <span style={{fontWeight: 600}}>฿{concert.price.toLocaleString()}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <span>จำนวน:</span>
              <span style={{fontWeight: 600}}>{formData.quantity} ใบ</span>
            </div>
            <hr style={{margin: '12px 0', border: 'none', borderTop: '1px solid #d1fae5'}} />
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <span style={{fontSize: '18px', fontWeight: 700}}>ราคารวม:</span>
              <span style={{fontSize: '24px', fontWeight: 700, color: '#10b981'}}>
                ฿{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{display: 'flex', gap: '12px'}}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{flex: 1}}
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{flex: 1}}
              disabled={loading}
            >
              {loading ? 'กำลังจอง...' : 'ยืนยันการจอง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingModal
