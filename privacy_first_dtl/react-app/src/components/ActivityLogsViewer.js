import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Globe, MapPin, EyeOff, Shield, Filter } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { reportsService, websiteRulesService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

// Register ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
            notify.error('Could not load activity logs. Please try again.');
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

    // Mock data for demonstration if real data is missing
    const mockAppUsage = [
        { appName: 'YouTube', timeSpent: 45, category: 'entertainment' },
        { appName: 'DuoLingo', timeSpent: 30, category: 'educational' },
        { appName: 'WhatsApp', timeSpent: 20, category: 'communication' },
        { appName: 'Roblox', timeSpent: 60, category: 'games' },
        { appName: 'Calculator', timeSpent: 5, category: 'productivity' }
    ];

    const mockWebSites = [
        { website: 'facebook.com', attemptCount: 12 },
        { website: 'instagram.com', attemptCount: 8 },
        { website: 'tiktok.com', attemptCount: 15 }
    ];

    // Chart Data Preparation
    const getAppData = () => {
        const apps = (activityData?.screenTime?.appUsage?.length > 0)
            ? activityData.screenTime.appUsage
            : mockAppUsage;

        // Group by category for the doughnut chart
        const categories = {};
        apps.forEach(app => {
            const cat = app.category || 'other';
            categories[cat] = (categories[cat] || 0) + app.timeSpent;
        });

        return {
            labels: Object.keys(categories).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [{
                label: 'Time Spent (min)',
                data: Object.values(categories),
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'
                ],
                hoverOffset: 15,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    };

    const getTopAppsData = () => {
        const apps = (activityData?.screenTime?.appUsage?.length > 0)
            ? activityData.screenTime.appUsage.sort((a, b) => b.timeSpent - a.timeSpent).slice(0, 5)
            : mockAppUsage.sort((a, b) => b.timeSpent - a.timeSpent);

        return {
            labels: apps.map(app => app.appName),
            datasets: [{
                label: 'Minutes',
                data: apps.map(app => app.timeSpent),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderRadius: 6,
                barThickness: 20
            }]
        };
    };

    const getWebsiteData = () => {
        const sites = (blockedAttempts?.blockedSites?.length > 0)
            ? blockedAttempts.blockedSites
            : mockWebSites;

        return {
            labels: sites.map(site => site.website),
            datasets: [{
                label: 'Block Attempts',
                data: sites.map(site => site.attemptCount),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#ef4444',
                borderWidth: 1,
                borderRadius: 4
            }]
        };
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
                    {(activityType === 'all' || activityType === 'apps') && (
                        <div className="activity-section" style={{ marginBottom: '32px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Clock size={18} /> App Usage Tracking
                                {activityData?.screenTime && (
                                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>
                                        ({formatTime(activityData.screenTime.totalTime)} today)
                                    </span>
                                )}
                            </h4>

                            {/* Category & Top Apps Row */}
                            <div className="charts-row" style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '24px',
                                marginBottom: '24px'
                            }}>
                                <div className="card-sub" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <h5 style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage by Category</h5>
                                    <div style={{ height: '220px', position: 'relative' }}>
                                        <Doughnut
                                            data={getAppData()}
                                            options={{
                                                plugins: {
                                                    legend: {
                                                        display: true,
                                                        position: 'bottom',
                                                        labels: {
                                                            boxWidth: 8,
                                                            usePointStyle: true,
                                                            padding: 15,
                                                            font: { size: 11 }
                                                        }
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => ` ${context.label}: ${formatTime(context.raw)}`
                                                        }
                                                    }
                                                },
                                                maintainAspectRatio: false,
                                                cutout: '70%'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="card-sub" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <h5 style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top 5 Applications</h5>
                                    <div style={{ height: '220px', position: 'relative' }}>
                                        <Bar
                                            data={getTopAppsData()}
                                            options={{
                                                indexAxis: 'y',
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => ` ${formatTime(context.raw)}`
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        grid: { display: false },
                                                        ticks: { display: false }
                                                    },
                                                    y: {
                                                        grid: { display: false },
                                                        ticks: {
                                                            font: { size: 12, weight: '500' },
                                                            color: '#334155'
                                                        }
                                                    }
                                                },
                                                maintainAspectRatio: false
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Website Visits Section */}
                    {(activityType === 'all' || activityType === 'websites') && (
                        <div className="activity-section" style={{ marginBottom: '32px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Globe size={18} /> Website Domain Activity
                                {blockedAttempts && (
                                    <span style={{
                                        fontSize: '12px',
                                        padding: '2px 8px',
                                        background: '#fee2e2',
                                        color: '#991b1b',
                                        borderRadius: '12px'
                                    }}>
                                        {blockedAttempts.totalAttempts} blocked attempts
                                    </span>
                                )}
                            </h4>

                            {blockedAttempts ? (
                                <div className="visualization-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1.5fr 1fr',
                                    gap: '24px'
                                }}>
                                    <div className="chart-container" style={{ height: '220px' }}>
                                        <Bar
                                            data={getWebsiteData()}
                                            options={{
                                                indexAxis: 'y',
                                                plugins: {
                                                    legend: { display: false }
                                                },
                                                scales: {
                                                    x: { grid: { display: false }, beginAtZero: true },
                                                    y: { grid: { display: false } }
                                                },
                                                maintainAspectRatio: false
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div className="domain-note" style={{
                                            background: '#f0f9ff',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '8px'
                                        }}>
                                            <EyeOff size={16} color="#0369a1" style={{ marginTop: '2px' }} />
                                            <span style={{ fontSize: '12px', color: '#0369a1', lineHeight: 1.4 }}>
                                                Privacy Protection: Only domains recorded. Specific page details are hidden.
                                            </span>
                                        </div>

                                        {blockedAttempts.blockedSites?.length > 0 ? (
                                            blockedAttempts.blockedSites.slice(0, 3).map((site, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    padding: '10px',
                                                    background: '#fff1f2',
                                                    borderRadius: '8px',
                                                    fontSize: '13px'
                                                }}>
                                                    <span style={{ fontWeight: 500 }}>{site.website}</span>
                                                    <span style={{ color: '#dc2626', fontWeight: 600 }}>{site.attemptCount}x</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}>
                                                <p style={{ margin: 0, fontSize: '13px' }}>✅ No blocked attempts</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px', color: '#9ca3af' }}>
                                    <p>Loading website data...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Location Section */}
                    {(activityType === 'all' || activityType === 'location') && (
                        <div className="activity-section" style={{ marginBottom: '24px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <MapPin size={18} /> Safe Zone Check-ins
                            </h4>
                            {activityData?.lastLocation ? (
                                <div style={{
                                    padding: '16px',
                                    background: '#f0fdf4',
                                    borderRadius: '12px',
                                    border: '1px solid #dcfce7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: '#16a34a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <MapPin size={24} color="white" />
                                    </div>
                                    <div>
                                        <h5 style={{ margin: 0, fontSize: '16px' }}>{activityData.lastLocation.address || 'Manual Check-in'}</h5>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                                            Registered at {new Date(activityData.lastLocation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(activityData.lastLocation.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '30px',
                                    textAlign: 'center',
                                    background: '#f9fafb',
                                    borderRadius: '12px',
                                    color: '#9ca3af'
                                }}>
                                    <MapPin size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                    <p>No location check-ins recorded for this period</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* What's NOT Tracked Summary Card */}
                    <div className="privacy-card" style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        padding: '24px',
                        borderRadius: '16px',
                        marginTop: '32px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Shield size={22} color="#64748b" />
                            <h4 style={{ margin: 0 }}>Transparency: What's NOT Tracked</h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {[
                                { icon: '💬', title: 'Messages', info: 'Content of chats' },
                                { icon: '🔍', title: 'Searches', info: 'Query strings' },
                                { icon: '🔐', title: 'Passwords', info: 'Login details' },
                                { icon: '📷', title: 'Media', info: 'Photos & Videos' },
                                { icon: '📧', title: 'Emails', info: 'Actual body text' },
                                { icon: '🔗', title: 'Full Links', info: 'Specific pages' }
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    textAlign: 'center',
                                    padding: '12px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
                                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>{item.title}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.info}</div>
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
