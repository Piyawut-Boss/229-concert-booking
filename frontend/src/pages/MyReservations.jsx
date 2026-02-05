import { useState } from 'react'
import axios from 'axios'

function MyReservations() {
  const [email, setEmail] = useState('')
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)

    try {
      const response = await axios.get(`/api/reservations/${email}`)
      setReservations(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reservations:', error)
      setReservations([])
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>📋 การจองของฉัน</h1>
          <p>ตรวจสอบสถานะการจองบัตรของคุณ</p>
        </div>

        <div className="card" style={{maxWidth: '600px', margin: '0 auto 30px'}}>
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <label>ค้นหาด้วยอีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="กรอกอีเมลที่ใช้จอง"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
              {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
          </form>
        </div>

        {loading && <div className="spinner"></div>}

        {searched && !loading && reservations.length === 0 && (
          <div className="card" style={{textAlign: 'center', padding: '60px'}}>
            <h2>ไม่พบการจอง</h2>
            <p style={{color: '#6b7280', marginTop: '12px'}}>
              ไม่พบการจองที่เกี่ยวข้องกับอีเมล {email}
            </p>
          </div>
        )}

        {reservations.length > 0 && (
          <div>
            <h2 style={{color: 'white', marginBottom: '20px'}}>
              พบ {reservations.length} รายการจอง
            </h2>
            
            <div className="grid grid-2">
              {reservations.map(reservation => (
                <div key={reservation.id} className="card">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <h3 style={{marginBottom: '8px'}}>{reservation.concertName}</h3>
                      <p style={{color: '#6b7280', fontSize: '14px'}}>
                        รหัสการจอง: {reservation.id}
                      </p>
                    </div>
                    <span className="badge badge-success">
                      {reservation.status === 'confirmed' ? 'ยืนยันแล้ว' : reservation.status}
                    </span>
                  </div>

                  <div style={{
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{marginBottom: '8px'}}>
                      <strong>ผู้จอง:</strong> {reservation.customerName}
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <strong>อีเมล:</strong> {reservation.customerEmail}
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <strong>จำนวนบัตร:</strong> {reservation.quantity} ใบ
                    </div>
                    <div>
                      <strong>ราคารวม:</strong>{' '}
                      <span style={{color: '#10b981', fontSize: '18px', fontWeight: 700}}>
                        ฿{reservation.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={{fontSize: '14px', color: '#6b7280'}}>
                    📅 จองเมื่อ: {new Date(reservation.reservedAt).toLocaleString('th-TH')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyReservations
