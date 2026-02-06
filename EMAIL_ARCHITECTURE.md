# 🎭 Email System Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CONCERT TICKET SYSTEM                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐         ┌──────────────────────────────┐
│       FRONTEND              │         │       BACKEND API             │
│     (React + Vite)          │         │    (Express.js on 5000)       │
│                              │         │                               │
│  ┌────────────────────────┐  │         │  ┌──────────────────────┐   │
│  │  Google Login Button   │  │         │  │ Google Auth Check    │   │
│  │                        │  │  POST   │  │ (requireGoogleAuth)  │   │
│  │  handleLoginSuccess()  ├──┼─────────┼──┤ /api/login           │   │
│  │  - Decode JWT          │  │         │  │                      │   │
│  │  - Save to context     │  │         │  └──────────────────────┘   │
│  │  - Call /api/login     │  │         │           │                 │
│  └────────────────────────┘  │         │           │                 │
│                              │         │           ▼                 │
│  ┌────────────────────────┐  │         │  ┌──────────────────────┐   │
│  │  Booking Modal         │  │         │  │ Email Service        │   │
│  │                        │  │         │  │ (Nodemailer)         │   │
│  │  handleBooking()       │  │  POST   │  │                      │   │
│  │  - Fill form           ├──┼─────────┼──┤ - sendLoginEmail()   │   │
│  │  - Call /api/          │  │         │  │ - sendBooking        │   │
│  │    reservations        │  │         │  │   Email()            │   │
│  │  - Show confirmation   │  │         │  │ - testEmail()        │   │
│  └────────────────────────┘  │         │  └──────────────────────┘   │
│                              │         │           │                 │
└──────────────────────────────┘         │           ▼                 │
                                         │  ┌──────────────────────┐   │
        http://localhost:3000           │  │ Gmail / SMTP Server  │   │
                                         │  │ (SMTP or Gmail API)  │   │
                                         │  └──────────────────────┘   │
                                         │           │                 │
    Proxy: /api/* ────────────────────► http://localhost:5000          │
                                         └──────────────────────────────┘
                                                     │
                                                     ▼
                                         ┌──────────────────────────────┐
                                         │    User's Email Inbox        │
                                         │                              │
                                         │  ✅ Login Email              │
                                         │  ✅ Booking Email            │
                                         └──────────────────────────────┘
```

---

## Login Flow with Email

```
User                Frontend                Backend              Email Service
 │                    │                        │                      │
 ├──Click Google───────┤                        │                      │
 │   Sign In Button    │                        │                      │
 │                     ├─ Redirect to ─────────►│                      │
 │                     │  Google OAuth          │                      │
 │                     │◄────JWT Token──────────┤                      │
 │                     │  (credentialResponse)  │                      │
 │                     │                        │                      │
 │                     │ Decode JWT Token       │                      │
 │                     │ Extract: name, email   │                      │
 │                     │ Save to context        │                      │
 │                     │ (UI updates instantly) │                      │
 │                     │                        │                      │
 │                     ├─ POST /api/login ─────►                       │
 │                     │  userName + email     │                       │
 │                     │  googleToken          │                       │
 │                     │                        │ Verify token         │
 │                     │                        │ (requireGoogleAuth)  │
 │                     │                        │                      │
 │                     │                        ├─ sendLoginEmail() ──►│
 │                     │                        │  (Async, no wait)    │
 │                     │◄──── 200 OK ──────────┤                      │
 │                     │                        │                      │
 │ Sees navbar with    │                        │  Connect to Gmail   │
 │ login confirmation  │                        │  Send HTML email  ◄─┤
 │                     │                        │                      │
 │ ✅ Logged in!       │                        │  ✅ Email sent!     │
 │                     │                        │                      │
 │ Opens email         │                        │                      │
 │ ✉️ Gets login       │                        │                      │
 │    confirmation     │                        │                      │
```

---

## Booking Flow with Email

```
User               Frontend           Backend              Email Service
 │                   │                   │                      │
 ├──Click จองบัตร───┤                   │                      │
 │                   │ Show BookingModal │                      │
 │                   │ Fill form         │                      │
 │                   │                   │                      │
 ├──Submit Form─────┤                   │                      │
 │                   ├─ POST /api/      │                      │
 │                   │   reservations ──┤ Check auth           │
 │                   │                   ├─ requireGoogle-      │
 │                   │                   │   Auth middleware    │
 │                   │                   │                      │
 │                   │                   ├─ Verify token       │
 │                   │                   ├─ Check availability │
 │                   │                   ├─ Create reservation │
 │                   │                   │ (Decrement tickets) │
 │                   │                   │                      │
 │                   │                   ├─ sendBooking        │
 │                   │                   │   Email() ─────────►│
 │                   │                   │ (Async, no wait)    │
 │                   │                   │                      │
 │                   │◄── 201 Created ──┤                      │
 │                   │   Reservation ID  │                      │
 │                   │                   │  Connect to Gmail   │
 │ ✅ Booking        │                   │  Send HTML email  ◄─┤
 │    Confirmed!     │                   │                      │
 │ Shows Conf.ID     │                   │  ✅ Email sent!     │
 │                   │                   │                      │
 │ Opens email       │                   │                      │
 │ ✉️ Gets booking   │                   │                      │
 │    confirmation   │                   │                      │
 │    with details   │                   │                      │
```

---

## Email Service Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│           Email Service Module                                │
│         (backend/services/emailService.js)                    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Initialize Nodemailer Transporter                     │ │
│  │  - Check Gmail credentials (EMAIL_USER, EMAIL_PASSWORD)│ │
│  │  - OR Check Custom SMTP config                         │ │
│  │  - Return transporter or null                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          │                                     │
│           ┌──────────────┼──────────────┐                     │
│           ▼              ▼              ▼                     │
│   ┌─────────────┐ ┌─────────────┐ ┌──────────────┐           │
│   │   Send      │ │   Send      │ │   Test       │           │
│   │  Login      │ │  Booking    │ │   Email      │           │
│   │   Email     │ │     Email   │ │   Config     │           │
│   └─────────────┘ └─────────────┘ └──────────────┘           │
│         │                │                 │                   │
│         ├────────────────┼─────────────────┤                   │
│         ▼                ▼                 ▼                   │
│   ┌────────────────────────────────────────────────────────┐  │
│   │  HTML Email Templates                                │  │
│   │  - Get Login Email Template()                         │  │
│   │  - Get Booking Email Template()                       │  │
│   │  - Professional design with styling                  │  │
│   └────────────────────────────────────────────────────────┘  │
│         │                                                      │
│         ▼                                                      │
│   ┌────────────────────────────────────────────────────────┐  │
│   │  Send via Nodemailer                                  │  │
│   │  - Compose email with subject, HTML, recipient        │  │
│   │  - Call transporter.sendMail()                        │  │
│   │  - Log success or error                               │  │
│   │  - Return boolean (success/failure)                   │  │
│   └────────────────────────────────────────────────────────┘  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## File Dependency Graph

```
backend/
├── server.js (MAIN)
│   │
│   ├── imports emailService
│   │   └── services/emailService.js (NEW)
│   │       ├── imports nodemailer
│   │       ├── getLoginEmailTemplate()
│   │       ├── getBookingEmailTemplate()
│   │       ├── sendLoginEmail()
│   │       ├── sendBookingConfirmationEmail()
│   │       └── testEmailConfiguration()
│   │
│   ├── POST /api/login
│   │   └── calls emailService.sendLoginEmail()
│   │
│   └── POST /api/reservations
│       └── calls emailService.sendBookingConfirmationEmail()
│
├── .env (CONFIGURATION)
│   ├── EMAIL_USER, EMAIL_PASSWORD
│   ├── SEND_LOGIN_EMAIL, SEND_BOOKING_EMAIL
│   └── FRONTEND_URL, EMAIL_FROM
│
└── .env.example (TEMPLATE)

frontend/
└── src/components/
    └── GoogleLogin.jsx (UPDATED)
        └── calls POST /api/login
            └── imports axios
```

---

## Data Flow for Login Email

```
┌─ Frontend ─────────────────────────────────────────────────────────┐
│                                                                     │
│  credentialResponse (from Google)                                  │
│  {                                                                  │
│    credential: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJzdWIiOiIxMjM..." │
│  }                                                                  │
│           │                                                        │
│           ▼                                                        │
│  Decode JWT:                                                       │
│  {                                                                 │
│    "name": "John Doe",                                            │
│    "email": "john@example.com",                                   │
│    "picture": "https://...",                                      │
│    "sub": "google-id-123",                                        │
│    ...                                                            │
│  }                                                                 │
│           │                                                        │
│           ▼                                                        │
│  POST /api/login                                                   │
│  {                                                                 │
│    "userName": "John Doe",                                        │
│    "userEmail": "john@example.com",                              │
│    "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJzdWIiOiIxMjM..." │
│  }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─ Backend ──────────────────────────────────────────────────────────┐
│                                                                     │
│  requireGoogleAuth middleware                                      │
│  - Extract token from Authorization header                         │
│  - Call verifyGoogleToken(token)                                  │
│  - Set req.isAuthenticated = true/false                           │
│           │                                                        │
│           ▼                                                        │
│  POST /api/login handler                                          │
│  {                                                                 │
│    userName: "John Doe",                                          │
│    userEmail: "john@example.com"                                  │
│  }                                                                 │
│           │                                                        │
│           ▼                                                        │
│  emailService.sendLoginEmail("John Doe", "john@example.com")     │
│           │                                                        │
│           ├─ Check if EMAIL_USER configured                       │
│           ├─ Initialize Nodemailer transporter                    │
│           ├─ getLoginEmailTemplate("John Doe", "john@example.com")│
│           │  Returns:                                             │
│           │  {                                                    │
│           │    subject: "✅ เข้าสู่ระบบสำเร็จ - ...",              │
│           │    html: "<html>...John Doe.....</html>"             │
│           │  }                                                    │
│           │                                                        │
│           ├─ Compose email:                                       │
│           │  {                                                    │
│           │    from: "noreply@concertticket.com",                │
│           │    to: "john@example.com",                           │
│           │    subject: "✅ เข้าสู่ระบบสำเร็จ - ...",              │
│           │    html: "<html>...John Doe.....</html>"             │
│           │  }                                                    │
│           │                                                        │
│           └─ transporter.sendMail(mailOptions)                    │
│              (Async - doesn't block)                              │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─ Email Provider (Gmail/SMTP) ──────────────────────────────────────┐
│                                                                     │
│  Send to Gmail SMTP Server (smtp.gmail.com:587)                   │
│           │                                                        │
│           ▼                                                        │
│  Gmail routes email to john@example.com                           │
│           │                                                        │
│           ▼                                                        │
│  User receives email in inbox ✉️                                   │
│  [✅ เข้าสู่ระบบสำเร็จ - Concert Ticket System]                    │
│  สวัสดี John Doe!                                                │
│  ยินดีต้อนรับเข้าสู่ระบบจองตั๋วคอนเสิร์ต                             │
│  ...                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Email Template Structure

```
┌── Email Template ─────────────────────────────────────┐
│                                                        │
│  ✅ HTML/CSS Styling                                 │
│     ├─ Container (600px max width)                   │
│     ├─ Header (gradient background)                  │
│     ├─ Content section                               │
│     ├─ Info blocks (user details)                    │
│     ├─ Action button                                 │
│     ├─ Divider                                       │
│     └─ Footer (disclaimer, contact)                  │
│                                                        │
│  ✅ Data Insertion Points                             │
│     ├─ ${userName} → "John Doe"                      │
│     ├─ ${email} → "john@example.com"                 │
│     ├─ ${FRONTEND_URL} → "http://localhost:3000"     │
│     ├─ ${concert.name} → "LAMPANG MUSIC FESTIVAL"    │
│     ├─ ${reservation.totalPrice} → "3000"            │
│     └─ ... more dynamic fields                       │
│                                                        │
│  ✅ Template Engines (inline in emailService.js)    │
│     `getLoginEmailTemplate()` returns HTML string   │
│     `getBookingEmailTemplate()` returns HTML string │
│                                                        │
│  ✅ Professional Design                              │
│     ├─ Company branding (colors, logo)              │
│     ├─ Clear call-to-action buttons                 │
│     ├─ Responsive layout                            │
│     ├─ Thai language support                        │
│     └─ Security/disclaimer notices                  │
└──────────────────────────────────────────────────────┘
```

---

## Configuration Priority

```
Email Service Initialization:

1. Check environment variables
   ├─ If EMAIL_USER + EMAIL_PASSWORD exist
   │  └─ Use Gmail configuration
   │
   ├─ Else if SMTP_HOST + SMTP_PORT exist
   │  └─ Use Custom SMTP configuration
   │
   └─ Else
      └─ Transporter = null (no email)

2. Nodemailer initialization
   ├─ Gmail: OAuth2 via @gmail.com service
   └─ Custom: SMTP with host/port/auth

3. On server startup
   ├─ Call testEmailConfiguration()
   ├─ Log: ✅ Email configured (success)
   └─ Log: ⚠️ Email not configured (warning)
```

---

## Error Handling Flow

```
Email Send Attempt
       │
       ▼
Try SendMail
       │
   ┌───┴───┐
   │       │
  YES     NO
   │       │
   ✅      ❌
  Log    Catch Error
  Success │
         └─ Log Error Details
            ├─ Error message
            ├─ Email address
            ├─ Timestamp
            └─ Return false

Important: Error doesn't break the flow!
- Login still succeeds even if email fails
- Booking still succeeds even if email fails
- User gets immediate feedback
- Email is best-effort, not critical
```

---

## Logging & Monitoring

```
Console Output Examples:

Startup:
[EMAIL] Testing email configuration...
[EMAIL] ✅ Email configuration verified successfully
[EMAIL] 📧 Email notifications enabled

Login Success:
[LOGIN] ✅ User logged in: john@example.com
[EMAIL] ✅ Login email sent to john@example.com: <message-id>

Login Error (no email):
[LOGIN] ✅ User logged in: john@example.com
[EMAIL] ⚠️ Email transporter not configured. Skipping login email.

Booking Success:
[GOOGLE AUTH] [RESERVATION] RES-12345 - John Doe reserved 2 tickets
[EMAIL] ✅ Booking confirmation email sent to john@example.com: <message-id>

Email Error:
[EMAIL] ❌ Error sending login email to john@example.com: Connection timeout
[EMAIL] ❌ Error: Invalid login credentials

Configuration Error:
[EMAIL] ⚠️ Email transporter not configured
```

---

This visual guide shows how all components work together to deliver email notifications! 📧🎵
