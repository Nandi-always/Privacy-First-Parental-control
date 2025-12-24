// QUICK TESTING IN BROWSER CONSOLE
// Copy & paste these in your Chrome DevTools Console

// ===== STEP 1: REGISTER PARENT =====
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
  console.log('✅ REGISTERED:', data);
  window.token = data.token;
  localStorage.setItem('token', data.token);
});

// ===== STEP 2: LOGIN (if already registered) =====
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
  console.log('✅ LOGGED IN:', data);
  window.token = data.token;
  localStorage.setItem('token', data.token);
});

// ===== STEP 3: GET TOKEN FROM STORAGE =====
window.token = localStorage.getItem('token');
console.log('Token:', window.token);

// ===== STEP 4: CREATE CHILD =====
const childData = {
  name: 'Emma',
  email: 'emma@example.com',
  age: 10,
  deviceId: 'device123',
  deviceModel: 'iPhone 12',
  osVersion: '15.0'
};

fetch('http://localhost:5000/api/child/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify(childData)
})
.then(res => res.json())
.then(data => {
  console.log('✅ CHILD CREATED:', data);
  window.childId = data.child._id;
  localStorage.setItem('childId', data.child._id);
});

// ===== STEP 5: GET ALL CHILDREN =====
fetch('http://localhost:5000/api/child/', {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => {
  console.log('✅ ALL CHILDREN:', data);
  if (data[0]) window.childId = data[0]._id;
});

// ===== STEP 6: UPDATE CHILD (ADD RESTRICTIONS) =====
window.childId = localStorage.getItem('childId') || window.childId;

fetch(`http://localhost:5000/api/child/${window.childId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({
    age: 11,
    trustMode: true,
    privacyMode: false,
    dailyScreenTimeLimit: 360
  })
})
.then(res => res.json())
.then(data => console.log('✅ CHILD UPDATED:', data));

// ===== STEP 7: UPDATE APP CATEGORIES =====
fetch(`http://localhost:5000/api/child/${window.childId}/categories`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({
    educational: { allowed: true, unrestricted: true },
    entertainment: { allowed: true, timeLimit: 120 },
    social: { allowed: false },
    games: { allowed: true, timeLimit: 90 },
    communication: { allowed: true }
  })
})
.then(res => res.json())
.then(data => console.log('✅ CATEGORIES UPDATED:', data));

// ===== STEP 8: CREATE APP RULE =====
fetch(`http://localhost:5000/api/rules/${window.childId}/rules`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({
    appName: 'TikTok',
    appCategory: 'entertainment',
    isBlocked: false,
    timeLimit: 60,
    allowedTimeSlots: [
      { day: 'Monday', startTime: '16:00', endTime: '18:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '12:00' }
    ]
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ APP RULE CREATED:', data);
  window.ruleId = data.appRule._id;
});

// ===== STEP 9: GET APP RULES FOR CHILD =====
fetch(`http://localhost:5000/api/rules/${window.childId}/rules`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ APP RULES:', data));

// ===== STEP 10: LOG APP USAGE =====
fetch(`http://localhost:5000/api/screentime/${window.childId}/log`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({
    appName: 'Instagram',
    timeSpent: 30,
    category: 'social',
    date: new Date().toISOString().split('T')[0]
  })
})
.then(res => res.json())
.then(data => console.log('✅ USAGE LOGGED:', data));

// ===== STEP 11: GET DAILY SCREEN TIME =====
fetch(`http://localhost:5000/api/screentime/${window.childId}/daily`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ DAILY SCREEN TIME:', data));

// ===== STEP 12: SET DAILY LIMIT =====
fetch(`http://localhost:5000/api/screentime/${window.childId}/limit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({ limit: 240 })
})
.then(res => res.json())
.then(data => console.log('✅ DAILY LIMIT SET:', data));

// ===== STEP 13: PAUSE INTERNET =====
fetch(`http://localhost:5000/api/screentime/${window.childId}/pause`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({ isPaused: true })
})
.then(res => res.json())
.then(data => console.log('✅ INTERNET PAUSED:', data));

// ===== STEP 14: UPDATE LOCATION =====
fetch(`http://localhost:5000/api/location/${window.childId}/update`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({
    latitude: 40.7128,
    longitude: -74.0060,
    address: '123 Main St, New York, NY',
    accuracy: 15
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ LOCATION UPDATED:', data);
  window.locationId = data.location._id;
});

// ===== STEP 15: GET LIVE LOCATION =====
fetch(`http://localhost:5000/api/location/${window.childId}/live`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ LIVE LOCATION:', data));

// ===== STEP 16: GET LOCATION HISTORY =====
fetch(`http://localhost:5000/api/location/${window.childId}/history?days=7`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ LOCATION HISTORY:', data));

// ===== STEP 17: LOG APP DOWNLOAD =====
fetch(`http://localhost:5000/api/downloads/${window.childId}/log`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({
    appName: 'Snapchat',
    appPackage: 'com.snapchat.android',
    appCategory: 'social'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ DOWNLOAD LOGGED:', data);
  window.downloadId = data.alert._id;
});

// ===== STEP 18: GET DOWNLOAD ALERTS =====
fetch(`http://localhost:5000/api/downloads/${window.childId}/alerts`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ DOWNLOAD ALERTS:', data));

// ===== STEP 19: APPROVE/BLOCK APP =====
window.downloadId = window.downloadId || 'ALERT_ID';
fetch(`http://localhost:5000/api/downloads/${window.downloadId}/action`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({ action: 'allow' })
})
.then(res => res.json())
.then(data => console.log('✅ ACTION APPLIED:', data));

// ===== STEP 20: SEND EMERGENCY SOS =====
fetch(`http://localhost:5000/api/emergency/${window.childId}/sos`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.token}`
  },
  body: JSON.stringify({
    latitude: 40.7128,
    longitude: -74.0060,
    message: 'I need help!'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ SOS SENT:', data);
  window.alertId = data.alert._id;
});

// ===== STEP 21: GET EMERGENCY ALERTS =====
fetch(`http://localhost:5000/api/emergency/${window.childId}/alerts`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ EMERGENCY ALERTS:', data));

// ===== STEP 22: ACKNOWLEDGE EMERGENCY =====
window.alertId = window.alertId || 'ALERT_ID';
fetch(`http://localhost:5000/api/emergency/${window.alertId}/acknowledge`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ ALERT ACKNOWLEDGED:', data));

// ===== STEP 23: GET DAILY ACTIVITY REPORT =====
fetch(`http://localhost:5000/api/reports/${window.childId}/daily`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ DAILY REPORT:', data));

// ===== STEP 24: GET WEEKLY INSIGHTS =====
fetch(`http://localhost:5000/api/reports/${window.childId}/weekly`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ WEEKLY INSIGHTS:', data));

// ===== STEP 25: GET 30-DAY REPORT =====
fetch(`http://localhost:5000/api/reports/${window.childId}/monthly`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ 30-DAY REPORT:', data));

// ===== STEP 26: GET REAL-TIME STATUS =====
fetch(`http://localhost:5000/api/reports/${window.childId}/realtime`, {
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ REAL-TIME STATUS:', data));

// ===== HELPER: DELETE CHILD =====
fetch(`http://localhost:5000/api/child/${window.childId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${window.token}` }
})
.then(res => res.json())
.then(data => console.log('✅ CHILD DELETED:', data));

// ===== VIEW ALL STORED IDs =====
console.log({
  token: window.token,
  childId: window.childId,
  ruleId: window.ruleId,
  locationId: window.locationId,
  downloadId: window.downloadId,
  alertId: window.alertId
});
