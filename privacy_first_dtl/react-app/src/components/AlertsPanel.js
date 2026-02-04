import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Check, X, Clock, Shield, Ban, MapPin } from 'lucide-react';
import { alertsService } from '../services/apiService';
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

      // Fetch alerts from new alerts API
      const res = await alertsService.getAll(childId);
      const alertsData = res?.data || [];

      // Format alerts for display
      const formattedAlerts = alertsData.map(alert => ({
        id: alert._id || alert.id,
        type: alert.type,
        message: alert.message || alert.title,
        severity: alert.severity || 'info',
        time: alert.createdAt ? formatTime(alert.createdAt) : 'Recently',
        isRead: alert.isRead
      }));

      // Show formatted alerts or demo alerts
      setAlerts(formattedAlerts.length > 0 ? formattedAlerts : getDemoAlerts());
    } catch (err) {
      console.error('Failed to fetch alerts', err);
      // Use demo alerts on error for presentation
      setAlerts(getDemoAlerts());
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

  const getDemoAlerts = () => [
    { id: 'demo1', type: 'screen_time_warning', message: 'Screen time approaching limit - 30 mins left', severity: 'warning', time: '15 mins ago', isRead: false },
    { id: 'demo2', type: 'app_blocked', message: 'YouTube blocked during school hours', severity: 'info', time: '2 hours ago', isRead: true },
    { id: 'demo3', type: 'bedtime', message: 'Bedtime mode activated', severity: 'info', time: '1 day ago', isRead: true },
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
