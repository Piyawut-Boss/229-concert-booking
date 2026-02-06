import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function MyReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (!user) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="page-header">
            <h1>📋 การจองของฉัน</h1>
            <p>ตรวจสอบสถานะการจองบัตรของคุณ</p>
          </div>

          <div className="card" style={{textAlign: 'center', padding: '60px', background: '#eff6ff', borderRadius: '8px'}}>
            <h3 style={{color: '#1e40af', marginBottom: '12px'}}>⚠️ กรุณาเข้าสู่ระบบ</h3>
            <p style={{color: '#1e3a8a', marginTop: '12px'}}>
              คุณต้องเข้าสู่ระบบเพื่อดูการจองของคุณ
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <h1>📋 การจองของฉัน</h1>
          <p>ตรวจสอบสถานะการจองบัตรของคุณ</p>
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px'}}>
          <p style={{color: '#374151', marginBottom: '8px'}}>
            <strong>ผู้ใช้:</strong> {user.name}
          </p>
          <p style={{color: '#6b7280'}}>
            <strong>อีเมล:</strong> {user.email}
          </p>
        </div>

        {loading && (
          <div style={{textAlign: 'center', padding: '60px'}}>
            <div className="spinner"></div>
          </div>
        )}

        {!loading && reservations.length === 0 && (
          <div className="card" style={{textAlign: 'center', padding: '60px'}}>
            <h2>ไม่พบการจอง</h2>
            <p style={{color: '#6b7280', marginTop: '12px'}}>
              คุณยังไม่มีการจองบัตรใดๆ
            </p>
          </div>
        )}

        {!loading && reservations.length > 0 && (
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