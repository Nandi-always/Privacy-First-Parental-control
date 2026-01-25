import React, { useState, useEffect } from 'react';
import { LogOut, Bell, Send, Shield } from 'lucide-react';
import { notificationsService } from '../services/apiService';
import NotificationPanel from './NotificationPanel';
import SendAlertModal from './SendAlertModal';
import '../styles/Headers.css';

const ParentHeader = ({ user, childrenList, onLogout }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsService.getAll();
      const unread = (res.data || res).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="dashboard-header parent-header">
      <div className="header-left">
        <div className="header-brand">
          <Shield size={24} className="brand-icon" />
          <span className="brand-name">Privacy First</span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="send-alert-btn-header"
          onClick={() => setIsSendModalOpen(true)}
          title="Send alert to child"
        >
          <Send size={18} />
          <span>Send Alert</span>
        </button>

        <button
          className="notification-btn"
          onClick={() => setIsNotificationOpen(true)}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
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

      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => {
          setIsNotificationOpen(false);
          fetchUnreadCount();
        }}
        userRole="parent"
      />

      <SendAlertModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        user={user}
        childrenList={childrenList}
      />
    </header>
  );
};

export default ParentHeader;
