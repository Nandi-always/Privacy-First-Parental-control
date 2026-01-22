# Privacy-First Parental Control - Tech Stack & Methodology

## 🛠️ TOOLS & TECHNOLOGIES USED

### **Backend Stack**

#### Core Framework
- **Node.js** - Runtime environment for server-side JavaScript
- **Express.js (^4.18.2)** - Web framework for REST APIs and HTTP routing
- **Mongoose (^7.5.0)** - MongoDB object modeling and validation

#### Database
- **MongoDB** - NoSQL database for storing all application data
  - Collections: Users, Children, AppRules, ScreenTime, Location, EmergencyAlerts, etc.
  - 9 main data models/collections

#### Security & Authentication
- **JWT (jsonwebtoken ^9.0.2)** - Token-based authentication
- **bcryptjs (^2.4.3)** - Password hashing and encryption
- **dotenv (^16.1.4)** - Environment variables management
- **CORS (^2.8.5)** - Cross-Origin Resource Sharing for API security

#### Development Tools
- **nodemon (^3.1.11)** - Auto-restart server during development

#### Server Communication
- **Socket.io** (configured) - WebSocket for real-time alerts and notifications

---

### **Frontend Stack**

#### Core Framework
- **React (^18.2.0)** - UI library for building interactive web interfaces
- **React Router DOM (^6.8.0)** - Client-side routing for multi-page navigation
- **React-DOM (^18.2.0)** - Rendering React components to DOM

#### Data & API Management
- **Axios (^1.3.0)** - HTTP client for API requests with interceptors
- **React Context API** - Global state management (Auth, Notifications)

#### UI & Visualization
- **Chart.js (^4.2.0)** - Data visualization library
- **react-chartjs-2 (^5.2.0)** - React wrapper for Chart.js
- **Lucide React (^0.263.1)** - Icon library
- **CSS3** - Styling with responsive design

#### Utilities
- **date-fns (^2.29.0)** - Date manipulation and formatting

#### Build & Development
- **react-scripts (^5.0.1)** - Create React App build tools
- **Webpack** (implicit) - Module bundler
- **Babel** (implicit) - JavaScript transpiler

#### Testing
- **@testing-library/react (^13.4.0)** - React component testing

---

## 🏗️ SYSTEM ARCHITECTURE & METHODOLOGY

### **Architecture Overview**

```
┌─────────────────────────────────────────────────┐
│          FRONTEND (React - Port 3000)            │
│  ┌─────────────────────────────────────────┐   │
│  │ Parent Dashboard │ Child Dashboard      │   │
│  │ Auth System      │ Real-time Updates    │   │
│  └─────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │ REST API + WebSocket
                       │ (Port 5001)
┌──────────────────────▼──────────────────────────┐
│     BACKEND (Node.js/Express - Port 5001)      │
│  ┌─────────────────────────────────────────┐   │
│  │ 31 REST Endpoints                       │   │
│  │ • Auth (2 endpoints)                    │   │
│  │ • Child Management (6 endpoints)        │   │
│  │ • Rules (4 endpoints)                   │   │
│  │ • Screen Time (5 endpoints)             │   │
│  │ • Location (4 endpoints)                │   │
│  │ • Emergency SOS (3 endpoints)           │   │
│  │ • App Downloads (3 endpoints)           │   │
│  │ • Reports (4 endpoints)                 │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │ WebSocket Server (Real-time Events)     │   │
│  │ • SOS Alerts                            │   │
│  │ • Notifications                         │   │
│  └─────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │ Mongoose ODM
                       │
┌──────────────────────▼──────────────────────────┐
│    MONGODB (Port 27017)                         │
│  Collections:                                    │
│  • Users (Parents)                              │
│  • Children                                     │
│  • AppRules                                     │
│  • WebsiteRules                                 │
│  • ScreenTime                                   │
│  • Location                                     │
│  • EmergencyAlerts                              │
│  • AppDownloadAlerts                            │
│  • Notifications                                │
└─────────────────────────────────────────────────┘
```

---

## 🔄 APPLICATION WORKFLOW & METHODOLOGY

### **1. Authentication Flow**

**Process:**
```
Parent → Registration/Login → JWT Token Generation → Token Storage (localStorage)
    ↓
API Requests → Authorization Header (Bearer Token) → Backend Verification
    ↓
Token Expires → Auto Logout → User Redirected to Login
```

**Key Components:**
- `AuthContext.js` - Manages user state globally
- `authMiddleware.js` - Verifies JWT on protected routes
- `apiService.js` - Includes interceptors to add token to requests

---

### **2. Child Management & Device Association**

