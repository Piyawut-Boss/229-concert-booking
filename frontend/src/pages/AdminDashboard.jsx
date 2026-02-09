import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";
import "./AdminDashboard.css";

// --- ฟังก์ชันจัดการ URL รูปภาพ (accessible to all components) ---
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  // แก้ Backslash (\) เป็น Slash (/) เผื่อ path มาจาก Windows
  const cleanUrl = url.replace(/\\/g, "/");

  // ตรวจสอบและเติม /uploads/ ถ้าจำเป็น
  const pathWithUploads =
    cleanUrl.startsWith("uploads") || cleanUrl.startsWith("/uploads")
      ? cleanUrl.startsWith("/")
        ? cleanUrl
        : `/${cleanUrl}`
      : `/uploads/${cleanUrl.startsWith("/") ? cleanUrl.substring(1) : cleanUrl}`;

  // ชี้ไปที่ Backend Port 5000
  return `http://localhost:5000${pathWithUploads}`;
};
// --------------------------------------------------

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingConcert, setEditingConcert] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      const token = localStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [statsRes, reservationsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats`, {
          headers,
        }),
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/reservations`,
          { headers },
        ),
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
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/concerts/${concertId}`,
        {
          status: newStatus,
        },
      );
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
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/reservations/${reservationId}`,
      );
      alert("ยกเลิกการจองสำเร็จ");
      fetchData();
    } catch (error) {
      alert(
        "เกิดข้อผิดพลาด: " + (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  const handleApproveReservation = async (reservationId) => {
    if (!confirm("คุณต้องการยืนยันการจองนี้ใช่หรือไม่?")) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/reservations/${reservationId}`,
        { status: "confirmed" },
      );
      alert("ยืนยันการจองสำเร็จ");
      fetchData();
    } catch (error) {
      alert(
        "เกิดข้อผิดพลาด: " + (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  const handleUpdateConcert = async (concertId, updates) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/concerts/${concertId}`,
        updates,
      );
      alert("อัปเดตข้อมูลสำเร็จ");
      setEditingConcert(null);
      fetchData();
    } catch (error) {
      alert(
        "เกิดข้อผิดพลาด: " + (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  const dashboardConcerts =
    stats?.concerts?.filter((concert) => {
      return statusFilter === "all" || concert.status === statusFilter;
    }) || [];

  const manageConcerts =
    stats?.concerts?.filter((concert) => {
      return (
        (concert.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (concert.artist?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }) || [];
  const handleDeleteConcert = async (concertId) => {
    if (
      !confirm(
        "คุณต้องการลบคอนเสิร์ตนี้ใช่หรือไม่? \n(ต้องไม่มีการจองค้างอยู่จึงจะลบได้)",
      )
    )
      return;

    try {
      // ดึง token ถ้าจำเป็น (ตาม pattern เดิมของคุณไม่ได้ใส่ headers ใน axios call บางจุด แต่ใส่ไว้เผื่อความชัวร์)
      const token = localStorage.getItem("adminToken");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/concerts/${concertId}`,
        config,
      );

      alert("ลบคอนเสิร์ตสำเร็จ");
      fetchData(); // รีโหลดข้อมูลใหม่
    } catch (error) {
      alert(
        "เกิดข้อผิดพลาด: " + (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  const handleCreateConcert = async (concertData) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/concerts`,
        concertData,
      );
      alert("สร้างคอนเสิร์ตสำเร็จ");
      setShowCreateForm(false);
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
    <div className="page-content admin-dashboard-page">
      <div className="container">
        {/* Header Section */}
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="admin-subtitle">ระบบจัดการคอนเสิร์ตและการจอง</p>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        </div>
        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === "concerts" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("concerts")}
          >
            จัดการคอนเสิร์ต
          </button>
          <button
            className={`tab-btn ${activeTab === "reservations" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("reservations")}
          >
            การจองทั้งหมด
          </button>
        </div>
        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <>
            {stats ? (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-label">คอนเสิร์ตทั้งหมด</div>
                      <div className="stat-value">{stats.totalConcerts}</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-label">เปิดขายอยู่</div>
                      <div className="stat-value">{stats.activeConcerts}</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-label">การจองทั้งหมด</div>
                      <div className="stat-value">
                        {stats.totalReservations}
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-label">รายได้รวม</div>
                      <div className="stat-value">
                        ฿{stats.totalRevenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- ส่วนตารางสรุปรายคอนเสิร์ต (แก้ไขรูปภาพแล้ว) --- */}
                <div className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "24px",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <h2 style={{ margin: 0 }}>สรุปรายคอนเสิร์ต</h2>
                      <span style={{ fontSize: "14px", color: "#6b7280" }}>
                        แสดงข้อมูล {dashboardConcerts.length} รายการ
                      </span>
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="status-select"
                    >
                      <option value="all">สถานะทั้งหมด</option>
                      <option value="open">✅ เปิดขาย</option>
                      <option value="closed">⛔ ปิดขาย</option>
                    </select>
                  </div>

                  <div className="table-container">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>คอนเสิร์ต</th>
                          <th>ศิลปิน</th>
                          <th>วันที่ & สถานที่</th> <th>ราคา</th>
                          <th>การจอง (ใบ)</th> {/* ปรับรวม */}
                          <th>คงเหลือ</th>
                          <th>รายได้</th>
                          <th>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardConcerts.length > 0 ? (
                          dashboardConcerts.map((concert) => (
                            <tr key={concert.id}>
                              {/* 1. ชื่อ & รูป */}
                              <td>
                                <div className="concert-cell">
                                  {concert.imageUrl && (
                                    <img
                                      src={getImageUrl(concert.imageUrl)}
                                      alt={concert.name}
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        backgroundColor: "#f1f5f9",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  )}
                                  <span
                                    className="concert-name"
                                    style={{ fontWeight: 600 }}
                                  >
                                    {concert.name}
                                  </span>
                                </div>
                              </td>

                              {/* 2. ศิลปิน */}
                              <td>{concert.artist}</td>

                              {/* 3. วันที่ & สถานที่ (เช็คค่า date ก่อนแปลง) */}
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    fontSize: "13px",
                                  }}
                                >
                                  <span style={{ fontWeight: 500 }}>
                                    {concert.date
                                      ? new Date(
                                          concert.date,
                                        ).toLocaleDateString("th-TH", {
                                          day: "numeric",
                                          month: "short",
                                          year: "2-digit",
                                        })
                                      : "-"}
                                  </span>
                                  <span style={{ color: "#64748b" }}></span>
                                </div>
                              </td>

                              {/* 4. ราคา (ใส่ || 0 ป้องกัน Error) */}
                              <td>
                                <span className="revenue-text">
                                  ฿{(concert.price || 0).toLocaleString()}
                                </span>
                              </td>

                              {/* 5. การจอง */}
                              <td>
                                <span style={{ fontWeight: 500 }}>
                                  {concert.bookedTickets || 0}
                                </span>
                                <span
                                  style={{ color: "#94a3b8", fontSize: "12px" }}
                                >
                                  {" "}
                                  / {concert.totalTickets || 0}
                                </span>
                              </td>

                              {/* 6. คงเหลือ */}
                              <td>
                                <span className="revenue-text">
                                  {(concert.availableTickets || 0) > 0
                                    ? concert.availableTickets
                                    : "หมด"}
                                </span>
                              </td>

                              {/* 7. รายได้ (ใส่ || 0 ป้องกัน Error) */}
                              <td>
                                <span
                                  className="revenue-text"
                                  style={{ fontWeight: 700 }}
                                >
                                  ฿{(concert.revenue || 0).toLocaleString()}
                                </span>
                              </td>

                              {/* 8. สถานะ */}
                              <td>
                                <span
                                  className={`badge ${concert.status === "open" ? "badge-success" : "badge-danger"}`}
                                >
                                  {concert.status === "open"
                                    ? "เปิดขาย"
                                    : "ปิดขาย"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="8"
                              style={{
                                textAlign: "center",
                                padding: "40px",
                                color: "#64748b",
                              }}
                            >
                              ไม่พบข้อมูลคอนเสิร์ต
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                }}
              >
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            )}
          </>
        )}
        {/* Concerts Management Content */}
        {activeTab === "concerts" && (
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h2 style={{ margin: 0 }}>จัดการคอนเสิร์ต</h2>

              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                {/* --- ส่วนที่เพิ่ม: ช่องค้นหา --- */}
                <div className="search-wrapper">
                  <div className="search-icon">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ หรือ ศิลปิน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                {/* --------------------------- */}

                <button
                  className={`btn ${showCreateForm ? "btn-secondary" : "btn-success"}`}
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? "ยกเลิก" : "สร้าง"}
                </button>
              </div>
            </div>

            {showCreateForm && (
              <div className="create-form-container">
                <h3 style={{ marginTop: 0 }}>สร้าง</h3>
                <CreateConcertForm
                  onSave={handleCreateConcert}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            )}

            {stats ? (
              <>
                {manageConcerts.length > 0 ? (
                  manageConcerts.map((concert) => (
                    <div key={concert.id} className="concert-item">
                      {editingConcert?.id === concert.id ? (
                        <EditConcertForm
                          concert={editingConcert}
                          onSave={(updates) =>
                            handleUpdateConcert(concert.id, updates)
                          }
                          onCancel={() => setEditingConcert(null)}
                        />
                      ) : (
                        <>
                          {/* 1. รูปปกคอนเสิร์ต */}
                          {concert.imageUrl && (
                            <div className="concert-image-container">
                              <img
                                src={getImageUrl(concert.imageUrl)}
                                alt={concert.name}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          )}

                          {/* 2. ส่วนรายละเอียดและปุ่มจัดการ */}
                          <div className="concert-item-right">
                            <div className="concert-details">
                              <div className="concert-info">
                                <h3 style={{ margin: "0 0 8px 0" }}>
                                  {concert.name}
                                </h3>

                                {/* --- ส่วนที่เพิ่ม: ศิลปิน และ สถานที่ --- */}
                                <div
                                  style={{
                                    marginBottom: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                  }}
                                >
                                  {concert.artist && (
                                    <span
                                      style={{
                                        fontSize: "1rem",
                                        fontWeight: "500",
                                        color: "#333",
                                      }}
                                    >
                                      {concert.artist}
                                    </span>
                                  )}
                                  {concert.venue && (
                                    <span
                                      style={{
                                        fontSize: "0.9rem",
                                        color: "#666",
                                      }}
                                    >
                                      {concert.venue}
                                    </span>
                                  )}
                                </div>

                                <p className="concert-meta">
                                  รหัส: {concert.id} | บัตรทั้งหมด:{" "}
                                  {concert.totalTickets} | จองแล้ว:{" "}
                                  {concert.bookedTickets} | คงเหลือ:{" "}
                                  {concert.availableTickets}
                                </p>
                              </div>
                              <span
                                className={`badge ${
                                  concert.status === "open"
                                    ? "badge-success"
                                    : "badge-danger"
                                }`}
                              >
                                {concert.status === "open"
                                  ? "เปิดขาย"
                                  : "ปิดขาย"}
                              </span>
                            </div>

                            <div className="concert-actions">
                              <button
                                className="btn btn-secondary"
                                onClick={() => setEditingConcert(concert)}
                              >
                                แก้ไขข้อมูล
                              </button>
                              <button
                                className={`btn ${
                                  concert.status === "open"
                                    ? "btn-danger"
                                    : "btn-success"
                                }`}
                                onClick={() =>
                                  handleToggleStatus(concert.id, concert.status)
                                }
                              >
                                {concert.status === "open"
                                  ? "ปิดการขาย"
                                  : "เปิดการขาย"}
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{
                                  marginLeft: "8px",
                                  backgroundColor: "#dc2626",
                                }}
                                onClick={() => handleDeleteConcert(concert.id)}
                              >
                                ลบ
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  /* เพิ่ม: กรณีไม่มีรายการคอนเสิร์ต (ปิดเงื่อนไข manageConcerts.length > 0) */
                  <div className="no-data">ไม่พบข้อมูลคอนเสิร์ต</div>
                )}
              </>
            ) : (
              /* เพิ่ม: กรณี stats ยังไม่โหลด (ปิดเงื่อนไข stats ?) */
              <div className="loading">กำลังโหลดข้อมูล...</div>
            )}
          </div>
        )}{" "}
        {/* Reservations Content */}
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
                        <span
                          className={`badge ${res.status === "confirmed" ? "badge-success" : res.status === "pending" ? "badge-warning" : res.status === "cancelled" ? "badge-danger" : "badge-success"}`}
                        >
                          {res.status === "confirmed"
                            ? "ยืนยันแล้ว"
                            : res.status === "pending"
                              ? "กำลังรอ"
                              : res.status === "cancelled"
                                ? "ยกเลิก"
                                : res.status}
                        </span>
                      </td>
                      <td>
                        {res.status === "cancelled" ? (
                          <button
                            className="btn btn-success"
                            style={{ padding: "6px 12px", fontSize: "14px" }}
                            onClick={() => handleApproveReservation(res.id)}
                          >
                            ยืนยัน
                          </button>
                        ) : (
                          <button
                            className="btn btn-danger"
                            style={{ padding: "6px 12px", fontSize: "14px" }}
                            onClick={() => handleCancelReservation(res.id)}
                          >
                            ยกเลิก
                          </button>
                        )}
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
  );
}

function EditConcertForm({ concert, onSave, onCancel }) {
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    name: concert?.name ?? "",
    artist: concert?.artist ?? "",
    date: formatDateForInput(concert?.date),
    venue: concert?.venue ?? "",
    totalTickets: concert?.totalTickets ?? 0,
    price: concert?.price ?? 0,
    imageUrl: concert?.imageUrl ?? "",
  });

  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/upload`,
        formDataObj,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setFormData({ ...formData, imageUrl: response.data.url });
      setError("");
    } catch (err) {
      setError(
        "ไม่สามารถอัพโหลดไฟล์: " + (err.response?.data?.error || err.message),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return setError("ชื่อคอนเสิร์ตไม่สามารถว่างได้");
    if (!formData.artist.trim()) return setError("ชื่อศิลปินไม่สามารถว่างได้");
    if (!formData.date) return setError("วันที่ไม่สามารถว่างได้");
    if (!formData.venue.trim()) return setError("สถานที่ไม่สามารถว่างได้");
    if (formData.totalTickets < concert.bookedTickets)
      return setError(
        `ไม่สามารถลดบัตรน้อยกว่า ${concert.bookedTickets} ที่ขายไปแล้ว`,
      );
    if (formData.price < 0) return setError("ราคาไม่สามารถติดลบได้");

    const updates = {};
    if (formData.name !== concert.name) updates.name = formData.name;
    if (formData.artist !== concert.artist) updates.artist = formData.artist;
    if (formData.date !== concert.date) updates.date = formData.date;
    if (formData.venue !== concert.venue) updates.venue = formData.venue;
    if (formData.totalTickets !== concert.totalTickets)
      updates.totalTickets = formData.totalTickets;
    if (formData.price !== concert.price) updates.price = formData.price;
    if (formData.imageUrl !== concert.imageUrl)
      updates.imageUrl = formData.imageUrl;

    if (Object.keys(updates).length === 0)
      return setError("ไม่มีการเปลี่ยนแปลงข้อมูล");

    onSave(updates);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div className="input-group">
          <label>ชื่อคอนเสิร์ต</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setError("");
            }}
            required
          />
        </div>
        <div className="input-group">
          <label>ชื่อศิลปิน</label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) => {
              setFormData({ ...formData, artist: e.target.value });
              setError("");
            }}
            required
          />
        </div>
        <div className="input-group">
          <label>วันที่จัดงาน</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => {
              setFormData({ ...formData, date: e.target.value });
              setError("");
            }}
            required
          />
        </div>
        <div className="input-group">
          <label>สถานที่</label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => {
              setFormData({ ...formData, venue: e.target.value });
              setError("");
            }}
            required
          />
        </div>
        <div className="input-group">
          <label>จำนวนบัตรทั้งหมด</label>
          <input
            type="number"
            value={formData.totalTickets || ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                totalTickets: e.target.value ? parseInt(e.target.value) : 0,
              });
              setError("");
            }}
            min={concert.bookedTickets}
          />
          <small style={{ color: "#6b7280" }}>
            จองแล้ว: {concert.bookedTickets} (ต้องไม่น้อยกว่านี้)
          </small>
        </div>
        <div className="input-group">
          <label>ราคาต่อใบ (บาท)</label>
          <input
            type="number"
            value={formData.price || ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                price: e.target.value ? parseInt(e.target.value) : 0,
              });
              setError("");
            }}
            min={0}
          />
        </div>
        <div className="input-group" style={{ gridColumn: "1 / -1" }}>
          <label>อัพโหลดรูปภาพ</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          />
          {uploading && (
            <small style={{ color: "#3b82f6" }}>⏳ กำลังอัพโหลด...</small>
          )}
        </div>
        <div className="input-group" style={{ gridColumn: "1 / -1" }}>
          <label>หรือ ใส่ URL รูปภาพ</label>
          <input
            type="text"
            value={formData.imageUrl}
            onChange={(e) => {
              setFormData({ ...formData, imageUrl: e.target.value });
              setError("");
            }}
            placeholder="https://example.com/concert-image.jpg"
          />
        </div>
        {formData.imageUrl && (
          <div style={{ gridColumn: "1 / -1", marginTop: "-8px" }}>
            <img
              src={getImageUrl(formData.imageUrl)}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "4px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button type="submit" className="btn btn-success">
          บันทึกการเปลี่ยนแปลง
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

function CreateConcertForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    date: "",
    venue: "",
    totalTickets: 100,
    price: 0,
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/upload`,
        formDataObj,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setFormData({ ...formData, imageUrl: response.data.url });
      setError("");
    } catch (err) {
      setError(
        "ไม่สามารถอัพโหลดไฟล์: " + (err.response?.data?.error || err.message),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return setError("ชื่อคอนเสิร์ตไม่สามารถว่างได้");
    if (!formData.artist.trim()) return setError("ชื่อศิลปินไม่สามารถว่างได้");
    if (!formData.date) return setError("วันที่ไม่สามารถว่างได้");
    if (!formData.venue.trim()) return setError("สถานที่ไม่สามารถว่างได้");
    if (formData.totalTickets <= 0) return setError("จำนวนบัตรต้องมากกว่า 0");
    if (formData.price < 0) return setError("ราคาไม่สามารถติดลบได้");
    if (!formData.imageUrl) return setError("กรุณาอัพโหลดหรือใส่ URL รูปภาพ");

    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div className="input-group">
          <label>ชื่อคอนเสิร์ต *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setError("");
            }}
            placeholder="เช่น ลำปางเทศกาลฟิสเทกระ 2026"
            required
          />
        </div>
        <div className="input-group">
          <label>ชื่อศิลปิน *</label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) => {
              setFormData({ ...formData, artist: e.target.value });
              setError("");
            }}
            placeholder="เช่น The Beatles"
            required
          />
        </div>
        <div className="input-group">
          <label>วันที่จัดงาน *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => {
              setFormData({ ...formData, date: e.target.value });
              setError("");
            }}
            required
          />
        </div>
        <div className="input-group">
          <label>สถานที่ *</label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => {
              setFormData({ ...formData, venue: e.target.value });
              setError("");
            }}
            placeholder="เช่น ราชมังคลากีฬาสถาน"
            required
          />
        </div>
        <div className="input-group">
          <label>จำนวนบัตรทั้งหมด *</label>
          <input
            type="number"
            value={formData.totalTickets || ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                totalTickets: e.target.value ? parseInt(e.target.value) : 0,
              });
              setError("");
            }}
            min={1}
            required
          />
        </div>
        <div className="input-group">
          <label>ราคาต่อใบ (บาท) *</label>
          <input
            type="number"
            value={formData.price || ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                price: e.target.value ? parseInt(e.target.value) : 0,
              });
              setError("");
            }}
            min={0}
            step={100}
            required
          />
        </div>
        <div className="input-group" style={{ gridColumn: "1 / -1" }}>
          <label>อัพโหลดรูปภาพ *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
            required={!formData.imageUrl}
          />
          {uploading && (
            <small style={{ color: "#3b82f6" }}>⏳ กำลังอัพโหลด...</small>
          )}
        </div>
        <div className="input-group" style={{ gridColumn: "1 / -1" }}>
          <label>หรือ ใส่ URL รูปภาพ</label>
          <input
            type="text"
            value={formData.imageUrl}
            onChange={(e) => {
              setFormData({ ...formData, imageUrl: e.target.value });
              setError("");
            }}
            placeholder="https://example.com/concert-image.jpg"
          />
        </div>
        {formData.imageUrl && (
          <div style={{ gridColumn: "1 / -1", marginTop: "-8px" }}>
            <img
              src={getImageUrl(formData.imageUrl)}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "4px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="submit"
          className="btn btn-success"
          disabled={loading || uploading}
        >
          {loading ? "กำลังสร้าง..." : "สร้างคอนเสิร์ต"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

export default AdminDashboard;
