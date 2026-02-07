# Admin Functions - Quick Test Reference

## 🔧 Quick Test Commands

### 1. Admin Login
```bash
# Test login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected: Returns token for use in other requests
```

### 2. Get Dashboard Stats
```bash
curl http://localhost:5000/api/admin/stats | jq

# Returns:
# - totalConcerts
# - activeConcerts  
# - totalReservations
# - totalRevenue
# - concerts array with details
```

### 3. Get All Reservations
```bash
curl http://localhost:5000/api/admin/reservations | jq

# Returns array of all reservations with:
# - id, concertId, concertName
# - customerName, customerEmail
# - quantity, totalPrice
# - status, reservedAt
```

### 4. Create New Concert
```bash
curl -X POST http://localhost:5000/api/admin/concerts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SUMMER FESTIVAL 2026",
    "artist": "Various Artists",
    "date": "2026-06-15",
    "venue": "Central Park",
    "totalTickets": 2000,
    "price": 1800
  }'

# Required fields: name, artist, date, venue, totalTickets, price
```

### 5. Update Concert (All Fields)
```bash
# Update from concert ID 1
curl -X PUT http://localhost:5000/api/admin/concerts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "UPDATED NAME",
    "artist": "UPDATED ARTIST",
    "date": "2026-07-20",
    "venue": "UPDATED VENUE",
    "price": 2500,
    "totalTickets": 2500,
    "status": "open"
  }'

# Can update any or all fields
# totalTickets cannot be less than already booked
```

### 6. Toggle Concert Status
```bash
# Close concert
curl -X PUT http://localhost:5000/api/admin/concerts/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'

# Reopen concert
curl -X PUT http://localhost:5000/api/admin/concerts/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "open"}'
```

### 7. Cancel Reservation
```bash
# Replace RES123456 with actual reservation ID
curl -X DELETE http://localhost:5000/api/admin/reservations/RES123456 \
  -H "Content-Type: application/json"

# Returns: success message and cancelled reservation details
# Effect: Tickets returned to concert, reservation status set to 'cancelled'
```

---

## 🖥️ Frontend UI Quick Guide

### Admin Login Page
1. Go to: http://localhost:3000/admin
2. Username: **admin**
3. Password: **admin123**
4. Click: "เข้าสู่ระบบ"

### Dashboard Tab (📊 Dashboard)
- Shows 4 stat cards:
  - 🎵 Total concerts
  - ✅ Active concerts
  - 📋 Total reservations
  - 💰 Total revenue
- Displays table with concert summary

### Manage Concerts Tab (🎵 จัดการคอนเสิร์ต)
- **Create Concert:**
  1. Click "➕ สร้างคอนเสิร์ตใหม่"
  2. Fill all fields (marked with *)
  3. Click "✅ สร้างคอนเสิร์ต"
  4. See success alert
  5. Concert appears in list

- **Edit Concert:**
  1. Click "แก้ไขข้อมูล" on any concert
  2. Edit any fields: ชื่อ, ศิลปิน, วันที่, สถานที่, บัตร, ราคา
  3. Click "บันทึกการเปลี่ยนแปลง"
  4. See success alert

- **Toggle Status:**
  1. Click "ปิดการขาย" to close
  2. Click "เปิดการขาย" to reopen
  3. Badge color changes

### Reservations Tab (📋 การจองทั้งหมด)
- View table with all reservations
- Each row shows:
  - Reservation ID
  - Concert name
  - Customer details
  - Quantity & price
  - Booking date
- Click "ยกเลิก" to cancel
- Confirmation dialog appears
- Success alert after cancellation

---

## 🧪 Complete Test Workflow

### Setup
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend  
cd frontend
npm run dev
```

### Step-by-Step Test

1. **Login as Admin**
   - Open: http://localhost:3000/admin
   - Login with admin/admin123
   - Redirected to dashboard

2. **Check Dashboard**
   - Click "📊 Dashboard" tab
   - Verify stats display
   - Check concert table

3. **Create New Concert**
   - Click "🎵 จัดการคอนเสิร์ต"
   - Click "➕ สร้างคอนเสิร์ตใหม่"
   - Fill: Name, Artist, Date, Venue, Tickets (500), Price (1500)
   - Submit and verify

4. **Edit Concert**
   - Click "แก้ไขข้อมูล" on new concert
   - Change: Price to 2000, Tickets to 600
   - Submit and verify changes

5. **Toggle Status**
   - Click "ปิดการขาย"
   - Verify status badge changes
   - Click "เปิดการขาย"
   - Verify it changes back

6. **Book from Customer**
   - Open: http://localhost:3000 (customer page)
   - Book 5 tickets for concert
   - Verify tickets decrease

7. **View Reservation**
   - Go back to admin
   - Click "📋 การจองทั้งหมด"
   - Verify reservation shows

8. **Cancel Reservation**
   - Click "ยกเลิก" on reservation
   - Confirm dialog
   - Verify success alert
   - Check concert tickets increased

---

## 🐛 Common Issues & Solutions

### Issue: Concert list doesn't update after create
**Solution:** Wait 5 seconds for auto-refresh or refresh page manually

### Issue: Can't edit concert name
**Solution:** Form should appear - check that "แก้ไขข้อมูล" button was clicked

### Issue: Cancel reservation fails
**Solution:** Check reservation ID is correct, not already cancelled

### Issue: Create form validation errors
**Solution:** Check all required fields filled, totalTickets > 0, price >= 0

---

## 📋 Test Checklist

### Backend Routes
- [ ] POST /api/admin/login ✅
- [ ] GET /api/admin/stats ✅
- [ ] GET /api/admin/reservations ✅
- [ ] POST /api/admin/concerts ✅
- [ ] PUT /api/admin/concerts/:id ✅
- [ ] DELETE /api/admin/reservations/:id ✅

### Frontend Features
- [ ] Admin login page works
- [ ] Dashboard tab displays stats
- [ ] Concerts tab shows all concerts
- [ ] Create concert button works
- [ ] Create concert form validates
- [ ] Edit concert button works
- [ ] Edit form all fields editable
- [ ] Toggle status button works
- [ ] Reservations tab shows all bookings
- [ ] Cancel reservation button works
- [ ] Confirmation dialog works

### Data Integrity
- [ ] Cancelled reservation changes status
- [ ] Tickets returned to concert
- [ ] Stats update correctly
- [ ] New concerts appear immediately
- [ ] Edited data persists

---

## 🔄 Auto-Refresh Behavior

Dashboard refreshes every **5 seconds** with:
- New reservations
- Updated concert stats
- Changed statuses
- New concerts created

Manual refresh: Press F5 or click any tab twice

---

## 📱 Responsive Testing

Test on different screen sizes:
- Desktop (1920x1080) ✅
- Laptop (1366x768) ✅
- Tablet (768x1024) ✅
- Mobile (375x667) ✅

Tables use horizontal scroll on mobile

---

## 🎯 Success Criteria

All functions working correctly when:
- ✅ No console errors
- ✅ All alerts/confirmations appear
- ✅ Data persists after refresh
- ✅ Stats calculate correctly
- ✅ Validations prevent invalid data
- ✅ Lock prevents double-operations
- ✅ Timestamps are accurate

---

**Last Updated:** February 7, 2026
