import React from 'react';
import { LogOut, AlertCircle } from 'lucide-react';
import '../styles/Headers.css';

const ChildHeader = ({ user, emergencyMode, onLogout }) => {
  return (
    <header className="dashboard-header child-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🎮</span>
          <h1>My Dashboard</h1>
        </div>
      </div>

      <div className="header-right">
        {emergencyMode && (
          <div className="emergency-banner">
            <AlertCircle size={16} />
            <span>Safety Mode Active</span>
          </div>
        )}

        <div className="user-menu">
          <div className="user-info">
            <div className="user-avatar">👧</div>
            <div className="user-details">
              <p className="user-name">Child Account</p>
              <p className="user-email">{user?.name}</p>
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

export default ChildHeader;
