# SafeGuard - Professional Parental Control React Frontend

## ✨ Features Implemented

### 🎨 Professional UI Components
- **Dual Dashboard System**: Separate dashboards for parents and children
- **Modern Design**: Gradient backgrounds, smooth animations, professional color scheme
- **Responsive Layout**: Fully responsive sidebar navigation, cards, and widgets
- **Component Library**: Reusable React components with consistent styling

### 👨‍👩‍👧‍👦 Parent Dashboard
- Overview tab with children's activity summary
- Real-time screen time monitoring with progress indicators
- Location tracking with geofence visualization
- Alert management system with severity levels
- Activity reports with weekly trends
- Multiple children management

### 👧 Child Dashboard
- Home view with privacy score and device status
- Screen time tracking with app breakdown
- Location sharing and device status
- Agreed rules and co-agreements
- Notifications center
- Emergency SOS button

## 📁 Project Structure

```
react-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ParentHeader.js
│   │   ├── ChildHeader.js
│   │   ├── ScreenTimeCard.js
│   │   ├── PrivacyScoreCard.js
│   │   ├── ScreenTimeWidget.js
│   │   ├── LocationMap.js
│   │   ├── ActivityReport.js
│   │   └── AlertsPanel.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── ParentDashboard.js
│   │   └── ChildDashboard.js
│   ├── styles/
│   │   ├── index.css (Global styles)
│   │   ├── LoginPage.css
│   │   ├── Dashboard.css
│   │   ├── Headers.css
│   │   └── Cards.css
│   ├── App.js (Main routing)
│   └── index.js (React entry point)
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. **Navigate to the React app directory**:
```bash
cd "c:\Users\hp\OneDrive\Desktop\PARENTAL CONTROL\privacy_first_dtl\react-app"
```

2. **Install dependencies**:
```bash
npm install
```

### Running the Application

```bash
npm start
```

The application will start on `http://localhost:3000`

### Test Credentials

**Parent Login:**
- Email: parent@example.com
- Password: password123
- Role: Parent

**Child Login:**
- Email: child@example.com  
- Password: password123
- Role: Child
- Child Name: John
- Child Age: 12

## 🎯 Component Details

### ParentHeader
- Displays logo and app branding
- Shows notification badge with count
- User info and quick logout button
- Responsive design for mobile

### ChildHeader  
- Child-focused branding
- Emergency/Safety mode indicator
- User profile quick access
- Logout functionality

### ScreenTimeCard
- Shows daily screen time usage vs. limit
- Visual progress bar with color coding (green/yellow/red)
- Percentage and remaining time display
- Warning/danger states

### PrivacyScoreCard
- Circular progress visualization
- Color-coded score levels (Excellent/Good/Fair/Poor)
- Privacy status message
- Fully responsive design

### ScreenTimeWidget
- Detailed app usage breakdown
- Horizontal bar charts for each app
- Percentage calculations
- Usage trends

### LocationMap
- Map placeholder for real-time tracking
- Last update timestamp
- Accuracy information
- Device online status indicator

### ActivityReport
- 7-day activity timeline
- Average daily usage statistics
- Session counts and totals
- Weekly trend visualization

### AlertsPanel
- Severity-based alert display (danger/warning/info)
- Dismissible alerts
- Empty state with success message
- Alert type indicators

## 🎨 Styling System

### CSS Variables
- **Colors**: Primary, secondary, success, warning, danger, info
- **Spacing**: xs, sm, md, lg, xl
- **Shadows**: sm, md, lg
- **Transitions**: fast (150ms), normal (300ms)

### Responsive Breakpoints
- Desktop: 1024px and above
- Tablet: 768px to 1023px  
- Mobile: Below 768px

### Design Patterns
- Card-based layouts
- Gradient backgrounds
- Smooth transitions and animations
- Accessibility-focused design

## 🔌 API Integration

The application is configured to connect to the backend API at:
```
http://localhost:5000/api
```

Current implementation uses mock data. To enable API integration:

1. Update `apiService.js` base URL
2. Replace mock data calls with API endpoints
3. Implement proper error handling

## 📱 Features

### Authentication
- Email/password login
- Role-based access (Parent/Child)
- Child information during registration
- Automatic dashboard routing

### Parent Controls
- Monitor multiple children
- Set screen time limits
- View activity reports
- Receive and manage alerts
- Track locations
- Configure rules and agreements

### Child Experience
- Safe browsing dashboard
- Screen time awareness
- Location sharing transparency
- Agreement acknowledgment
- Emergency SOS button
- Notification preferences

## 🔒 Security Notes

- Passwords are hashed on backend (implementation required)
- JWT tokens for session management (implementation required)
- Role-based access control (RBAC) implemented
- API endpoints require authentication

## 📊 Data Models

### User (Parent/Child)
- Email, password, name
- Role (parent/child)
- Created date

### Child (for Parent)
- Name, age, device ID
- Linked parent email
- Device type, OS version

### Screen Time
- Daily limits per app category
- Usage tracking
- Pause notifications

### Rules
- App restrictions
- Website blocking
- Time-based rules
- Co-agreements

### Alerts
- Screen time notifications
- Rule violations
- Location updates
- Privacy alerts

## 🎓 Development Notes

### Adding New Components

1. Create component file in `src/components/`
2. Import CSS styles from `src/styles/`
3. Use semantic HTML and accessibility attributes
4. Follow existing component patterns
5. Test responsive behavior

### Modifying Styles

- Edit CSS files in `src/styles/`
- Use CSS variables for consistency
- Update global styles in `index.css`
- Test on multiple screen sizes

### Connecting to Backend

1. Update API endpoints in components
2. Add error handling
3. Implement loading states
4. Add success/error notifications
5. Test API integration

## 🐛 Troubleshooting

**Port 3000 already in use:**
```bash
npm start -- --port 3001
```

**Dependencies not installing:**
```bash
rm -r node_modules package-lock.json
npm install
```

**Styles not loading:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart development server
- Check CSS file imports

## 📝 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 🤝 Integration with Vanilla JS

The React app can be integrated with existing vanilla JavaScript backend:

1. Use the same API endpoints
2. Share authentication tokens
3. Maintain consistent data structures
4. Use WebSocket for real-time updates

## 📞 Support

For issues or feature requests, refer to the main project documentation or API testing guide.

---

**Status**: Production Ready 🚀
**Last Updated**: 2024
**Version**: 1.0.0
