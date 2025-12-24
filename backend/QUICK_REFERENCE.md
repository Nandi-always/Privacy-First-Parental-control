# ⚡ QUICK REFERENCE CARD

## 🚀 Start Here

### 1. Start Server
```bash
npm start
```
Server runs on: `http://localhost:5000`

### 2. Test API
Open browser console (F12) and paste from `QUICK_TEST.js`

### 3. View Documentation
- **Complete Testing Guide:** `API_TESTING_GUIDE.md`
- **Feature Overview:** `IMPLEMENTATION_SUMMARY.md`
- **Architecture Diagrams:** `ARCHITECTURE.md`

---

## 📍 API Base URL
```
http://localhost:5000/api
```

---

## 🔑 Key Endpoints

### Authentication (2)
```
POST   /auth/register              Register parent
POST   /auth/login                 Login parent
```

### Child Management (6)
```
POST   /child/                     Create child
GET    /child/                     List children
GET    /child/:childId             Get child
PUT    /child/:childId             Update child
DELETE /child/:childId             Delete child
PUT    /child/:childId/categories  Update categories
```

### App Rules (4)
```
POST   /rules/:childId/rules       Create rule
GET    /rules/:childId/rules       Get rules
PUT    /rules/rules/:ruleId        Update rule
DELETE /rules/rules/:ruleId        Delete rule
```

### Screen Time (5)
```
POST   /screentime/:childId/log    Log usage
GET    /screentime/:childId/daily  Daily total
GET    /screentime/:childId/history Get history
POST   /screentime/:childId/pause  Pause internet
POST   /screentime/:childId/limit  Set limit
```

### Location (4)
```
POST   /location/:childId/update   Update location
GET    /location/:childId/live     Get live location
GET    /location/:childId/history  Get history
GET    /location/:childId/stats    Get top places
```

### Emergency (3)
```
POST   /emergency/:childId/sos          Send SOS
GET    /emergency/:childId/alerts       Get alerts
PUT    /emergency/:alertId/acknowledge  Acknowledge
```

### Downloads (3)
```
POST   /downloads/:childId/log     Log download
GET    /downloads/:childId/alerts  Get alerts
PUT    /downloads/:alertId/action  Approve/Block
```

### Reports (4)
```
GET    /reports/:childId/daily     Daily summary
GET    /reports/:childId/weekly    Weekly insights
GET    /reports/:childId/monthly   30-day report
GET    /reports/:childId/realtime  Real-time status
```

---

## 🔐 Authentication Header

All requests (except /auth/\*) need:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 📊 Total: 31 Endpoints

| Feature | Count |
|---------|-------|
| Auth | 2 |
| Child | 6 |
| Rules | 4 |
| Screen Time | 5 |
| Location | 4 |
| Emergency | 3 |
| Downloads | 3 |
| Reports | 4 |
| **TOTAL** | **31** |

---

## 🗂️ Database Collections (9)

1. `users` - Parents
2. `children` - Child profiles
3. `approles` - App restrictions
4. `websiterules` - Website filtering
5. `screentimes` - Daily usage
6. `locations` - GPS tracking
7. `emergencyalerts` - SOS alerts
8. `appdownloadalerts` - Download notifications
9. `notifications` - Rule change alerts

---

## 🧪 Quick Test Workflow

```javascript
// 1. Register
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John', email: 'john@example.com', password: 'Pass123'
  })
}).then(r => r.json()).then(d => {
  window.token = d.token;
  console.log('✅ Registered');
});

// 2. Create Child
fetch('http://localhost:5000/api/child/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({
    name: 'Emma', email: 'emma@example.com', age: 10
  })
}).then(r => r.json()).then(d => {
  window.childId = d.child._id;
  console.log('✅ Child created');
});

// 3. Log Usage
fetch(`http://localhost:5000/api/screentime/${window.childId}/log`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({
    appName: 'Instagram', timeSpent: 30, category: 'social'
  })
}).then(r => r.json()).then(d => console.log('✅ Usage logged'));

