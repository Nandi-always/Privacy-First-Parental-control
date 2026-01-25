# 🚀 Privacy-First Parental Control - Quick Start

## Running the Application (Integrated)

### ✨ Single Command (Recommended)

```powershell
cd "C:\Users\Monika KN\OneDrive\Desktop\Privacy-First-Parental-control"
npm start
```

This will start **both servers simultaneously**:
- **Backend API**: http://localhost:5000
- **Frontend UI**: http://localhost:3001

---

## 📋 Available Commands

### Run Both Servers
```powershell
npm start
# or
npm run dev
```

### Run Backend Only
```powershell
npm run server
```

### Run Frontend Only
```powershell
npm run client
```

### Install All Dependencies
```powershell
npm run install:all
```

---

## 🌐 Access Your Application

Once both servers are running:
1. Open your browser
2. Go to: **http://localhost:3001**
3. The frontend will automatically connect to the backend at http://localhost:5000

---

## 🛠️ Manual Setup (If Needed)

If you need to install dependencies separately:

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd privacy_first_dtl/react-app
npm install
```

---

## ✅ What to Expect

When you run `npm start`, you'll see:
- **[0]** Backend server logs (Node.js/Express)
- **[1]** Frontend server logs (React)
- Both colored and labeled for easy identification

Both servers must be running for full functionality!

---

## 🔧 Troubleshooting

**Port already in use?**
- Backend (5000): Close any app using port 5000
- Frontend (3001): Close any app using port 3001

**Dependencies issue?**
```powershell
npm run install:all
```

**Need to clear cache?**
```powershell
cd privacy_first_dtl/react-app
npm run clean-start
```
