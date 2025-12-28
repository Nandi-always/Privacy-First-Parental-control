# Integration Testing & Verification Guide

## 🚀 Current Status (December 28, 2025)

### Servers Running ✅
- **Frontend**: http://localhost:3001 ✅
- **Backend**: http://localhost:5000 ✅
- **MongoDB**: Connected ✅

---

## 🧪 INTEGRATION TESTING CHECKLIST

### Phase 1: Basic Connectivity Tests

#### Test 1.1: Backend API Health Check
```bash
# In PowerShell or curl:
curl http://localhost:5000

# Expected Response:
# "Parental Control Backend Running"
```

#### Test 1.2: Frontend Loads Successfully
1. Open http://localhost:3001 in browser
2. **Expected**: Login page loads without errors
3. **Check**: DevTools Console (F12) - no critical errors

#### Test 1.3: CORS Configuration
1. Frontend should be able to communicate with backend
2. Check Network tab in DevTools for CORS headers
3. **Expected**: `Access-Control-Allow-Origin: http://localhost:3001`

---

### Phase 2: Authentication Tests

#### Test 2.1: User Registration
**Steps:**
1. Open http://localhost:3001
2. Click "Register" tab
3. Fill in form:
   - Email: `testparent@example.com`
   - Password: `Test123!`
   - Role: Parent
4. Click "Create Account"

**Expected Results:**
- ✅ No errors in console
- ✅ Success notification appears
- ✅ Redirect to parent dashboard
- ✅ User data saved in localStorage

**Verification:**
- Open DevTools → Application → localStorage
- Should see `auth_token` and `user` entries

#### Test 2.2: User Login
**Steps:**
1. Go to login page
2. Enter credentials from Test 2.1
3. Select "Parent" role
4. Click "Login to Dashboard"

**Expected Results:**
- ✅ Login successful notification
- ✅ Redirect to parent dashboard
- ✅ User info displays in header

#### Test 2.3: Session Persistence
**Steps:**
1. Log in as parent
2. Refresh page (F5)
3. Wait for page to load

**Expected Results:**
- ✅ Remain logged in (no redirect to login)
- ✅ Dashboard displays
- ✅ User data persists in header

#### Test 2.4: Protected Routes
**Steps:**
1. While logged OUT, navigate to `http://localhost:3001/parent-dashboard`
2. Log in as parent
3. Try to access `/child-dashboard` (wrong role)

**Expected Results:**
- ✅ Redirected to login when not authenticated
- ✅ Redirected to parent dashboard when wrong role

---

### Phase 3: API Integration Tests

#### Test 3.1: Add Child (Parent Only)
**Prerequisites**: Logged in as parent

**Steps:**
1. Click "Add Child" button in sidebar
2. Fill in form:
   - Name: `Alice Johnson`
   - Age: `12`
   - Email: `alice@example.com`
   - Device OS: `iOS`
   - Device Model: `iPhone 12`
3. Click "Add Child" button in modal

**Expected Results:**
- ✅ Modal closes
- ✅ Success notification: "Child added successfully!"
- ✅ New child appears in children list
- ✅ Network tab shows POST to `/api/child`

**Verification in DevTools:**
1. Network tab → look for `POST /api/child`
2. Response should show the created child with:
   - `_id` (MongoDB ID)
   - `name`
   - `age`
   - `email`
   - Status

#### Test 3.2: Get Children List
**Prerequisites**: Parent with at least one child added

**Steps:**
1. Go to parent dashboard
2. Observe children selector cards at top

**Expected Results:**
- ✅ All children display in selector
- ✅ Can click to select different children
- ✅ Content updates when selecting child

**Network Verification:**
- Network tab should show `GET /api/child` call
- Response contains array of children

#### Test 3.3: Child Dashboard Data
**Prerequisites**: Logged in as child

**Steps:**
1. Log in as child (from Test 2.1 or create new)
2. Observe home tab content

**Expected Results:**
- ✅ Welcome message shows child's name
- ✅ Privacy score displays
- ✅ Screen time widget shows
- ✅ Location status displays
- ✅ Agreements count shows

---

### Phase 4: UI/UX Tests

#### Test 4.1: Responsive Design
**Mobile (375px)**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set to iPhone X (375x812)
4. Test navigation and layout

**Expected Results:**
- ✅ Single column layout
- ✅ Full-width cards
- ✅ Touch-friendly buttons
- ✅ Readable text

**Tablet (768px)**
1. Set to iPad (768x1024)
2. Test layout changes

**Expected Results:**
- ✅ 2-column grid where appropriate
- ✅ Sidebar collapses or hides
- ✅ Content readable

**Desktop (1920px)**
1. Maximize browser window
2. Test full layout

**Expected Results:**
- ✅ 3-column grids
- ✅ Full sidebar visible
- ✅ All content visible

#### Test 4.2: Notification System
**Steps:**
1. Try to submit form with missing fields
2. Trigger error (e.g., duplicate email registration)
3. Perform successful action

**Expected Results:**
- ✅ Error notifications show in red
- ✅ Success notifications show in green
- ✅ Notifications auto-dismiss after 4 seconds
- ✅ Can dismiss manually with X button

#### Test 4.3: Loading States
**Steps:**
1. Watch network calls in slow 3G (DevTools)
2. Observe loading spinners and states

