# ICU Share – A Multi-Hospital ICU Bed Resource Coordination and Booking Platform

> **Full-Stack Academic Prototype (S5 Mini Project)**  
> *"ICU Share is a full-stack web-based ICU resource coordination platform that allows users to search hospitals with ICU availability and submit booking requests, while hospitals can manage ICU beds and respond to requests through a dedicated hospital portal."*

---

## 1. Project Purpose & Core Architecture

During critical medical emergencies, locating an available ICU bed with required facilities (such as Ventilators, Cardiac ICU, ECMO, Trauma ICU, Pediatric ICU, or Isolation) is challenging. 

**ICU Share** addresses this by providing a unified web platform with two dedicated portals:
1. **User Portal**: Allows patients and attendants to search hospitals with ICU availability, inspect facility options, and submit structured ICU booking requests.
2. **Hospital Portal**: Allows hospital administrators to manage their ICU bed inventory (Available, Occupied, Reserved, Maintenance) and respond to incoming booking requests with Accept or Reject actions.

### Core Central Workflow

```
USER
  ↓
Search Hospitals
  ↓
View ICU Availability
  ↓
Select Hospital
  ↓
Submit ICU Booking Request (PENDING)
  ↓
Hospital Receives Request
  ↓
Hospital Decision:
  ├── ACCEPT ──► Bed RESERVED + Booking CONFIRMED + User Notification + Demo Route Estimate
  └── REJECT ──► Booking REJECTED + User Notification + Rule-Based Alternative Recommendations
                    ↓
                 User Manually Selects Another Hospital
                    ↓
                 New Booking Request Submitted
```

---

## 2. Technology Stack

### Backend Stack
- **Language**: Python 3.11+
- **Framework**: FastAPI (High-performance asynchronous REST API)
- **ASGI Server**: Uvicorn
- **ORM & Database**: SQLAlchemy 2.0 with default local SQLite runtime (`backend/icushare.db`, configured via `DATABASE_URL=sqlite:///./icushare.db` in `backend/.env`) and PostgreSQL driver (`psycopg2-binary`) support when `DATABASE_URL` is set
- **Data Validation**: Pydantic v2 & Pydantic-Settings
- **Authentication**: JWT Access Tokens (HS256) & Passlib PBKDF2/Bcrypt password hashing
- **Testing**: Pytest with HTTP TestClient (16 passing integration tests, 0 warnings)
- **Interactive Documentation**: Swagger UI (`/docs`) and ReDoc (`/redoc`)

### Frontend Stack
- **Library**: React 18
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Tailored Design System with Dark/Light Theme and responsive cards)
- **State Management & Services**: Centralized API Services (`src/services/`) and React Context store (`src/store/icuStore.jsx`) with hybrid synchronization: real-time WebSocket event stream (`/api/ws`), resilient 4s backup HTTP polling, and cross-tab `localStorage` event sync

---

## 3. Database Schema

The database consists of relational tables:

