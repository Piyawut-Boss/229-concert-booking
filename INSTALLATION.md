# 📖 คู่มือการติดตั้งและรันระบบ

## ✅ ความต้องการของระบบ (Prerequisites)

- Node.js 18+ 
- npm หรือ yarn
- Docker & Docker Compose (optional, สำหรับ production)

## 🚀 วิธีการติดตั้ง

### วิธีที่ 1: รันแบบ Development (แนะนำสำหรับการพัฒนา)

#### ขั้นตอนที่ 1: ติดตั้ง Backend

```bash
# เข้าไปในโฟลเดอร์ backend
cd backend

# ติดตั้ง dependencies
npm install

# รันเซิร์ฟเวอร์
npm start
```

Backend จะทำงานที่: **http://localhost:5000**

#### ขั้นตอนที่ 2: ติดตั้ง Frontend (เปิด Terminal ใหม่)

```bash
# เข้าไปในโฟลเดอร์ frontend
cd frontend

# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev
```

Frontend จะทำงานที่: **http://localhost:3000**

---

### วิธีที่ 2: รันด้วย Docker (แนะนำสำหรับ production)

#### ขั้นตอนที่ 1: Build และรัน

```bash
# ใน root directory ของโปรเจกต์
docker-compose up --build
```

#### ขั้นตอนที่ 2: เข้าใช้งาน

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

#### หยุดระบบ

```bash
# กด Ctrl+C หรือ
docker-compose down
```

---

## 🧪 การทดสอบระบบ

### 1. ทดสอบ Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# ดูรายการคอนเสิร์ต
curl http://localhost:5000/api/concerts
```

### 2. ทดสอบ Frontend

เปิดเบราว์เซอร์ไปที่: http://localhost:3000

### 3. ทดสอบ Admin Panel

1. ไปที่: http://localhost:3000/admin
2. Login ด้วย:
   - Username: `admin`
   - Password: `admin123`

### 4. ทดสอบ Concurrency (Race Condition Protection)

เปิดหลาย browser tabs และพยายามจองบัตรใบสุดท้ายพร้อมกัน
ระบบจะอนุญาตให้เพียง 1 คนเท่านั้นที่จองได้สำเร็จ

---

## 🔧 การแก้ไขปัญหา

### ปัญหา: Port ถูกใช้งานอยู่

**Backend (Port 5000)**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 3000)**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### ปัญหา: Cannot connect to backend

1. ตรวจสอบว่า backend รันอยู่ที่ port 5000
2. ตรวจสอบ CORS settings
3. ลอง restart ทั้ง backend และ frontend

### ปัญหา: npm install ล้มเหลว

```bash
# ลบ node_modules และ lock file
rm -rf node_modules package-lock.json

# ติดตั้งใหม่
npm install
```

### ปัญหา: Docker build ล้มเหลว

```bash
# ลบ images และ containers เก่า
docker-compose down -v
docker system prune -a

# Build ใหม่
docker-compose up --build
```

---

## 📊 โครงสร้างโปรเจกต์

```
concert-ticket-system/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   ├── Dockerfile         # Backend container config
│   └── .env              # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Main app component
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Global styles
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.js    # Vite configuration
│   ├── Dockerfile        # Frontend container config
│   └── nginx.conf        # Nginx config for production
│
├── docker-compose.yml    # Docker orchestration
├── README.md            # Main documentation
└── INSTALLATION.md      # This file
```

---

## 🎯 ขั้นตอนต่อไปหลังติดตั้ง

1. **ทดสอบการจองบัตร**
   - เลือกคอนเสิร์ต
   - กรอกข้อมูล
   - ทดสอบการจอง

2. **ทดสอบ Admin Panel**
   - Login เข้าระบบ
   - ดู Dashboard
   - แก้ไขข้อมูลคอนเสิร์ต
   - ยกเลิกการจอง

3. **ทดสอบ Concurrency**
   - จองบัตรจากหลาย browser พร้อมกัน
   - ตรวจสอบว่าระบบป้องกัน overselling

---

## 💡 Tips

1. **Development Mode**: ใช้ `npm run dev` สำหรับ hot reload
2. **Production Mode**: ใช้ Docker Compose สำหรับ production-ready deployment
3. **Auto Refresh**: Frontend จะ refresh ข้อมูลอัตโนมัติทุก 5 วินาที
4. **Real-time Updates**: เปิดหลาย tabs เพื่อดูการอัปเดตแบบ real-time

---

## 📞 ต้องการความช่วยเหลือ?

- อ่าน README.md สำหรับข้อมูลเพิ่มเติม
- ตรวจสอบ console logs สำหรับ error messages
- ตรวจสอบว่า dependencies ติดตั้งครบถ้วน

---

**Happy Coding! 🎵**
