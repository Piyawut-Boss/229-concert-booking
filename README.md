# 🎵 Concert Ticket Reservation System

ระบบจองตั๋วคอนเสิร์ตแบบ Full Stack พร้อม **Concurrency Control** และ **Real-time Updates**

## 🎯 Features

### User Features
- ✅ ดูรายการคอนเสิร์ตทั้งหมด
- ✅ จองบัตรคอนเสิร์ต (Real-time availability)
- ✅ ตรวจสอบการจองด้วยอีเมล
- ✅ ระบบป้องกัน Overselling (Race Condition Protection)

### Admin Features
- ✅ Dashboard แสดงสถิติแบบ Real-time
- ✅ จัดการข้อมูลคอนเสิร์ต
- ✅ เปิด/ปิดการขายบัตร
- ✅ ดูรายการจองทั้งหมด
- ✅ ยกเลิกการจอง (คืนบัตรอัตโนมัติ)

## 🏗️ Architecture & Technologies

### Category I: Multithreading & Concurrency
- **Lock Mechanism**: ป้องกัน Race Condition
- **Atomic Operations**: การลดจำนวนบัตรแบบ Thread-safe
- **Async/Await**: จัดการ request พร้อมกัน

### Category II: Containerization
- **Docker**: พร้อม Dockerfile สำหรับ Backend & Frontend
- **Docker Compose**: จัดการ multi-container

### Category III: Version Control & Automation
- **Git**: Version control
- **npm scripts**: Automation

### Category IV: Distributed System
- **REST API**: Communication protocol
- **Real-time Updates**: Auto-refresh ทุก 5 วินาที
- **Stateless Backend**: รองรับ horizontal scaling

### Category V: Security & Reliability
- **Authentication**: Admin login
- **Authorization**: Role-based access control
- **Audit Logging**: บันทึกทุก transaction
- **Data Validation**: Input validation

### Category VI: Multi-user System
- **Concurrent Users**: รองรับผู้ใช้หลายร้อยคนพร้อมกัน
- **Role Separation**: User vs Admin

## 📦 Tech Stack

### Backend
- Node.js + Express
- In-memory Database (ในระบบจริงใช้ PostgreSQL/MongoDB)
- Lock-based Concurrency Control

### Frontend
- React 18
- React Router
- Axios
- Vite

## 🚀 Installation & Running

### วิธีที่ 1: รันแยก (Development)

#### Backend
```bash
cd backend
npm install
npm start
# Server จะทำงานที่ http://localhost:5000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend จะทำงานที่ http://localhost:3000
```

### วิธีที่ 2: ใช้ Docker (Production-ready)

```bash
# อยู่ใน root directory
docker-compose up --build

# เข้าใช้งาน
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

## 📚 API Documentation

### Public APIs

#### GET /api/concerts
ดึงรายการคอนเสิร์ตทั้งหมด

#### GET /api/concerts/:id
ดึงข้อมูลคอนเสิร์ตตาม ID

#### POST /api/reservations
จองบัตร
```json
{
  "concertId": "1",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "quantity": 2
}
```

#### GET /api/reservations/:email
ดึงการจองตามอีเมล

### Admin APIs

#### POST /api/admin/login
เข้าสู่ระบบ Admin
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### GET /api/admin/stats
ดึงสถิติทั้งหมด

#### GET /api/admin/reservations
ดึงการจองทั้งหมด

#### PUT /api/admin/concerts/:id
อัปเดตข้อมูลคอนเสิร์ต

#### DELETE /api/admin/reservations/:id
ยกเลิกการจอง

## 🔐 Default Admin Credentials

```
Username: admin
Password: admin123
```

## 🧪 Testing Concurrency

### ทดสอบ Race Condition Protection

เปิด browser หลายๆ tab และพยายามจองบัตรสุดท้ายพร้อมกัน

```bash
# ใช้ script ทดสอบ (ต้องมี curl)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/reservations \
    -H "Content-Type: application/json" \
    -d "{
      \"concertId\": \"1\",
      \"customerName\": \"User$i\",
      \"customerEmail\": \"user$i@test.com\",
      \"quantity\": 1
    }" &
done
wait
```

ผลลัพธ์ที่ถูกต้อง: มีเพียง 1 request ที่ได้บัตรสุดท้าย

## 🏛️ System Design Principles

### 1. Concurrency Control
- Lock-based mechanism
- Atomic decrease operation
- Retry logic สำหรับ lock acquisition

### 2. Data Consistency
- Transaction-like operations
- Rollback support
- Audit trail

### 3. Scalability
- Stateless API design
- Ready for load balancer
- Database connection pooling

### 4. Security
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## 📊 Database Schema (Conceptual)

```javascript
Concert {
  id: string
  name: string
  artist: string
  date: date
  venue: string
  totalTickets: number
  availableTickets: number
  price: number
  status: enum('open', 'closed')
  imageUrl: string
}

Reservation {
  id: string
  concertId: string
  customerName: string
  customerEmail: string
  quantity: number
  totalPrice: number
  reservedAt: datetime
  status: enum('confirmed', 'cancelled')
}
```

## 🔄 Workflow

### User Booking Flow
1. User เลือกคอนเสิร์ต
2. กรอกข้อมูล + จำนวนบัตร
3. System acquire lock
4. ตรวจสอบ availability
5. ลดจำนวนบัตร (atomic)
6. สร้าง reservation
7. Release lock
8. ส่ง confirmation

### Admin Management Flow
1. Admin login
2. View real-time dashboard
3. Update concert info (with lock)
4. Toggle booking status
5. Cancel reservations (return tickets)
6. Monitor system logs

## 🚧 Future Enhancements

- [ ] PostgreSQL/MongoDB integration
- [ ] Redis for distributed locking
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Kubernetes deployment
- [ ] Prometheus monitoring
- [ ] ELK stack for logging
- [ ] CDN for static assets
- [ ] Rate limiting

## 📝 License

MIT License - Free to use for educational purposes

## 👨‍💻 Developer

Built as a demonstration of Operating System concepts in web applications:
- Concurrency Control
- Distributed Systems
- Cloud Architecture
- Security & Reliability

---

**Note**: ระบบนี้ออกแบบมาเพื่อการศึกษาและสาธิตแนวคิดด้าน OS และ Cloud Computing
ในการใช้งานจริงควรเพิ่ม features เช่น database, queue system, และ monitoring tools
