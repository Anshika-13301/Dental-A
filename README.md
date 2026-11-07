# DentAgent AI — Dental Patient Re-Activation & Hygiene Booking Agent

> Commercial-grade, multi-tenant full-stack SaaS web application designed to eliminate empty hygiene chairs for dental practices via context-aware two-way SMS recalls and automated chair booking.

Target Remote GitHub Repository:
`https://github.com/Anshika-13301/Dental-A.git`

---

## 1. Executive Summary & Dual Monetization Model

Dormant hygiene chairs cost the average general dental practice upwards of **$140,000 annually**. **DentAgent AI** continuously audits practice management system (PMS) chart histories, identifies patients overdue for preventative prophylaxis (>6, >9, and >12 months), initiates empathetic two-way SMS dialogues, answers insurance coverage inquiries, and books confirmed appointments onto hygienist chair schedules.

### Dual Monetization Architecture
DentAgent AI employs a dual monetization pricing structure:
- **$600.00 / month flat platform retainer:** Unlimited automated recall workflows, PMS sync, multi-hygienist calendar management, and staff takeover inbox.
- **$20.00 per confirmed chair booking:** A modest success fee billed only when a patient is confirmed into a chair slot.
- **Net Practice Value Equation:** Average hygiene prophylaxis visit = **$185.00** gross production. After the $20 success fee, the practice retains **$165.00** of chair revenue per re-activated patient (**4.5x - 8.2x ROI multiplier**).

---

## 2. Anti-AI / Human-Centric UI & UX System Design

The user interface follows modern healthcare software standards (Stripe, Linear, and Raycast aesthetic):
- **Neutral Zinc Palette:** `#FAFAFA`, `#F4F4F5`, `#18181B` with deep slate blue `#0F172A` and professional clinical teal `#0284C7`.
- **Micro-Typography:** Tabular figures (`font-mono`) for dates, phone numbers, and pricing; tight tracking (`tracking-tight`) on clinical headings.
- **Data-Dense Layouts:** Compact tables, split-screen two-way SMS audit center, real-time revenue meters.
- **Clinical Terminology:** Replaces AI buzzwords with authentic clinical terminology: *"Recall Cadence"*, *"Chair Rate"*, *"Overdue Hygiene Registry"*, *"Two-Way SMS Audit Log"*, *"Gross Hygiene Production"*.

---

## 3. Tech Stack

