import React from 'react';
import { LogOut, Bell } from 'lucide-react';
import '../styles/Headers.css';

const ParentHeader = ({ user, onLogout }) => {
  return (
    <header className="dashboard-header parent-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🛡️</span>
          <h1>SafeGuard</h1>
        </div>
      </div>

      <div className="header-right">
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-menu">
          <div className="user-info">
            <div className="user-avatar">👨‍💼</div>
            <div className="user-details">
              <p className="user-name">Parent Account</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ParentHeader;
