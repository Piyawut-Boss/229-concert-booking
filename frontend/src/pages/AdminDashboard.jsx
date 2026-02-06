import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingConcert, setEditingConcert] = useState(null); // ใช้สำหรับเก็บข้อมูลคอนเสิร์ตที่กำลังแก้ (เพื่อเปิด Modal)

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin");
      return;
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, reservationsRes] = await Promise.all([
        axios.get("/api/admin/stats"),
        axios.get("/api/admin/reservations"),
      ]);

      setStats(statsRes.data);
      setReservations(reservationsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin");
  };

  const handleToggleStatus = async (concertId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    try {
      await axios.put(`/api/admin/concerts/${concertId}`, {
        status: newStatus,
      });
      alert(
        `เปลี่ยนสถานะเป็น ${newStatus === "open" ? "เปิดขาย" : "ปิดขาย"} สำเร็จ`,
      );
      fetchData();
    } catch (error) {
      alert(
        "เกิดข้อผิดพลาด: " + (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?")) return;
    try {
      await axios.delete(`/api/admin/reservations/${reservationId}`);
      alert("ยกเลิกการจองสำเร็จ");
      fetchData();
    } catch (error) {
      alert(
        "เกิดข้อผิดพลาด: " + (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  const handleUpdateConcert = async (concertId, updates) => {
    try {
      await axios.put(`/api/admin/concerts/${concertId}`, updates);
      alert("อัปเดตข้อมูลสำเร็จ");
      setEditingConcert(null); // ปิด Modal
      fetchData();
    } catch (error) {
      alert(
        "เกิดข้อผิดพลาด: " + (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        {/* Header Dashboard */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "8px" }}>🎛️ Admin Dashboard</h1>
            <p style={{ color: "#6b7280" }}>ระบบจัดการคอนเสิร์ตและการจอง</p>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              background: "white",
              padding: "12px",
              borderRadius: "12px",
            }}
          >
            <button
              className={`btn ${activeTab === "dashboard" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              📊 Dashboard
            </button>
            <button
              className={`btn ${activeTab === "concerts" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("concerts")}
            >
              🎵 จัดการคอนเสิร์ต
            </button>
            <button
              className={`btn ${activeTab === "reservations" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("reservations")}
            >
              📋 การจองทั้งหมด
            </button>
          </div>
        </div>

        {/* TAB 1: Dashboard Stats */}
        {activeTab === "dashboard" && (
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
              <h2 style={{ marginBottom: "20px" }}>สรุปรายคอนเสิร์ต</h2>
              <div style={{ overflowX: "auto" }}>
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
                    {stats.concerts.map((concert) => (
                      <tr key={concert.id}>
                        <td>
                          <strong>{concert.name}</strong>
                        </td>
                        <td>{concert.totalTickets}</td>
                        <td>{concert.bookedTickets}</td>
                        <td>
                          <span
                            style={{
                              color:
                                concert.availableTickets > 0
                                  ? "#10b981"
                                  : "#ef4444",
                              fontWeight: 600,
                            }}
                          >
                            {concert.availableTickets}
                          </span>
                        </td>
                        <td>฿{concert.revenue.toLocaleString()}</td>
                        <td>
                          <span
                            className={`badge ${concert.status === "open" ? "badge-success" : "badge-danger"}`}
                          >
                            {concert.status === "open" ? "เปิดขาย" : "ปิดขาย"}
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

        {/* TAB 2: Manage Concerts (รายการคอนเสิร์ต) */}
        {activeTab === "concerts" && (
          <div className="card">
            <h2 style={{ marginBottom: "20px" }}>จัดการคอนเสิร์ต</h2>

            {stats.concerts.map((concert) => (
              <div
                key={concert.id}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px" /* มุมโค้งมนขึ้น */,
                  padding: "24px" /* เพิ่มพื้นที่ด้านใน */,
                  marginBottom: "20px",
                  display: "flex" /* ใช้ Flexbox จัดเรียงแนวนอน */,
                  gap: "24px" /* ระยะห่างระหว่าง 3 ส่วน */,
                  alignItems: "stretch" /* ให้ทุกส่วนสูงเท่ากัน */,
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.05)" /* เงาบางๆ ให้ดูลอยมีมิติ */,
                  transition: "transform 0.2s",
                }}
              >
                {/* --- ส่วนที่ 1: รูปภาพ (ซ้ายสุด) --- */}
                <div
                  style={{
                    width: "240px" /* ความกว้างคงที่ */,
                    flexShrink: 0,
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={concert.imageUrl}
                    alt={concert.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit:
                        "cover" /* เปลี่ยนเป็น cover ให้รูปเต็มกรอบสวยงาม (ถ้าอยากเห็นครบใช้ contain) */,
                    }}
                  />
                </div>

                {/* --- ส่วนที่ 2: ข้อมูลรายละเอียด (ตรงกลาง) --- */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <h3
                      style={{
                        fontSize: "1.5rem",
                        color: "#111827",
                        marginBottom: "8px",
                        lineHeight: 1.2,
                      }}
                    >
                      {concert.name}
                    </h3>
                    <span
                      className={`badge ${concert.status === "open" ? "badge-success" : "badge-danger"}`}
                      style={{ fontSize: "0.85rem", padding: "4px 10px" }}
                    >
                      {concert.status === "open"
                        ? " เปิดขายอยู่"
                        : " ปิดการขาย"}
                    </span>
                  </div>

                  <div
                    style={{
                      color: "#4b5563",
                      fontSize: "0.95rem",
                      display: "grid",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>🎤</span> <strong>ศิลปิน:</strong> {concert.artist}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>📍</span> <strong>สถานที่:</strong> {concert.venue}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>📅</span> <strong>วันที่:</strong>{" "}
                      {new Date(concert.date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {/* แถบข้อมูลสถิติย่อย */}
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      display: "flex",
                      gap: "20px",
                      border: "1px solid #f3f4f6",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          display: "block",
                        }}
                      >
                        ยอดจอง
                      </span>
                      <span style={{ fontWeight: 600, color: "#111827" }}>
                        {concert.bookedTickets} / {concert.totalTickets}
                      </span>
                    </div>
                    <div
                      style={{
                        borderLeft: "1px solid #e5e7eb",
                        paddingLeft: "20px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          display: "block",
                        }}
                      >
                        ราคา
                      </span>
                      <span style={{ fontWeight: 600, color: "#10b981" }}>
                        ฿{concert.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- ส่วนที่ 3: ปุ่มดำเนินการ (ขวาสุด) --- */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "12px",
                    minWidth: "140px",
                    borderLeft: "1px solid #f3f4f6" /* เส้นคั่นบางๆ */,
                    paddingLeft: "24px",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditingConcert(concert)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                     แก้ไข
                  </button>

                  <button
                    className={`btn ${concert.status === "open" ? "btn-danger" : "btn-success"}`}
                    onClick={() =>
                      handleToggleStatus(concert.id, concert.status)
                    }
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {concert.status === "open" ? " ปิดขาย" : " เปิดขาย"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Reservations */}
        {activeTab === "reservations" && (
          <div className="card">
            <h2 style={{ marginBottom: "20px" }}>
              การจองทั้งหมด ({reservations.length} รายการ)
            </h2>
            <div style={{ overflowX: "auto" }}>
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
                  {reservations.map((res) => (
                    <tr key={res.id}>
                      <td>
                        <code>{res.id}</code>
                      </td>
                      <td>{res.concertName}</td>
                      <td>{res.customerName}</td>
                      <td>{res.customerEmail}</td>
                      <td>{res.quantity}</td>
                      <td>฿{res.totalPrice.toLocaleString()}</td>
                      <td>
                        {new Date(res.reservedAt).toLocaleString("th-TH")}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {res.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "6px 12px", fontSize: "14px" }}
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

        {/* --- MODAL SECTION --- */}
        {/* แสดง Modal เมื่อมี editingConcert */}
        {editingConcert && (
          <EditConcertModal
            concert={editingConcert}
            onSave={(updates) =>
              handleUpdateConcert(editingConcert.id, updates)
            }
            onCancel={() => setEditingConcert(null)}
          />
        )}
      </div>
    </div>
  );
}

// --- Component: Modal Form สำหรับแก้ไขข้อมูล ---
function EditConcertModal({ concert, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: concert.name,
    artist: concert.artist,
    date: concert.date,
    venue: concert.venue,
    imageUrl: concert.imageUrl,
    totalTickets: concert.totalTickets,
    price: concert.price,
  });

  // --- ส่วนที่เพิ่มใหม่: ล็อกไม่ให้หน้าหลังเลื่อน ---
  useEffect(() => {
    // เมื่อเปิด Modal: ซ่อน Scrollbar ของ Body
    document.body.style.overflow = "hidden";

    // เมื่อปิด Modal: คืนค่าให้เลื่อนได้ปกติ
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  // ------------------------------------------

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "totalTickets" || name === "price" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      {/* เพิ่ม onClick stopPropagation เพื่อไม่ให้คลิกในกล่องแล้วปิด */}
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "800px",
          width: "90%",
          maxHeight: "90vh", // จำกัดความสูงไม่ให้ล้นจอ
          overflowY: "auto", // ให้เลื่อนได้เฉพาะในกล่อง Modal
        }}
      >
        <div className="modal-header">
          <h2>✏️ แก้ไขข้อมูลคอนเสิร์ต</h2>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ... (ส่วน Form Input ทั้งหมดเหมือนเดิม) ... */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label>ชื่อคอนเสิร์ต</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label>รูปปกคอนเสิร์ต</label>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  background: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    background: "white",
                    borderRadius: "8px",
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                      No Image
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ marginBottom: "8px", width: "100%" }}
                  />
                  <p style={{ fontSize: "13px", color: "#6b7280" }}>
                    รองรับไฟล์ JPG, PNG (แนะนำขนาดไม่เกิน 50MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>ศิลปิน</label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>วันที่แสดง</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label>สถานที่จัดงาน</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>จำนวนบัตรทั้งหมด</label>
              <input
                type="number"
                name="totalTickets"
                value={formData.totalTickets}
                onChange={handleChange}
                min={concert.bookedTickets}
                required
              />
              <small style={{ color: "#6b7280" }}>
                ขายไปแล้ว: {concert.bookedTickets}
              </small>
            </div>

            <div className="input-group">
              <label>ราคาต่อใบ (บาท)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min={0}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "20px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-success"
              style={{ flex: 1 }}
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
