import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, MessageCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { notificationsService } from '../services/apiService';
import '../styles/Notifications.css';

const NotificationPanel = ({ isOpen, onClose, userRole }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationsService.getAll();
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkRead = async (id) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'emergency': return <ShieldAlert size={18} className="icon-emergency" />;
            case 'alert': return <AlertTriangle size={18} className="icon-alert" />;
            default: return <MessageCircle size={18} className="icon-message" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="notification-panel-overlay" onClick={onClose}>
            <div className="notification-panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h3>Notifications</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="panel-content">
                    {loading ? (
                        <p className="status-text">Loading...</p>
                    ) : notifications.length > 0 ? (
                        <div className="notification-list">
                            {notifications.map(n => (
                                <div key={n._id} className={`notification-item ${n.isRead ? 'read' : 'unread'}`}>
                                    <div className="notification-icon">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="notification-body">
                                        <p className="notification-message">{n.message}</p>
                                        <span className="notification-time">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {!n.isRead && (
                                        <button
                                            className="mark-read-btn"
                                            onClick={() => handleMarkRead(n._id)}
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Bell size={40} className="empty-icon" />
                            <p>No notifications yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPanel;