1. **`users`**: `id`, `name`, `mobile`, `email`, `password_hash`, `role` (`USER`), `designation`, `created_at`
2. **`hospitals`**: `id`, `name`, `city`, `area`, `address`, `type` (`Government`/`Private`), `latitude`, `longitude`, `phone`, `emergency_contact`, `doctor_in_charge`, `registration_id`, `email`, `password_hash`, `total_beds`, `created_at`
3. **`hospital_facilities`**: `id`, `hospital_id`, `facility_name`
4. **`icu_beds`**: `id`, `hospital_id`, `bed_number`, `bed_type`, `ward`, `status` (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`), `expected_release_at`, `note`
5. **`bookings`**: `id` (`ICU-REQ-XXXX`), `user_id`, `hospital_id`, `patient_name`, `patient_mobile`, `severity` (`Critical`, `High`, `Moderate`, `Stable`), `beds_required`, `current_location`, `status` (`PENDING`, `ACCEPTED`, `CONFIRMED`, `REJECTED`, `CANCELLED`), `assigned_bed_id`, `rejection_reason`, `created_at`, `updated_at`
6. **`booking_facilities`**: `id`, `booking_id`, `facility_name`
7. **`notifications`**: `id`, `user_id`, `hospital_id`, `booking_id`, `title`, `message`, `type`, `is_read`, `created_at`

> **Bed Count Consistency Rule**: Dashboard counts (`total`, `available`, `occupied`, `reserved`, `maintenance`) are computed dynamically from actual `icu_beds` database records (`total = len(beds)`), ensuring absolute consistency.

---

## 4. REST API Structure

### Authentication
- `POST /api/auth/user/register` — Register user / attendant
- `POST /api/auth/user/login` — Authenticate user (returns JWT with `role: "USER"`)
- `POST /api/auth/hospital/register` — Register hospital institution
- `POST /api/auth/hospital/login` — Authenticate hospital (returns JWT with `role: "HOSPITAL"`, `hospital_id`)
- `GET /api/auth/me` — Get current authenticated actor profile

### Hospitals
- `GET /api/hospitals` — Search hospitals (by location, type, facility) with computed bed counts
- `GET /api/hospitals/{id}` — Get detailed hospital profile and live bed counts
- `GET /api/hospitals/recommendations` — Rule-based alternative hospital recommendations

### Hospital Dashboard & Bed Management
- `GET /api/hospital/dashboard` — Hospital dashboard statistics computed from database
- `GET /api/hospital/beds` — List ICU beds for authenticated hospital
- `PATCH /api/hospital/beds/{id}` — Update bed status (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`)
- `POST /api/hospital/beds` — Add a new ICU bed for authenticated hospital

### Bookings
- `POST /api/bookings` — Create ICU booking request (Generates `ICU-REQ-XXXX`, initial status `PENDING`)
- `GET /api/bookings` — List all bookings (coordination matrix view)
- `GET /api/bookings/{id}` — Get single booking details
- `GET /api/user/bookings` — Get bookings for the authenticated user
- `GET /api/hospital/bookings` — Get incoming booking requests for the authenticated hospital
- `POST /api/bookings/{id}/accept` — Accept booking & reserve available ICU bed (`PENDING` $\rightarrow$ `CONFIRMED`)
- `POST /api/bookings/{id}/reject` — Reject booking with reason (`PENDING` $\rightarrow$ `REJECTED`)
- `DELETE /api/bookings/{id}` — Cancel booking

### Notifications
- `GET /api/notifications` — List notifications for user or hospital
- `PATCH /api/notifications/{id}/read` — Mark notification as read
- `POST /api/notifications/mark-all-read` — Mark all notifications as read
- `DELETE /api/notifications` — Clear notifications

### Facilities
- `GET /api/facilities` — List available facility categories

### Real-Time & System
- `WebSocket /api/ws` — Real-time database event stream for live portal sync
- `GET /api/realtime/status` — Active WebSocket connection count and protocol health
- `GET /api/system/status` — System health, database connection, and hospital count
- `POST /api/system/reset-db` — Reset database to initial seed state
- `GET /health` (or `GET /api/health`) — Service health check

---

## 5. Security & Authorization Rules

- **Strict JWT Token Verification**: Hospital identification is derived strictly from verified Bearer JWT claims (`hospital_id`), not from request headers (`x-hospital-id` bypass removed).
- **Tenant Isolation**: A hospital cannot access, view, or modify beds or bookings belonging to another hospital (HTTP 403 Forbidden).
- **Double-Booking Prevention**: When a bed is reserved, its status changes to `RESERVED`. The backend prevents assigning occupied, maintenance, or already-reserved beds.
- **Workflow State Locks**: A booking cannot be accepted twice or accepted after being rejected (HTTP 400 Bad Request).

---

## 6. Rule-Based Hospital Recommendation

When a booking is rejected, the system provides candidate hospitals using an explicit **rule-based multi-criteria suitability scoring formula**:

$$S = w_1 \cdot A + w_2 \cdot F + w_3 \cdot D + w_4 \cdot T$$

Where:
- $A$ (Availability): Scaled available ICU bed capacity ($w_1 = 0.40$)
- $F$ (Facility Match): Proportion of required facilities supported ($w_2 = 0.30$)
- $D$ (Distance Proximity): Normalized inverse transit distance ($w_3 = 0.20$)
- $T$ (Hospital Type): Institutional type factor ($w_4 = 0.10$)

*Note*: The platform never automatically transfers or books. The user explicitly reviews recommendations and manually clicks to book.

