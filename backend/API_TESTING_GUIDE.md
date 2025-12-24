# Parental Control API Testing Guide

## Base URL
```
http://localhost:5000/api
```

## 1. AUTHENTICATION

### Register Parent
```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'parent@example.com',
    password: 'Password123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Parent registered:', data);
  // Save token for later use
  localStorage.setItem('token', data.token);
});
```

### Login Parent
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'parent@example.com',
    password: 'Password123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Login successful:', data);
  localStorage.setItem('token', data.token);
});
```

---

## 2. CHILD MANAGEMENT

### Create Child
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/child/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Emma',
    email: 'emma@example.com',
    age: 10,
    deviceId: 'device123',
    deviceModel: 'iPhone 12',
    osVersion: '15.0'
  })
})
.then(res => res.json())
.then(data => console.log('Child created:', data));
```

### Get All Children
```javascript
fetch('http://localhost:5000/api/child/', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('All children:', data));
```

### Get Specific Child
```javascript
fetch('http://localhost:5000/api/child/CHILD_ID', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Child details:', data));
```

### Update Child
```javascript
fetch('http://localhost:5000/api/child/CHILD_ID', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    age: 11,
    trustMode: true,
    dailyScreenTimeLimit: 360
  })
})
.then(res => res.json())
.then(data => console.log('Child updated:', data));
```

### Delete Child
```javascript
fetch('http://localhost:5000/api/child/CHILD_ID', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Child deleted:', data));
```

### Update App Categories
```javascript
fetch('http://localhost:5000/api/child/CHILD_ID/categories', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    educational: true,
    entertainment: { allowed: true, timeLimit: 120 },
    social: false,
    games: { allowed: true, timeLimit: 90 },
    communication: true
  })
})
.then(res => res.json())
.then(data => console.log('Categories updated:', data));
```

---

## 3. APP RULES & RESTRICTIONS

### Create App Rule
```javascript
fetch('http://localhost:5000/api/rules/CHILD_ID/rules', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    appName: 'TikTok',
    appCategory: 'entertainment',
    isBlocked: false,
    timeLimit: 60, // minutes
    allowedTimeSlots: [
      { day: 'Monday', startTime: '16:00', endTime: '18:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '12:00' }
    ]
  })
})
.then(res => res.json())
.then(data => console.log('App rule created:', data));
```

### Get All App Rules for Child
```javascript
fetch('http://localhost:5000/api/rules/CHILD_ID/rules', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('App rules:', data));
```

### Update App Rule
```javascript
fetch('http://localhost:5000/api/rules/rules/RULE_ID', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    timeLimit: 45,
    isBlocked: true
  })
})
.then(res => res.json())
.then(data => console.log('App rule updated:', data));
```

### Delete App Rule
```javascript
fetch('http://localhost:5000/api/rules/rules/RULE_ID', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('App rule deleted:', data));
```

---

## 4. SCREEN TIME MONITORING

### Log App Usage
```javascript
fetch('http://localhost:5000/api/screentime/CHILD_ID/log', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    appName: 'Instagram',
    timeSpent: 30, // minutes
    category: 'social',
    date: '2025-12-23'
  })
})
.then(res => res.json())
.then(data => console.log('Usage logged:', data));
```

### Get Daily Screen Time
```javascript
fetch('http://localhost:5000/api/screentime/CHILD_ID/daily?date=2025-12-23', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Daily screen time:', data));
```

### Get Screen Time History (7 days)
```javascript
fetch('http://localhost:5000/api/screentime/CHILD_ID/history?days=7', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Screen time history:', data));
```

### Pause Internet Access
```javascript
fetch('http://localhost:5000/api/screentime/CHILD_ID/pause', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ isPaused: true })
})
.then(res => res.json())
.then(data => console.log('Internet paused:', data));
```

### Set Daily Screen Time Limit
```javascript
fetch('http://localhost:5000/api/screentime/CHILD_ID/limit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ limit: 240 }) // minutes
})
.then(res => res.json())
.then(data => console.log('Daily limit set:', data));
```

