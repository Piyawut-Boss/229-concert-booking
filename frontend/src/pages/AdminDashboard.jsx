import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editingConcert, setEditingConcert] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin')
      return
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [navigate])

  const fetchData = async () => {
    try {
      const [statsRes, reservationsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/reservations')
      ])
      
      setStats(statsRes.data)
      setReservations(reservationsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin')
  }

  const handleToggleStatus = async (concertId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open'
    
    try {
      await axios.put(`/api/admin/concerts/${concertId}`, { status: newStatus })
      alert(`เปลี่ยนสถานะเป็น ${newStatus === 'open' ? 'เปิดขาย' : 'ปิดขาย'} สำเร็จ`)
      fetchData()
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) return

    try {
      await axios.delete(`/api/admin/reservations/${reservationId}`)
      alert('ยกเลิกการจองสำเร็จ')
      fetchData()
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  const handleUpdateConcert = async (concertId, updates) => {
    try {
      await axios.put(`/api/admin/concerts/${concertId}`, updates)
      alert('อัปเดตข้อมูลสำเร็จ')
      setEditingConcert(null)
      fetchData()
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.error || 'Unknown error'))
    }
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
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{marginBottom: '8px'}}>🎛️ Admin Dashboard</h1>
            <p style={{color: '#6b7280'}}>
              ระบบจัดการคอนเสิร์ตและการจอง
            </p>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        </div>

        <div style={{marginBottom: '20px'}}>
          <div style={{display: 'flex', gap: '12px', background: 'white', padding: '12px', borderRadius: '12px'}}>
            <button
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`btn ${activeTab === 'concerts' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('concerts')}
            >
              🎵 จัดการคอนเสิร์ต
            </button>
            <button
              className={`btn ${activeTab === 'reservations' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('reservations')}
            >
              📋 การจองทั้งหมด
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎵</div>
                <div className="stat-label">คอนเสิร์ตทั้งหมด</div>
                <div className="stat-value">{stats.totalConcerts}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-label">เปิดขายอยู่</div>
                <div className="stat-value">{stats.activeConcerts}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-label">การจองทั้งหมด</div>
                <div className="stat-value">{stats.totalReservations}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-label">รายได้รวม</div>
                <div className="stat-value">
                  ฿{stats.totalRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{marginBottom: '20px'}}>สรุปรายคอนเสิร์ต</h2>
              <div style={{overflowX: 'auto'}}>
                <table>
                  <thead>
                    <tr>
                      <th>ชื่อคอนเสิร์ต</th>
                      <th>บัตรทั้งหมด</th>
                      <th>จองแล้ว</th>
                      <th>คงเหลือ</th>
                      <th>รายได้</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.concerts.map(concert => (
                      <tr key={concert.id}>
                        <td><strong>{concert.name}</strong></td>
                        <td>{concert.totalTickets}</td>
                        <td>{concert.bookedTickets}</td>
                        <td>
                          <span style={{
                            color: concert.availableTickets > 0 ? '#10b981' : '#ef4444',
                            fontWeight: 600
                          }}>
                            {concert.availableTickets}
                          </span>
                        </td>
                        <td>฿{concert.revenue.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${concert.status === 'open' ? 'badge-success' : 'badge-danger'}`}>
                            {concert.status === 'open' ? 'เปิดขาย' : 'ปิดขาย'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'concerts' && (
          <div className="card">
            <h2 style={{marginBottom: '20px'}}>จัดการคอนเสิร์ต</h2>
            
            {stats.concerts.map(concert => (
              <div key={concert.id} style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                {editingConcert?.id === concert.id ? (
                  <EditConcertForm
                    concert={editingConcert}
                    onSave={(updates) => handleUpdateConcert(concert.id, updates)}
                    onCancel={() => setEditingConcert(null)}
                  />
                ) : (
                  <>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px'}}>
                      <div>
                        <h3>{concert.name}</h3>
                        <p style={{color: '#6b7280', marginTop: '8px'}}>
                          รหัส: {concert.id} | 
                          บัตรทั้งหมด: {concert.totalTickets} | 
                          จองแล้ว: {concert.bookedTickets} | 
                          คงเหลือ: {concert.availableTickets}
                        </p>
                      </div>
                      <span className={`badge ${concert.status === 'open' ? 'badge-success' : 'badge-danger'}`}>
                        {concert.status === 'open' ? 'เปิดขาย' : 'ปิดขาย'}
                      </span>
                    </div>

                    <div style={{display: 'flex', gap: '12px'}}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingConcert({...concert, ...stats.concerts.find(c => c.id === concert.id)})}
                      >
                        แก้ไขข้อมูล
                      </button>
                      <button
                        className={`btn ${concert.status === 'open' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(concert.id, concert.status)}
                      >
                        {concert.status === 'open' ? 'ปิดการขาย' : 'เปิดการขาย'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="card">
            <h2 style={{marginBottom: '20px'}}>การจองทั้งหมด ({reservations.length} รายการ)</h2>
            
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>รหัสจอง</th>
                    <th>คอนเสิร์ต</th>
                    <th>ผู้จอง</th>
                    <th>อีเมล</th>
                    <th>จำนวน</th>
                    <th>ราคารวม</th>
                    <th>วันที่จอง</th>
                    <th>สถานะ</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(res => (
                    <tr key={res.id}>
                      <td><code>{res.id}</code></td>
                      <td>{res.concertName}</td>
                      <td>{res.customerName}</td>
                      <td>{res.customerEmail}</td>
                      <td>{res.quantity}</td>
                      <td>฿{res.totalPrice.toLocaleString()}</td>
                      <td>{new Date(res.reservedAt).toLocaleString('th-TH')}</td>
                      <td>
                        <span className="badge badge-success">{res.status}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          style={{padding: '6px 12px', fontSize: '14px'}}
                          onClick={() => handleCancelReservation(res.id)}
                        >
                          ยกเลิก
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EditConcertForm({ concert, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    totalTickets: concert.totalTickets,
    price: concert.price
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
        <div className="input-group">
          <label>จำนวนบัตรทั้งหมด</label>
          <input
            type="number"
            value={formData.totalTickets}
            onChange={(e) => setFormData({...formData, totalTickets: parseInt(e.target.value)})}
            min={concert.bookedTickets}
          />
          <small style={{color: '#6b7280'}}>
            จองแล้ว: {concert.bookedTickets} (ต้องไม่น้อยกว่านี้)
          </small>
        </div>

        <div className="input-group">
          <label>ราคาต่อใบ (บาท)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
            min={0}
          />
        </div>
      </div>

      <div style={{display: 'flex', gap: '12px'}}>
        <button type="submit" className="btn btn-success">บันทึก</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          ยกเลิก
        </button>
      </div>
    </form>
  )
}

export default AdminDashboard