**Process:**
```
Parent Adds Child → Create Child Record → Device Info Stored
    ↓
Child Profile Includes:
    • Basic Info (name, age, device type)
    • Trust Mode (autonomous vs monitored)
    • Privacy Mode (co-agreement model)
    • App Categories (educational, games, social, etc.)
    • Daily Screen Time Limit
```

**Methodology:**
- Parent dashboard shows all associated children
- Each child is linked to specific device identifiers
- Rule enforcement is child-specific

---

### **3. Rule Enforcement System**

**Three-Layer Rule System:**

#### Layer 1: Category-Based Control
```
App Categories → Parent Sets Rules → Child App Usage Checked Against Rules
    ├─ Educational (allowed)
    ├─ Entertainment (time-limited)
    ├─ Games (blocked)
    ├─ Social (restricted hours)
    └─ Communication (monitored)
```

#### Layer 2: Individual App Rules
```
Specific App (e.g., TikTok) → Custom Time Slots → Allow/Block Schedule
    Example: "TikTok allowed 6-9 PM on weekdays only"
```

#### Layer 3: Website Rules
```
Website Filters → Safe Search Enforcement → Blocking Capability
    • Automatic category detection
    • Manual blocking
    • Safe search toggle
```

---

### **4. Screen Time Tracking & Monitoring**

**Methodology:**

```
Child Device Sends Usage Event → Backend Logs → Real-time Updates

Event Data:
{
  childId: "123",
  appName: "YouTube",
  duration: 30,  // minutes
  timestamp: "2026-01-22T10:30:00Z",
  category: "entertainment"
}

Backend Logic:
1. Validate child exists
2. Find or create today's ScreenTime document
3. Add app to daily log
4. Calculate total daily usage
5. Check against limits:
   - Per-app limit exceeded?
   - Category limit exceeded?
   - Daily limit exceeded?
6. If exceeded → Trigger notification
```

**Tracking Features:**
- Daily usage breakdown by app
- Category-wise usage
- Historical data (30+ days)
- Weekly/monthly trends
- Real-time usage alerts

---

### **5. Real-Time Alert System (WebSocket)**

**Socket Events:**

```
Parent → Child Event occurs → Backend processes → WebSocket broadcast

Events:
├─ SOS Alert
│  └─ Child location + emergency context
├─ Rule Changed
│  └─ Rule modification notification
├─ Limit Exceeded
│  └─ Screen time or category limit warnings
├─ App Download Alert
│  └─ New app installation notification
└─ Location Update
   └─ Current location coordinates
```

**Implementation:**
- Socket.io server in `sockets/index.js`
- Separate handlers: `emergencySocket.js`, `notificationSocket.js`
- Automatic reconnection on disconnect

---

### **6. Emergency SOS System**

**Flow:**

```
Child in Emergency → Sends SOS Alert with Location
    ↓
Backend Records:
    • SOS timestamp
    • Child location
    • GPS accuracy
    • Context/message
    ↓
WebSocket Broadcast → Real-time notification to parent
    ↓
Parent Dashboard Shows:
    • Emergency alert with map
    • Location coordinates
    • Time of alert
    • Acknowledgment button
    ↓
Parent Acknowledges → Alert status updated → Archive maintained
```

---

### **7. App Download Monitoring**

**Process:**

```
New App Installed on Child Device → Detection Event
    ↓
Backend Analysis:
    • Extract app info (name, category, publisher)
    • Auto-categorize (ML-ready)
    • Check against existing rules
    ↓
Decision Logic:
    IF app_category in blocked_categories → Auto-block
    ELSE IF app in restricted_list → Pending approval
    ELSE → Allowed (with notification)
    ↓
Notification States:
    ├─ Pending (awaiting parent approval)
    ├─ Allowed (parent approved)
    └─ Blocked (parent blocked)
```

---

### **8. Location Tracking & Geofencing**

**Data Model:**

```
Location Document:
{
  childId,
  latitude,
  longitude,
  timestamp,
  accuracy,
  address,
  placeName
}

History Retention: 30 days rolling window
```

**Features:**
- Current location retrieval
- Location history with timestamps
- Most visited places analysis
- Address geocoding (reverse)
- Accuracy tracking
- Geofence creation (ready for implementation)

---

### **9. Reports & Analytics**

**Report Types:**

```
1. Daily Activity Report
   ├─ Total screen time
   ├─ App usage breakdown
   ├─ New apps installed
   └─ Last known location

2. Weekly Summary
   ├─ Daily trends
   ├─ Most used apps
   └─ Category-wise usage

3. Monthly Insights
   ├─ Usage patterns
   ├─ Rule violation history
   └─ Emergency alerts
```

**Visualization:**
- Chart.js for graphs
- Category breakdown charts
- Time-series graphs for trends

---