---

## 5. EMERGENCY & LOCATION

### Send Emergency SOS Alert
```javascript
fetch('http://localhost:5000/api/emergency/CHILD_ID/sos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    latitude: 40.7128,
    longitude: -74.0060,
    message: 'I need help!'
  })
})
.then(res => res.json())
.then(data => console.log('SOS sent:', data));
```

### Get Emergency Alerts
```javascript
fetch('http://localhost:5000/api/emergency/CHILD_ID/alerts', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Emergency alerts:', data));
```

### Acknowledge Emergency
```javascript
fetch('http://localhost:5000/api/emergency/ALERT_ID/acknowledge', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Alert acknowledged:', data));
```

---

## 6. LOCATION MONITORING

### Update Live Location
```javascript
fetch('http://localhost:5000/api/location/CHILD_ID/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    latitude: 40.7128,
    longitude: -74.0060,
    address: '123 Main St, New York, NY',
    accuracy: 15
  })
})
.then(res => res.json())
.then(data => console.log('Location updated:', data));
```

### Get Live Location
```javascript
fetch('http://localhost:5000/api/location/CHILD_ID/live', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Live location:', data));
```

### Get Location History (30 days)
```javascript
fetch('http://localhost:5000/api/location/CHILD_ID/history?days=30', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Location history:', data));
```

### Get Location Statistics
```javascript
fetch('http://localhost:5000/api/location/CHILD_ID/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Most visited places:', data));
```

---

## 7. APP DOWNLOAD ALERTS

### Log App Download
```javascript
fetch('http://localhost:5000/api/downloads/CHILD_ID/log', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    appName: 'Snapchat',
    appPackage: 'com.snapchat.android',
    appCategory: 'social'
  })
})
.then(res => res.json())
.then(data => console.log('Download logged:', data));
```

### Get Download Alerts
```javascript
// All pending alerts
fetch('http://localhost:5000/api/downloads/CHILD_ID/alerts?status=pending', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Pending downloads:', data));

// Blocked apps
fetch('http://localhost:5000/api/downloads/CHILD_ID/alerts?status=blocked', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Blocked apps:', data));
```

### Approve or Block App
```javascript
fetch('http://localhost:5000/api/downloads/ALERT_ID/action', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ action: 'allow' }) // or 'block'
})
.then(res => res.json())
.then(data => console.log('Action applied:', data));
```

---

## 8. REPORTS & INSIGHTS

### Daily Activity Summary
```javascript
fetch('http://localhost:5000/api/reports/CHILD_ID/daily?date=2025-12-23', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Daily summary:', data));
```

### Weekly Usage Insights
```javascript
fetch('http://localhost:5000/api/reports/CHILD_ID/weekly', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Weekly insights:', data));
```

### 30-Day Activity Report
```javascript
fetch('http://localhost:5000/api/reports/CHILD_ID/monthly', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('30-day report:', data));
```

### Real-Time Activity Status
```javascript
fetch('http://localhost:5000/api/reports/CHILD_ID/realtime', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Real-time status:', data));
```

---

## Testing Workflow

1. **Register & Login** - Get auth token
2. **Create Child** - Add a child profile
3. **Set Categories** - Configure app restrictions
4. **Create Rules** - Add specific app rules
5. **Log Usage** - Simulate app usage throughout day
6. **Update Location** - Send location updates
7. **Send Download Alert** - Log app downloads
8. **View Reports** - Check daily/weekly/monthly reports
9. **Emergency Test** - Send SOS alert
10. **Check Realtime** - View live status

## Notes
- Always include `Authorization: Bearer {token}` in headers
- Replace `CHILD_ID`, `RULE_ID`, `ALERT_ID` with actual IDs from responses
- Dates should be in format YYYY-MM-DD or ISO format
- Times in HH:MM format (24-hour)
- Screen time in minutes
- All responses are JSON