// 4. Get Report
fetch(`http://localhost:5000/api/reports/${window.childId}/realtime`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
}).then(r => r.json()).then(d => console.log('✅ Report:', d));
```

---

## 📝 Response Format

### Success
```json
{
  "message": "Action completed",
  "child": { "_id": "123...", "name": "Emma", ... },
  "data": { ... }
}
```

### Error
```json
{
  "message": "Error description",
  "error": "Additional details"
}
```

---

## ⚙️ Configuration (.env)

```
MONGO_URI=mongodb://localhost:27017/parental_control
JWT_SECRET=your_secret_key_here
PORT=5000
```

---

## 🎯 Common Tasks

### Register & Login
1. POST /auth/register
2. POST /auth/login
3. Save token from response

### Create Child Profile
1. POST /child/
2. Save childId from response
3. PUT /child/{childId}/categories to set rules

### Set App Rules
1. POST /rules/{childId}/rules
2. PUT /rules/rules/{ruleId} to modify
3. DELETE /rules/rules/{ruleId} to remove

### Track Usage
1. POST /screentime/{childId}/log (from mobile app)
2. GET /screentime/{childId}/daily (view today)
3. GET /screentime/{childId}/history (view past)

### Monitor Location
1. POST /location/{childId}/update (from mobile)
2. GET /location/{childId}/live (view now)
3. GET /location/{childId}/history (view past)

### Handle Emergency
1. POST /emergency/{childId}/sos (from child)
2. GET /emergency/{childId}/alerts (view)
3. PUT /emergency/{alertId}/acknowledge (resolve)

---

## 🔍 Query Parameters

| Endpoint | Parameter | Example |
|----------|-----------|---------|
| /screentime/{id}/daily | date | ?date=2025-12-23 |
| /screentime/{id}/history | days | ?days=7 |
| /location/{id}/history | days | ?days=30 |
| /downloads/{id}/alerts | status | ?status=pending |
| /reports/{id}/weekly | (none) | Direct GET |
| /reports/{id}/monthly | (none) | Direct GET |

---

## 💾 Sample Data

### Child Object
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Emma",
  "email": "emma@example.com",
  "age": 10,
  "parent": "65a1b2c3d4e5f6g7h8i9j0k1",
  "trustMode": true,
  "dailyScreenTimeLimit": 360,
  "appCategories": {
    "educational": { "allowed": true, "unrestricted": true },
    "entertainment": { "allowed": true, "timeLimit": 120 },
    "social": { "allowed": false }
  }
}
```

### ScreenTime Object
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "child": "65a1b2c3d4e5f6g7h8i9j0k1",
  "date": "2025-12-23",
  "totalTime": 245,
  "appUsage": [
    { "appName": "Instagram", "timeSpent": 60, "category": "social" },
    { "appName": "YouTube", "timeSpent": 120, "category": "entertainment" }
  ]
}
```

### Report Object
```json
{
  "isOnline": true,
  "currentScreenTime": 245,
  "currentApps": [
    { "appName": "Instagram", "timeSpent": 45 }
  ],
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Main St, New York"
  },
  "stats": {
    "totalTime": 245,
    "remainingTime": 115
  }
}
```

---

## 🚨 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid data |
| 403 | Forbidden - Unauthorized |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Something went wrong |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| API_TESTING_GUIDE.md | Complete endpoint documentation |
| QUICK_TEST.js | Browser console ready code |
| IMPLEMENTATION_SUMMARY.md | Feature overview |
| FILE_STRUCTURE.md | Project organization |
| ARCHITECTURE.md | System design diagrams |
| CHECKLIST.md | Completion status |
| BUILD_SUMMARY.md | Build overview |

---

## 🎓 First Steps

1. **Read:** BUILD_SUMMARY.md (what was built)
2. **Understand:** ARCHITECTURE.md (how it works)
3. **Reference:** API_TESTING_GUIDE.md (how to use)
4. **Test:** QUICK_TEST.js (test in console)
5. **Check:** CHECKLIST.md (verify completion)

---

## ✨ Features at a Glance

✅ Complete child CRUD
✅ Parent authentication
✅ App category restrictions
✅ Custom app rules with scheduling
✅ Screen time tracking & limits
✅ Internet pause/resume
✅ Location tracking (live + history)
✅ Emergency SOS with location
✅ App download notifications
✅ Daily/Weekly/Monthly reports
✅ Real-time activity status
✅ 31 API endpoints
✅ Production-ready error handling
✅ Complete documentation

---

## 🎯 Next Steps

1. **Test the API** - Use QUICK_TEST.js
2. **Build Frontend** - Create parent dashboard
3. **Build Mobile** - Create child device app
4. **Integrate Socket.io** - Real-time features
5. **Deploy** - Move to production

---

**Everything is ready to go! Happy coding! 🚀**