## 🔐 Security & Privacy Methodology

### **Data Protection**

```
Parent Password
    ↓
bcryptjs Hash (salted)
    ↓
MongoDB Storage (encrypted at rest)
```

### **API Security**

```
1. JWT-based Authentication
   └─ Token expires after period
   └─ Refresh token mechanism ready

2. CORS Configuration
   └─ API accessible only from frontend domains
   └─ Credentials required for sensitive operations

3. Input Validation
   └─ Mongoose schema validation
   └─ Backend sanity checks
   └─ Type checking on all endpoints

4. Rate Limiting (ready)
   └─ Prevent brute force attacks
   └─ Prevent DDoS attacks
```

### **Privacy by Design**

```
1. Parental Consent Model
   └─ Mandatory privacy agreement
   └─ Co-agreement with child (privacy mode)

2. Data Minimization
   └─ Only necessary data collected
   └─ Location data rolling window (30 days max)
   └─ Automatic old data cleanup

3. Child Protection
   └─ Emergency SOS system
   └─ Location sharing transparency
   └─ Rule notification to child
```

---

## 📊 Data Flow Example: Setting App Limit

```
PARENT ACTION:
Parent clicks "Set Time Limit for YouTube" on dashboard

FRONTEND:
1. Open Modal
2. Collect: app name, daily limit (minutes), allowed time slots
3. Validate input
4. Send POST to /api/rules (with JWT token)
5. Show loading spinner

BACKEND:
1. Verify JWT token
2. Validate request data
3. Find child record
4. Create/Update AppRule document:
   {
     childId: "123",
     appName: "YouTube",
     action: "limit",
     timeLimit: 120,  // minutes
     allowedSlots: [
       { day: "Monday", startTime: "14:00", endTime: "16:00" },
       { day: "Friday", startTime: "18:00", endTime: "20:00" }
     ]
   }
5. Emit WebSocket event: "ruleChanged"
6. Return success response

CHILD DEVICE:
1. WebSocket event received: "ruleChanged"
2. Local app stores new rule
3. Child receives notification: "YouTube limit set to 2 hours daily"
4. Enforcement enforces new rule on next app usage

PARENT DASHBOARD:
1. Modal closes
2. Rule appears in rules list
3. Real-time update shows rule is active
```

---

## 🚀 Key Design Patterns Used

### **1. MVC (Model-View-Controller)**
- **Models:** MongoDB schemas (`models/`)
- **Controllers:** Business logic (`controllers/`)
- **Views:** React components (`src/components/`)
- **Routes:** API endpoints (`routes/`)

### **2. Context API for State Management**
- Global auth state across app
- Notification system
- User session management

### **3. Service Layer Pattern**
- `apiService.js` centralizes all API calls
- Interceptors for auth tokens
- Error handling

### **4. Middleware Pattern**
- Authentication middleware
- Request validation
- Error handling

### **5. Repository Pattern (implicit)**
- MongoDB collections as data repositories
- Mongoose for ORM

---

## 🔄 Request-Response Cycle

```
FRONTEND (React)
    ↓
[Component] → axios.post(URL, data)
    ↓
[Interceptor] → Adds Authorization header with JWT
    ↓
[HTTP Request] → Sends to backend
    ↓
BACKEND (Express)
    ↓
[Route Handler] → Receives request
    ↓
[Auth Middleware] → Verifies JWT token
    ↓
[Validation] → Schema validation
    ↓
[Controller] → Business logic
    ↓
[Mongoose] → Database query
    ↓
[MongoDB] → Data operation
    ↓
[Response] → Send result back
    ↓
[HTTP Response] → JSON payload
    ↓
FRONTEND (React)
    ↓
[Interceptor] → Check status code
    ↓
[Component] → Handle response/error
    ↓
[State Update] → Re-render if needed
    ↓
[User Sees Result] → Success/error message
```

---

## 📈 Scalability Considerations

### **Current Setup (Development)**
- Single Node.js server
- Local MongoDB
- Suitable for 100-1000 users

### **Future Scaling**
- Load balancer (NGINX/HAProxy)
- Multiple server instances (Docker)
- MongoDB sharding for data
- Redis for caching
- CDN for static assets
- Message queue (RabbitMQ) for background jobs

---

## ✅ Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React, Axios, Context | UI and user interaction |
| **Backend** | Express, Node.js | API and business logic |
| **Database** | MongoDB, Mongoose | Data persistence |
| **Real-time** | Socket.io | Live notifications |
| **Security** | JWT, bcryptjs | Authentication & encryption |
| **Visualization** | Chart.js | Data analytics |

This architecture provides a complete, privacy-focused parental control solution with real-time monitoring, rule enforcement, and comprehensive reporting.