### Frontend (Next.js App Router):
- **Framework:** Next.js 14+ (App Router, Server & Client Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide Icons, Shadcn UI-inspired design tokens
- **State & Store:** Zustand (`useAppStore`), Axios interceptors
- **Real-Time Client:** Socket.io-client

### Backend (Node.js & Express REST API):
- **Runtime:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM (Multi-Tenant architecture)
- **Authentication:** JWT, HTTP-Only Cookies, Role-Based Access Control (RBAC)
- **Email & OTP Delivery:** Nodemailer (Gmail SMTP with branded HTML template + 10-minute expiry)
- **Real-Time Gateway:** Socket.io (Practice-isolated rooms: `practice_{id}`)

### Integrations:
- **Twilio SDK:** Two-way SMS transmission, inbound SMS webhook handler
- **OpenAI API:** Context-aware RAG response generation (GPT-4o / GPT-3.5) with smart zero-failure fallback engine

---

## 4. Two-Step Email OTP Authentication & RBAC

1. **Credential Validation:** User submits work email and password. Server verifies credentials, generates a 6-digit numerical OTP with a 10-minute expiry timestamp, and persists it.
2. **Email Dispatch:** Nodemailer dispatches a branded HTML email via Gmail SMTP containing the verification code.
3. **Verification:** User inputs code on `/verify-otp`. Server validates code and issues an Access Token (7-day validity) and HTTP-Only cookie.
4. **Role Enforcement:**
   - `SUPER_ADMIN`: Monitors multi-tenant portfolio, platform MRR, and practice metrics.
   - `PRACTICE_ADMIN`: Clinic owner/managing doctor; manages staff, hygiene chairs, campaigns, and monthly billing statements.
   - `STAFF_USER`: Hygiene coordinator/receptionist; manages patient SMS inbox and manual scheduling.

---

## 5. Project Directory Structure

```text
Dental-A/
├── backend/
│   ├── config/
│   │   ├── config.js               # Environment configuration & pricing constants
│   │   ├── db.js                   # Mongoose connection
│   │   └── nodemailer.js           # Gmail SMTP transporter & dev simulator
│   ├── controllers/
│   │   ├── auth.controller.js      # Register, login, 6-digit OTP email verification
│   │   ├── patient.controller.js   # Overdue patient registry, bulk PMS import, recall triggers
│   │   ├── appointment.controller.js # Chair bookings, status updates, $20 commission tally
│   │   ├── conversation.controller.js # Two-way SMS inbox, auto-pilot toggle, patient simulator
│   │   ├── billing.controller.js   # Dual-tier $600 + $20 billing aggregation & invoices
│   │   ├── webhook.controller.js   # Inbound Twilio SMS webhook & AI auto-booking
│   │   ├── tenant.controller.js    # Practice profiles, hygienist roster, prompt tuning
│   │   └── analytics.controller.js # Clinical KPIs, ROI multipliers, recall cadence funnel
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT & HTTP-Only cookie verification
│   │   ├── role.middleware.js      # RBAC middleware (SUPER_ADMIN, PRACTICE_ADMIN, STAFF_USER)
│   │   └── errorHandler.middleware.js # Centralized JSON error handler
│   ├── models/
│   │   ├── User.js                 # Name, email, passwordHash, role, OTP, practiceId
│   │   ├── Tenant.js               # Practice profile, subscription, hygienists, AI prompt
│   │   ├── Patient.js              # Name, phone, lastHygieneDate, overdueMonths, insurance
│   │   ├── Appointment.js          # Chair date, hygienist, status, $20 commissionBilled
│   │   ├── Conversation.js         # Thread state, autoPilot toggle, last message preview
│   │   ├── Message.js              # Patient / AI / Staff messages, twilioSid, timestamps
│   │   └── Billing.js              # Monthly invoices, $600 base, $20/chair line items, status
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── patient.routes.js
│   │   ├── appointment.routes.js
│   │   ├── conversation.routes.js
│   │   ├── billing.routes.js
│   │   ├── tenant.routes.js
│   │   ├── analytics.routes.js
│   │   └── webhook.routes.js
│   ├── services/
│   │   ├── email.service.js        # Branded HTML OTP email generator
│   │   ├── twilio.service.js       # Outbound SMS & fallback simulator
│   │   └── openai.service.js       # Context-aware RAG prompt & intent classifier
│   ├── utils/
│   │   └── seed.js                 # Full realistic dental clinic database seed
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      # Login with one-click demo credentials autofill
│   │   │   ├── register/page.tsx   # Practice onboarding
│   │   │   └── verify-otp/page.tsx # 6-digit OTP screen with countdown & dev chip
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Real-time WebSocket connection & navigation
│   │   │   ├── dashboard/page.tsx  # Executive clinical metrics & recall cadence funnel
│   │   │   ├── patients/page.tsx   # Overdue patient registry with PMS import & multi-select
│   │   │   ├── appointments/page.tsx # Confirmed chairs schedule & $20 fee tracking
│   │   │   ├── inbox/page.tsx      # Split-screen SMS chat + In-App Patient SMS Simulator
│   │   │   ├── campaigns/page.tsx  # 6-mo, 9-mo, 12-mo cadence rules & SMS templates
│   │   │   ├── billing/page.tsx    # $600 base + $20/chair breakdown & itemized statements
│   │   │   ├── settings/page.tsx   # Clinic profile, hygienist roster & AI brain tuning
│   │   │   └── admin/page.tsx      # Super admin multi-tenant practice portfolio
│   │   ├── page.tsx                # Clinical SaaS landing page with interactive ROI calculator
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── sidebar.tsx             # Clinical navigation with commercial plan status
│   │   ├── topbar.tsx              # Breadcrumbs, office phone & quick recall trigger
│   │   └── ui/                     # Button, Badge, Card, Modal design tokens
│   ├── lib/
│   │   ├── api.ts                  # Axios client & typed endpoints
│   │   ├── socket.ts               # Socket.io client wrapper
│   │   ├── store.ts                # Zustand global state
│   │   └── utils.ts                # Currency, phone, date, and time formatters
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── render.yaml                     # Render deployment configuration for Backend
├── .gitignore
└── README.md
```

---

## 6. Pre-Seeded Demo Accounts

Run `npm run seed` in the `backend/` directory to generate these pre-configured accounts:

| Role | Email | Password | Practice |
|---|---|---|---|
| **Practice Owner** | `dr.chen@brightsmiledental.com` | `Password123!` | BrightSmile Dental Care |
| **Hygiene Coordinator** | `emily@brightsmiledental.com` | `Password123!` | BrightSmile Dental Care |
| **Super Admin** | `admin@dentagent.ai` | `Password123!` | Platform Owner View |

> **Development Sandbox Note:** During local testing, the 6-digit OTP code is logged directly to the backend terminal and rendered as a convenient **"Dev Sandbox OTP"** chip on the `/verify-otp` screen for instant one-click login without needing to check an external email inbox.

---

## 7. Step-by-Step Local Setup

### Prerequisites
- Node.js v18+ (tested on v22.13.1)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017/dentagent` (or MongoDB Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run seed     # Seeds realistic practice, patients, appointments, and billing data
npm run dev      # Starts Express + Socket.io server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Next.js App Router on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

---

## 8. Deployment Triggers (Render & Vercel)

### Backend Deployment (Render):
1. Create a **New Web Service** on [Render](https://render.com).
2. Connect the GitHub repository `https://github.com/Anshika-13301/Dental-A.git`.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node server.js`.
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: *Your MongoDB Atlas connection URI*
   - `CLIENT_URL`: *Your Vercel frontend URL (e.g., https://dentagent-ai.vercel.app)*
   - `JWT_SECRET`: *Random 64-char string*
   - `SMTP_USER` & `SMTP_PASS`: *Gmail App Password credentials*
   - `OPENAI_API_KEY`: *OpenAI API key (optional, fallback active)*
   - `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN`: *Twilio credentials (optional, fallback active)*

### Frontend Deployment (Vercel):
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset will automatically detect **Next.js**.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: *Your Render backend URL (e.g., https://dentagent-api.onrender.com)*
   - `NEXT_PUBLIC_SOCKET_URL`: *Your Render backend URL*
5. Click **Deploy**. Vercel will build and assign your live production URL.

---

## 9. Twilio Webhook Setup (Production Two-Way SMS)

In the Twilio Console under **Phone Numbers > Active Numbers > Messaging**:
- **A MESSAGE COMES IN:** Select `Webhook` (HTTP POST)
- **URL:** `https://your-backend-api.onrender.com/api/webhooks/twilio/inbound-sms`

When a patient texts your Twilio number:
1. Webhook routes to `webhook.controller.js`.
2. Matches patient in MongoDB.
3. Triggers OpenAI RAG response.
4. Auto-confirms hygiene appointments and notifies the front desk via Socket.io in real-time!
