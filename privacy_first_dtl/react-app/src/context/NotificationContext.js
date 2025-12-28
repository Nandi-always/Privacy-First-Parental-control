import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const notification = { id, message, type };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [removeNotification]);

  const notify = {
    success: (message, duration) => addNotification(message, 'success', duration),
    error: (message, duration) => addNotification(message, 'error', duration),
    info: (message, duration) => addNotification(message, 'info', duration),
    warning: (message, duration) => addNotification(message, 'warning', duration),
  };

  return (
    <NotificationContext.Provider value={{ ...notify, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

const NotificationContainer = ({ notifications, onRemove }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          <div className="notification-icon">
            {getIcon(notification.type)}
          </div>
          <div className="notification-message">{notification.message}</div>
          <button 
            className="notification-close"
            onClick={() => onRemove(notification.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
