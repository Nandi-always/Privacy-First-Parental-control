import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Check, RefreshCw, Filter, BarChart3 } from 'lucide-react';
import { riskyActivityService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const RiskyActivityPanel = ({ childId }) => {
    const notify = useNotification();
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ acknowledged: 'false', severity: '' });

    const fetchAlerts = useCallback(async () => {
        if (!childId) return;
        try {
            setLoading(true);
            const [alertsRes, statsRes] = await Promise.all([
                riskyActivityService.getAlerts(childId, filter),
                riskyActivityService.getStats(childId, 7)
            ]);
            setAlerts(alertsRes.data || []);
            setStats(statsRes.data || null);
        } catch (err) {
            console.error('Failed to fetch risky activities', err);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    }, [childId, filter]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const handleAcknowledge = async (alertId) => {
        try {
            await riskyActivityService.acknowledge(alertId);
            notify.success('Alert acknowledged');
            fetchAlerts();
        } catch (err) {
            notify.error('Failed to acknowledge alert');
        }
    };

    const handleDetectNow = async () => {
        try {
            setLoading(true);
            await riskyActivityService.detect(childId);
            notify.success('Risk detection completed');
            fetchAlerts();
        } catch (err) {
            notify.error('Detection failed');
        } finally {
            setLoading(false);
        }
    };

    const getAlertIcon = (type) => {
        const icons = {
            excessive_screen_time: '⏰',
            late_night_usage: '🌙',
            blocked_site_attempts: '🚫',
            unauthorized_app: '📱',
            unusual_location: '📍',
            rapid_app_switching: '🔄',
            geofence_violation: '🗺️'
        };
        return icons[type] || '⚠️';
    };

    const getAlertTitle = (type) => {
        const titles = {
            excessive_screen_time: 'Excessive Screen Time',
            late_night_usage: 'Late Night Usage',
            blocked_site_attempts: 'Blocked Site Attempts',
            unauthorized_app: 'Unauthorized App',
            unusual_location: 'Unusual Location',
            rapid_app_switching: 'Rapid App Switching',
            geofence_violation: 'Geofence Violation'
        };
        return titles[type] || 'Alert';
    };

    const getSeverityStyle = (severity) => {
        const styles = {
            low: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
            medium: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
            high: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
        };
        return styles[severity] || styles.medium;
    };

    return (
        <div className="card risky-activity-panel">
            <div className="card-header">
                <h3><AlertTriangle size={20} /> Risky Activity Alerts</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={handleDetectNow} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Scan Now
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            {stats && (
                <div className="stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#374151' }}>{stats.totalAlerts}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Alerts</div>
                    </div>
                    <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#92400e' }}>{stats.unacknowledged}</div>
                        <div style={{ fontSize: '12px', color: '#92400e' }}>Unread</div>
                    </div>
                    <div style={{ background: '#fee2e2', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#991b1b' }}>{stats.bySeverity?.high || 0}</div>
                        <div style={{ fontSize: '12px', color: '#991b1b' }}>High Severity</div>
                    </div>
                    <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e40af' }}>{stats.bySeverity?.low || 0}</div>
                        <div style={{ fontSize: '12px', color: '#1e40af' }}>Low Severity</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <select
                    value={filter.acknowledged}
                    onChange={(e) => setFilter(prev => ({ ...prev, acknowledged: e.target.value }))}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                >
                    <option value="false">Unacknowledged</option>
                    <option value="true">Acknowledged</option>
                    <option value="">All</option>
                </select>
                <select
                    value={filter.severity}
                    onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                >
                    <option value="">All Severities</option>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🔵 Low</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner"></div>
                    <p>Loading alerts...</p>
                </div>
            ) : alerts.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#16a34a' }}>
                    <Check size={48} style={{ marginBottom: '16px' }} />
                    <p style={{ fontWeight: 600 }}>No risky activities detected!</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Your child's online activity looks safe.</p>
                </div>
            ) : (
                <div className="alerts-list">
                    {alerts.map(alert => {
                        const severity = getSeverityStyle(alert.severity);
                        return (
                            <div key={alert._id} className="alert-item" style={{
                                background: severity.bg,
                                border: `1px solid ${severity.border}`,
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <span style={{ fontSize: '32px' }}>{getAlertIcon(alert.alertType)}</span>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h4 style={{ margin: 0, color: severity.color }}>{getAlertTitle(alert.alertType)}</h4>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    background: severity.color,
                                                    color: 'white',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, color: severity.color }}>{alert.description}</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {!alert.isAcknowledged && (
                                        <button
                                            className="btn"
                                            style={{
                                                background: 'white',
                                                border: `1px solid ${severity.border}`,
                                                color: severity.color,
                                                padding: '8px 16px'
                                            }}
                                            onClick={() => handleAcknowledge(alert._id)}
                                        >
                                            <Check size={16} /> Acknowledge
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RiskyActivityPanel;
