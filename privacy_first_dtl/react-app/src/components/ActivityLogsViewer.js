import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Globe, MapPin, Download, Eye, EyeOff, Shield, Filter } from 'lucide-react';
import { reportsService, websiteRulesService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const ActivityLogsViewer = ({ childId }) => {
    const notify = useNotification();
    const [activityData, setActivityData] = useState(null);
    const [blockedAttempts, setBlockedAttempts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState('today');
    const [activityType, setActivityType] = useState('all');

    const fetchActivityData = useCallback(async () => {
        if (!childId) return;
        try {
            setLoading(true);
            const [activityRes, attemptsRes] = await Promise.all([
                reportsService.getActivity(childId),
                websiteRulesService.getBlockedAttempts(childId)
            ]);
            setActivityData(activityRes.data || null);
            setBlockedAttempts(attemptsRes.data || null);
        } catch (err) {
            console.error('Failed to fetch activity data', err);
        } finally {
            setLoading(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchActivityData();
    }, [fetchActivityData]);

    const formatTime = (minutes) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            educational: '📚',
            entertainment: '🎬',
            social: '💬',
            games: '🎮',
            productivity: '📊',
            communication: '📞',
            other: '📱'
        };
        return icons[category] || '📱';
    };

    return (
        <div className="card activity-logs-viewer">
            <div className="card-header">
                <h3><Clock size={20} /> Activity Logs</h3>
            </div>

            {/* Privacy Banner */}
            <div className="privacy-banner" style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: '16px 20px',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <Shield size={24} color="#059669" />
                <div>
                    <strong style={{ color: '#065f46' }}>Privacy Protected</strong>
                    <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                        You can see app usage and website domains, but <strong>no message content, search queries, or private data</strong> is visible.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
                <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                >
                    <option value="all">All Activities</option>
                    <option value="apps">App Usage</option>
                    <option value="websites">Website Visits</option>
                    <option value="location">Location</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner"></div>
                    <p>Loading activity logs...</p>
                </div>
            ) : (
                <div className="activity-sections">
                    {/* App Usage Section */}
                    {(activityType === 'all' || activityType === 'apps') && activityData?.screenTime && (
                        <div className="activity-section" style={{ marginBottom: '24px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Clock size={18} /> App Usage
                                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>
                                    ({formatTime(activityData.screenTime.totalTime)} today)
                                </span>
                            </h4>
                            <div className="app-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {activityData.screenTime.appUsage?.length > 0 ? (
                                    activityData.screenTime.appUsage.map((app, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            background: '#f9fafb',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '24px' }}>{getCategoryIcon(app.category)}</span>
                                                <div>
                                                    <strong>{app.appName}</strong>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{app.category}</p>
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: 600, color: '#374151' }}>{formatTime(app.timeSpent)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No app usage recorded today</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Website Visits Section */}
                    {(activityType === 'all' || activityType === 'websites') && blockedAttempts && (
                        <div className="activity-section" style={{ marginBottom: '24px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Globe size={18} /> Website Activity
                                <span style={{
                                    fontSize: '12px',
                                    padding: '2px 8px',
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    borderRadius: '12px'
                                }}>
                                    {blockedAttempts.totalAttempts} blocked
                                </span>
                            </h4>

                            <div className="domain-note" style={{
                                background: '#f0f9ff',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <EyeOff size={16} color="#0369a1" />
                                <span style={{ fontSize: '13px', color: '#0369a1' }}>
                                    Only website domains are shown (e.g., "youtube.com") — no full URLs or page content
                                </span>
                            </div>

                            {blockedAttempts.blockedSites?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {blockedAttempts.blockedSites.map((site, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            background: '#fef2f2',
                                            borderRadius: '8px',
                                            border: '1px solid #fecaca'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span>🚫</span>
                                                <strong>{site.website}</strong>
                                            </div>
                                            <span style={{
                                                fontSize: '12px',
                                                padding: '4px 10px',
                                                background: '#dc2626',
                                                color: 'white',
                                                borderRadius: '12px'
                                            }}>
                                                {site.attemptCount} attempts
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#16a34a', textAlign: 'center', padding: '20px' }}>
                                    ✅ No blocked website attempts
                                </p>
                            )}
                        </div>
                    )}

                    {/* Location Section */}
                    {(activityType === 'all' || activityType === 'location') && activityData?.lastLocation && (
                        <div className="activity-section" style={{ marginBottom: '24px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <MapPin size={18} /> Location Check-ins
                            </h4>
                            <div style={{
                                padding: '16px',
                                background: '#f0fdf4',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <MapPin size={24} color="#16a34a" />
                                <div>
                                    <strong>{activityData.lastLocation.address || 'Unknown location'}</strong>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                        Last updated: {new Date(activityData.lastLocation.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* What's NOT Tracked */}
                    <div className="privacy-section" style={{
                        background: '#f9fafb',
                        padding: '20px',
                        borderRadius: '12px',
                        marginTop: '24px'
                    }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <EyeOff size={18} /> What's NOT Tracked
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            {[
                                { icon: '💬', text: 'Message content' },
                                { icon: '🔍', text: 'Search queries' },
                                { icon: '🔐', text: 'Passwords' },
                                { icon: '📷', text: 'Photos & media' },
                                { icon: '📧', text: 'Email content' },
                                { icon: '🔗', text: 'Full URLs (only domains)' }
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    background: 'white',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}>
                                    <span>{item.icon}</span>
                                    <span style={{ color: '#6b7280' }}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityLogsViewer;
