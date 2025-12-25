import React, { useState } from 'react';
import { AlertCircle, Check, X, Clock } from 'lucide-react';
import '../styles/Cards.css';

const AlertsPanel = ({ alerts = [] }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const mockAlerts = alerts.length ? alerts : [
    { id: 1, type: 'screentime', message: 'Screen time limit reached today', severity: 'warning', time: '2 hours ago' },
    { id: 2, type: 'location', message: 'Child left school geofence', severity: 'info', time: '30 minutes ago' },
    { id: 3, type: 'app', message: 'Attempted access to blocked app', severity: 'danger', time: '1 hour ago' },
    { id: 4, type: 'privacy', message: 'Location sharing disabled', severity: 'warning', time: '3 hours ago' },
  ];

  const visibleAlerts = mockAlerts.filter(alert => !dismissedAlerts.includes(alert.id));

  const handleDismiss = (id) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'danger':
        return <AlertCircle size={16} className="alert-icon danger" />;
      case 'warning':
        return <AlertCircle size={16} className="alert-icon warning" />;
      default:
        return <Clock size={16} className="alert-icon info" />;
    }
  };

  return (
    <div className="card alerts-panel">
      <div className="card-header">
        <div className="card-title-group">
          <AlertCircle size={20} className="card-icon" />
          <h3>Recent Alerts</h3>
        </div>
        <span className="alert-count">{visibleAlerts.length}</span>
      </div>

      {visibleAlerts.length > 0 ? (
        <div className="alerts-list">
          {visibleAlerts.map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.severity}`}>
              <div className="alert-content">
                <div className="alert-header">
                  {getSeverityIcon(alert.severity)}
                  <p className="alert-message">{alert.message}</p>
                </div>
                <span className="alert-time">{alert.time}</span>
              </div>
              <button 
                className="alert-dismiss"
                onClick={() => handleDismiss(alert.id)}
                title="Dismiss alert"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="alerts-empty">
          <Check size={32} className="empty-icon" />
          <p>No alerts</p>
          <span>All is well!</span>
        </div>
      )}

      {dismissedAlerts.length > 0 && (
        <button 
          className="clear-dismissed-btn"
          onClick={() => setDismissedAlerts([])}
        >
          Clear dismissed ({dismissedAlerts.length})
        </button>
      )}
    </div>
  );
};

export default AlertsPanel;