---

## 7. Demo Credentials

### User / Attendant Account
- **Portal**: `http://localhost:5173/user/login` (Or click *"One-Click Demo Login"*)
- **Email**: `user@icushare.org` (or `dispatcher14@tamilnadu-ems.gov.in`)
- **Password**: `UserPass123!` (or `DemoPass123!`)
- **Role**: `Patient Attendant / User`

### Hospital Institutional Accounts
- **Portal**: `http://localhost:5173/hospital/login` (Or click any hospital in the quick selector)

| Hospital Name | Registration ID | Password | Seeded ICU Beds |
| :--- | :--- | :--- | :--- |
| **Apollo City Hospital** | `TN-CMC-APOLLO-9021` | `HospitalPass123!` | 8 beds *(10 in active db)* |
| **Green Valley Medical** | `TN-CMC-GV-1100` | `HospitalPass123!` | 4 beds |
| **Government General Hospital** | `TN-CMC-GH-003` | `HospitalPass123!` | 5 beds |
| **Kovai Medical Center (KMCH)** | `TN-CMC-KM-4000` | `HospitalPass123!` | 3 beds |
| **Coimbatore Medical College** | `TN-CMC-CMCH-5000` | `HospitalPass123!` | 3 beds |
| **Ganga Trauma Care** | `TN-CMC-GANGA-6000` | `HospitalPass123!` | 3 beds |

> **Inventory Note**: `seed.py` defines exactly 26 initial beds across the 6 hospitals (all initialized to `AVAILABLE`). The pre-populated SQLite database file on disk currently contains 28 beds (reflecting 2 additional beds added during test suite executions).

---

## 8. Exact Commands to Run the Project

### 1. Unified Full-Stack Run (Recommended)
Runs the entire merged application (Frontend SPA, Backend REST APIs, SQLite Database, and Real-Time WebSockets) in ONE single server:

```bash
# In the project root directory:
python run.py
```
Or with npm:
```bash
npm start
```
- **Unified Web Application**: `http://127.0.0.1:8000/` (User & Hospital portals fully merged)
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Real-Time WebSocket Stream**: `ws://127.0.0.1:8000/api/ws`
- **Database Engine**: Relational SQLite (`backend/icushare.db`)

---

### 2. Development Mode (Optional)
If running Vite with hot-module-reloading alongside the backend:

```bash
# Terminal 1: Backend API + WebSockets
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Frontend Vite Dev Server
npm run dev -- --host 127.0.0.1 --port 5173
```
- Vite automatically proxies `/api` and WebSocket `/api/ws` to `http://127.0.0.1:8000`.

### 3. Run Backend Automated Tests

```bash
pytest backend/tests -p no:cacheprovider
```

### 4. Build Frontend for Production

```bash
npm run build
```

---

## 9. Verification & Test Results

- **Backend Pytest Suite**: 16 / 16 tests passed in 20.47s (0 warnings, 0 errors).
- **Frontend Production Build**: Vite compiled 1,618 modules in 9.55s with 0 errors (`dist/index.html` 0.94 kB, `dist/assets/index-CYfVOJrp.css` 5.32 kB, `dist/assets/index-JqptuoSF.js` 382.50 kB).
- **End-to-End Scenarios**: Executed and verified via `scratch/run_scenarios.py`:
  - **Scenario 1**: User booking submitted $\rightarrow$ Hospital accepted and allocated bed `ICU-104` $\rightarrow$ Bed became `RESERVED` $\rightarrow$ Booking became `CONFIRMED` $\rightarrow$ User received notification.
  - **Scenario 2**: User booking submitted $\rightarrow$ Hospital rejected with reason $\rightarrow$ User notified $\rightarrow$ Rule-based recommendations generated $\rightarrow$ User manually selected alternative hospital $\rightarrow$ Second hospital received booking request.

---

## 10. Academic Project Disclaimer

> [!NOTE]
> **Academic Prototype Notice**: ICU Share is a full-stack academic prototype developed for the S5 Mini Project.
> - Bed availability, patient profiles, and hospital registries are simulated demonstration data seeded in a relational database.
> - The route navigation feature provides a "Demo Route Estimate" for demonstration purposes without claiming live GPS navigation or clinical decision-making.
