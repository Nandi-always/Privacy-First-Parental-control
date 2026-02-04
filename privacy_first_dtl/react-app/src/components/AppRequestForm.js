import React, { useState, useEffect, useCallback } from 'react';
import { Send, Clock, Check, X, AlertCircle } from 'lucide-react';
import { appApprovalsService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const AppRequestForm = ({ childId }) => {
    const notify = useNotification();
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        appName: '',
        appCategory: 'other',
        requestReason: ''
    });

    const CATEGORY_OPTIONS = [
        { value: 'educational', label: '📚 Educational' },
        { value: 'game', label: '🎮 Game' },
        { value: 'social', label: '💬 Social' },
        { value: 'productivity', label: '📊 Productivity' },
        { value: 'entertainment', label: '🎬 Entertainment' },
        { value: 'communication', label: '📞 Communication' },
        { value: 'other', label: '📱 Other' }
    ];

    const fetchMyRequests = useCallback(async () => {
        if (!childId) return;
        try {
            setLoading(true);
            const res = await appApprovalsService.getChildRequests(childId);
            setMyRequests(res.data || []);
        } catch (err) {
            console.error('Failed to fetch requests', err);
            setMyRequests([]);
        } finally {
            setLoading(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchMyRequests();
    }, [fetchMyRequests]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.appName) {
            notify.error('Please enter the app name');
            return;
        }

        try {
            setSubmitting(true);
            await appApprovalsService.requestApproval(childId, formData);
            notify.success('Request sent to your parent!');
            setFormData({ appName: '', appCategory: 'other', requestReason: '' });
            setShowForm(false);
            fetchMyRequests();
        } catch (err) {
            notify.error(err.response?.data?.message || 'Failed to send request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <Check size={16} color="#16a34a" />;
            case 'denied': return <X size={16} color="#dc2626" />;
            default: return <Clock size={16} color="#d97706" />;
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#92400e' },
            approved: { bg: '#d1fae5', color: '#065f46' },
            denied: { bg: '#fee2e2', color: '#991b1b' }
        };
        return styles[status] || styles.pending;
    };

    return (
        <div className="card app-request-form">
            <div className="card-header">
                <h3>📲 Request a New App</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    <Send size={16} /> New Request
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={{
                    background: '#f9fafb',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>App Name *</label>
                        <input
                            type="text"
                            name="appName"
                            value={formData.appName}
                            onChange={handleChange}
                            placeholder="e.g., Minecraft, Duolingo, TikTok"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db'
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Category</label>
                        <select
                            name="appCategory"
                            value={formData.appCategory}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db'
                            }}
                        >
                            {CATEGORY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                            Why do you want this app? (helps your parent decide)
                        </label>
                        <textarea
                            name="requestReason"
                            value={formData.requestReason}
                            onChange={handleChange}
                            placeholder="e.g., For homework, to play with friends, to learn a new language..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={submitting}
                        >
                            {submitting ? 'Sending...' : '📩 Send Request'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* My Requests */}
            <div className="my-requests">
                <h4 style={{ marginBottom: '12px', color: '#374151' }}>My Requests</h4>

                {loading ? (
                    <p style={{ color: '#9ca3af', textAlign: 'center' }}>Loading...</p>
                ) : myRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                        <AlertCircle size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <p>No app requests yet</p>
                        <p style={{ fontSize: '14px' }}>Click "New Request" to ask for an app!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {myRequests.map(request => {
                            const statusStyle = getStatusStyle(request.status);
                            return (
                                <div key={request._id} style={{
                                    background: statusStyle.bg,
                                    padding: '16px',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {getStatusIcon(request.status)}
                                            <div>
                                                <strong style={{ color: statusStyle.color }}>{request.appName}</strong>
                                                <p style={{ margin: 0, fontSize: '12px', color: statusStyle.color, opacity: 0.8 }}>
                                                    {new Date(request.requestedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            background: 'white',
                                            color: statusStyle.color,
                                            textTransform: 'capitalize'
                                        }}>
                                            {request.status}
                                        </span>
                                    </div>
                                    {request.parentResponse && (
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '12px',
                                            background: 'white',
                                            borderRadius: '8px',
                                            fontSize: '14px'
                                        }}>
                                            <strong>Parent's message:</strong> {request.parentResponse}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppRequestForm;