**Expected Results:**
- ✅ Spinners show during data fetch
- ✅ Buttons disable during submission
- ✅ Skeleton screens appear for content

---

### Phase 5: Error Handling Tests

#### Test 5.1: Network Error
**Steps:**
1. Stop backend server (`Ctrl+C` in backend terminal)
2. Try to log in
3. Observe error handling

**Expected Results:**
- ✅ Error notification shows
- ✅ User can retry
- ✅ No app crash

**Restart backend:**
```bash
npm start
```

#### Test 5.2: Invalid Input
**Steps:**
1. Try to register with invalid email: `notanemail`
2. Try to add child without name

**Expected Results:**
- ✅ Validation messages appear
- ✅ Form doesn't submit
- ✅ Focused input highlights

#### Test 5.3: Error Boundary
**Steps:**
1. Trigger a component error (if possible)
2. Observe error boundary catch

**Expected Results:**
- ✅ Error boundary displays error message
- ✅ Reload button appears
- ✅ App doesn't fully crash

---

### Phase 6: Data Consistency Tests

#### Test 6.1: Add Child Then Refresh
**Steps:**
1. Add a child as parent
2. Get success notification
3. Refresh page (F5)
4. Wait for dashboard to load

**Expected Results:**
- ✅ New child still appears in list
- ✅ Data persisted to database
- ✅ No data loss

#### Test 6.2: Login Persistence After Refresh
**Steps:**
1. Log in as user
2. Refresh page multiple times
3. Close and reopen browser

**Expected Results:**
- ✅ Still logged in after refresh
- ✅ Token valid after reopening
- ✅ User data correct

---

## 🔍 API ENDPOINTS VERIFICATION

### Authentication Endpoints

**POST /api/auth/register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "parent"
  }'
```

**Expected Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "mongo_id",
    "name": "Test User",
    "email": "test@example.com",
    "role": "parent"
  }
}
```

**POST /api/auth/login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

**GET /api/auth/verify** (Requires Authorization header)
```bash
curl http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Children Management Endpoints

**GET /api/child** (Get all children)
```bash
curl http://localhost:5000/api/child \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**POST /api/child** (Add child)
```bash
curl -X POST http://localhost:5000/api/child \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Alice",
    "age": 12,
    "email": "alice@example.com",
    "deviceModel": "iPhone 12",
    "osType": "iOS"
  }'
```

---

## 📋 MANUAL TEST RESULTS LOG

### Test Session: [Date & Time]

| Test Case | Status | Notes |
|-----------|--------|-------|
| Backend Running | ✅ PASS | Port 5000, MongoDB Connected |
| Frontend Running | ✅ PASS | Port 3001, Compiled successfully |
| Login Page Loads | ✅ PASS | No console errors |
| CORS Working | [ ] | To be tested |
| User Registration | [ ] | To be tested |
| User Login | [ ] | To be tested |
| Add Child | [ ] | To be tested |
| Get Children List | [ ] | To be tested |
| Responsive Mobile | [ ] | To be tested |
| Responsive Tablet | [ ] | To be tested |
| Responsive Desktop | [ ] | To be tested |
| Error Handling | [ ] | To be tested |
| Session Persistence | [ ] | To be tested |
| Protected Routes | [ ] | To be tested |

---

## 🐛 DEBUGGING TIPS

### 1. Check Browser Console
- Open DevTools: `F12`
- Go to Console tab
- Look for errors (red) or warnings (yellow)

### 2. Check Network Activity
- DevTools → Network tab
- Filter by XHR (API calls)
- Check response status codes
- Look for CORS errors

### 3. Check Storage
- DevTools → Application tab
- Look at localStorage for `auth_token` and `user`
- Check if values persist across refresh

### 4. Check Backend Logs
- Look at backend terminal
- Should see API endpoint calls
- Check for any error messages

### 5. React DevTools
- Install React DevTools extension
- Can inspect component state and props
- Very helpful for debugging

---

## 🚀 NEXT STEPS

### When All Tests Pass ✅
1. Document any issues found
2. Fix bugs as needed
3. Test again
4. Move to staging deployment

### If Tests Fail ❌
1. Check browser console for error messages
2. Check network requests in DevTools
3. Check backend logs
4. Identify root cause
5. Fix issue
6. Re-test

---

## 📞 COMMON ISSUES & SOLUTIONS

### Issue: "Cannot connect to server"
**Solution**: Verify backend is running
```bash
# Check if running:
netstat -ano | findstr :5000

# Restart if needed:
cd backend && npm start
```

### Issue: "CORS error from backend"
**Solution**: Backend CORS should already be configured for port 3001
- Check `backend/server.js` CORS configuration
- Should include `http://localhost:3001`

### Issue: "Auth token not working"
**Solution**: 
- Clear localStorage and try again
- In DevTools: Application → Storage → Clear All
- Log in again

### Issue: "API returning 404"
**Solution**:
- Verify backend server is running
- Check API endpoint URL in `src/config/api.js`
- Verify MongoDB is connected

---

**Test Date**: December 28, 2025  
**Frontend Version**: 1.0.0  
**Backend Version**: 1.0.0  
**Status**: Ready for Integration Testing ✅
