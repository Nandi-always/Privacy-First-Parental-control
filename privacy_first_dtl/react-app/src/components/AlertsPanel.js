import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Check, X, Clock } from 'lucide-react';
import { emergencyService, downloadsService } from '../services/apiService';
import '../styles/Cards.css';

const AlertsPanel = ({ child }) => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const fetchAlerts = useCallback(async () => {
    if (!child?._id && !child?.id) return;

    try {
      setLoading(true);
      const childId = child._id || child.id;
      
      // Fetch emergency alerts
      const emergencyRes = await emergencyService.getAlerts(childId);
      const emergencyAlerts = emergencyRes?.data?.map(alert => ({
        id: alert._id || alert.id,
        type: 'emergency',
        message: alert.message || 'Emergency alert triggered',
        severity: 'danger',
        time: alert.timestamp ? formatTime(alert.timestamp) : 'Recently'
      })) || [];

      // Fetch app download alerts
      const downloadRes = await downloadsService.getAlerts(childId);
      const downloadAlerts = downloadRes?.data?.map(alert => ({
        id: alert._id || alert.id,
        type: 'app',
        message: `App ${alert.status === 'pending' ? 'install' : 'access'} request: ${alert.appName}`,
        severity: alert.status === 'pending' ? 'warning' : 'info',
        time: alert.timestamp ? formatTime(alert.timestamp) : 'Recently'
      })) || [];

      // Combine and limit to 5 most recent
      const combinedAlerts = [...emergencyAlerts, ...downloadAlerts].slice(0, 5);
      setAlerts(combinedAlerts.length > 0 ? combinedAlerts : getMockAlerts());
    } catch (err) {
      console.error('Failed to fetch alerts', err);
      // Use mock alerts on error
      setAlerts(getMockAlerts());
    } finally {
      setLoading(false);
    }
  }, [child]);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const getMockAlerts = () => [
    { id: 1, type: 'screentime', message: 'Screen time limit approaching', severity: 'warning', time: '2 hours ago' },
    { id: 2, type: 'location', message: 'Child activity detected', severity: 'info', time: '30 minutes ago' },
  ];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

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
          <h3>Alerts - {child?.name || 'Unknown'}</h3>
        </div>
        <span className="alert-count">{visibleAlerts.length}</span>
      </div>

      {loading && <p className="loading-text">Loading alerts...</p>}

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
