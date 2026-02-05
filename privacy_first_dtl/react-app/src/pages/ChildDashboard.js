import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, BookOpen, AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ChildHeader from '../components/ChildHeader';
import DeviceLockScreen from '../components/DeviceLockScreen';
import BlockedWebsiteScreen from '../components/BlockedWebsiteScreen';
import SafetyModeScreen from '../components/SafetyModeScreen';
import AppRequestForm from '../components/AppRequestForm';
import PrivacyScoreCard from '../components/PrivacyScoreCard';
import ScreenTimeWidget from '../components/ScreenTimeWidget';
import { emergencyService, childrenService, websiteRulesService, appApprovalsService } from '../services/apiService';
import '../styles/Dashboard.css';
import '../styles/Cards.css';

const ChildDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState('home');
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingSOS, setSendingSOS] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [blockedSite, setBlockedSite] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null);
  const [simulatedUrl, setSimulatedUrl] = useState('');


  // Real-time rules state for demo/interactivity
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Social Media Limit',
      description: 'Maximum 1 hour per day for TikTok and Instagram',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Bedtime Internet Cutoff',
      description: 'No internet after 10 PM on school nights',
      status: 'agreed'
    }
  ]);



  useEffect(() => {
    // Initialize child data from user or fetch from API
    if (user) {
      setChildData({
        name: user.name || 'Child',
        age: user.age || 12,
        privacyScore: 78,
        screenTime: { used: 45, limit: 60 },
        agreements: 2,
        location: 'At Home',
        geofences: user.geofences || []
      });
    }
    setLoading(false);
  }, [user]);

  // Poll device status every minute
  useEffect(() => {
    const checkDeviceStatus = async () => {
      if (!user || !user._id) return;

      try {
        const childId = user._id || user.id;
        const response = await childrenService.getDeviceStatus(childId);
        const status = response.data || response;

        setDeviceStatus(status);
        setShowWarning(status.shouldWarn);

        // Update screen time display with current limit
        if (status.currentLimit) {
          setChildData(prev => ({
            ...prev,
            screenTime: {
              used: status.totalTimeUsed || prev.screenTime.used,
              limit: status.currentLimit
            }
          }));
        }
      } catch (err) {
        console.error('Failed to check device status', err);
      }
    };

    // Check immediately
    checkDeviceStatus();

    // Then check every minute
    const interval = setInterval(checkDeviceStatus, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Check for active SOS status
  useEffect(() => {
    const checkSOS = async () => {
      if (!user?._id && !user?.id) return;
      try {
        const childId = user._id || user.id;
        const res = await emergencyService.getAlerts(childId);
        const active = res.data?.find(a => !a.resolved);
        if (active) {
          setActiveSOS(active);
        } else {
          setActiveSOS(null);
        }
      } catch (err) {
        console.error('Failed to check SOS', err);
      }
    };

    if (user) {
      checkSOS(); // Check immediately
      const interval = setInterval(checkSOS, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSOS = async () => {
    try {
      setSendingSOS(true);
      const childId = user._id || user.id;

      let lat = 0;
      let lng = 0;
      let locationObtained = false;

      // Try to get fresh location if possible (but don't fail if denied)
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false // Don't require high accuracy
            });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          locationObtained = true;
          console.log('✅ Location obtained for SOS:', lat, lng);
        } catch (locErr) {
          console.warn('⚠️ Could not get location for SOS (will send without):', locErr.message);
          // Continue anyway - location is optional
        }
      }

      // Send SOS (works with or without location)
      console.log('📡 Sending SOS alert...');
      await emergencyService.sendSOS(childId, {
        latitude: lat,
        longitude: lng,
        message: locationObtained
          ? 'Child triggered SOS Emergency Alert with location'
          : 'Child triggered SOS Emergency Alert (location unavailable)'
      });

      notify.warning(locationObtained
        ? '🆘 SOS Alert sent to parents with your location!'
        : '🆘 SOS Alert sent to parents!');

      // Immediately check to activate Safety Mode screen
      const res = await emergencyService.getAlerts(childId);
      const active = res.data?.find(a => !a.resolved);
      if (active) setActiveSOS(active);
    } catch (err) {
      console.error('❌ Failed to send SOS:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      notify.error(`Failed to send SOS: ${errorMsg}. Please call your parents directly!`);
    } finally {
      setSendingSOS(false);
    }
  };

  const handleAgreeRule = (id) => {
    setRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, status: 'agreed' } : rule
    ));
    notify.success('Rule agreement saved!');
  };

  const handleDeclineRule = (id) => {
    setRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, status: 'declined' } : rule
    ));
    notify.info('Rule decline recorded');
  };





  const handleSimulateVisit = async (e) => {
    e.preventDefault();
    if (!simulatedUrl) return;

    try {
      const childId = user._id || user.id;
      const res = await websiteRulesService.checkAccess(childId, simulatedUrl);
      const data = res.data;

      if (data.blocked) {
        setBlockedSite({
          website: simulatedUrl,
          reason: data.reason,
          category: data.category
        });
      } else {
        notify.success(`Access allowed to ${simulatedUrl}`);
        setSimulatedUrl('');
      }
    } catch (err) {
      console.error('Check failed', err);
    }
  };

  const handleRequestSiteAccess = async () => {
    try {
      // Create an app approval request as a proxy for website access request
      // In a real app, we'd have a separate endpoint
      const childId = user._id || user.id;
      await appApprovalsService.requestApproval(childId, {
        appName: `Website: ${blockedSite.website}`,
        appCategory: 'other',
        requestReason: 'I need to access this website'
      });
      notify.success('Access request sent to parent');
      setBlockedSite(null);
      setSimulatedUrl('');
    } catch (err) {
      notify.error('Failed to send request');
    }
  };

  if (loading || !childData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Show active safety mode screen (HIGHEST PRIORITY)
  if (activeSOS) {
    return (
      <SafetyModeScreen
        alert={activeSOS}
        childId={user._id || user.id}
        onMarkSafe={() => setActiveSOS(null)} // ✅ Immediate exit when marked safe
      />
    );
  }

  // Show lock screen if device is locked
  if (deviceStatus && deviceStatus.isLocked) {
    return (
      <DeviceLockScreen
        lockReason={deviceStatus.lockReason}
        warningMessage={deviceStatus.warningMessage}
        bedtimeEnd={childData.bedtimeEnd || '06:00'}
        remainingTime={deviceStatus.remainingTime}
      />
    );
  }

  // Show blocked website screen if active
  if (blockedSite) {
    return (
      <BlockedWebsiteScreen
        website={blockedSite.website}
        reason={blockedSite.reason}
        category={blockedSite.category}
        onRequestAccess={handleRequestSiteAccess}
        onGoHome={() => {
          setBlockedSite(null);
          setSimulatedUrl('');
        }}
      />
    );
  }

  return (
    <div className="dashboard child-dashboard">
      <ChildHeader user={user} onLogout={handleLogout} />

      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'screentime' ? 'active' : ''}`}
              onClick={() => setActiveTab('screentime')}
            >
              <Clock size={20} />
              <span>Screen Time</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              <BookOpen size={20} />
              <span>My Rules</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <RefreshCw size={20} />
              <span>App Requests</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={20} />
              <span>Privacy Center</span>
            </button>
          </nav>

          <button
            className={`sos-btn ${sendingSOS ? 'loading' : ''}`}
            onClick={handleSOS}
            disabled={sendingSOS}
          >
            <span className="sos-text">🆘 SOS</span>
            <span>{sendingSOS ? 'Sending...' : 'Emergency Alert'}</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {activeTab === 'home' && (
            <div className="tab-content home-tab">
              <div className="welcome-banner">
                <h1>Welcome, {childData.name}! 👋</h1>
                <p>Have a great day online!</p>
              </div>

              {/* Website Simulator for Demo */}
              <div className="card website-simulator" style={{ marginTop: '20px', marginBottom: '20px', border: '2px dashed #3b82f6' }}>
                <h3>🌐 Website Access Simulator</h3>
                <p>Enter a URL to test if it's blocked by your parental controls.</p>
                <form onSubmit={handleSimulateVisit} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input
                    type="text"
                    value={simulatedUrl}
                    onChange={(e) => setSimulatedUrl(e.target.value)}
                    placeholder="e.g., youtube.com"
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  />
                  <button type="submit" className="btn btn-primary">Go</button>
                </form>
              </div>

              {/* Warning Banner when time is running out */}
              {showWarning && deviceStatus && (
                <div className="warning-banner" style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  <AlertCircle size={32} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                      {deviceStatus.warningMessage || `⚠️ Only ${deviceStatus.remainingTime} minutes left!`}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                      {deviceStatus.isHomeworkHours
                        ? '📚 Homework hours are active - educational apps are still available'
                        : 'Time to wrap up your activities soon!'}
                    </p>
                  </div>
                </div>
              )}

              {/* Digital Wellbeing Tips */}
              <div className="wellbeing-tip">
                <span className="tip-icon">💡</span>
                <div className="tip-content">
                  <h4>Daily Digital Tip</h4>
                  <p>Remember to take a Break every 20 minutes to rest your eyes!</p>
                </div>
              </div>

              <div className="home-grid">
                {/* Transparency Panel */}
                <div className="card transparency-card">
                  <div className="card-header">
                    <Shield size={24} />
                    <h3>Privacy & Monitoring</h3>
                  </div>
                  <div className="transparency-list">
                    <div className="transparency-item monitored">
                      <span className="t-icon">👁️</span>
                      <div>
                        <strong>What Parents See</strong>
                        <p>App Usage, Screen Time</p>
                      </div>
                    </div>
                    <div className="transparency-item private">
                      <span className="t-icon">🔒</span>
                      <div>
                        <strong>What is Private</strong>
                        <p>Message Content, Passwords, Camera</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requests & Feedback */}
                <div className="card requests-card">
                  <div className="card-header">
                    <AlertCircle size={24} />
                    <h3>Ask Parents</h3>
                  </div>
                  <div className="quick-actions">
                    <button className="action-btn" onClick={async () => {
                      try {
                        const childId = user._id || user.id;
                        await appApprovalsService.requestApproval(childId, {
                          appName: 'Additional Screen Time',
                          appCategory: 'other',
                          requestReason: 'I need some more time to finish my work'
                        });
                        notify.success('Request for more time sent!');
                      } catch (err) {
                        notify.error('Failed to send request');
                      }
                    }}>
                      <span>⏱️</span> More Time
                    </button>
                    <button className="action-btn" onClick={async () => {
                      try {
                        const childId = user._id || user.id;
                        // Prompt for app name if not specified
                        const appName = prompt('Which app would you like to unblock?') || 'App Access';
                        await appApprovalsService.requestApproval(childId, {
                          appName: appName,
                          appCategory: 'entertainment',
                          requestReason: 'Please unblock this app for me'
                        });
                        notify.success('Request to unblock app sent!');
                      } catch (err) {
                        notify.error('Failed to send request');
                      }
                    }}>
                      <span>🔓</span> Unblock App
                    </button>
                    <button className="action-btn" onClick={() => notify.info('This feature will allow you to chat with your parents soon!')}>
                      <span>💬</span> Send Message
                    </button>
                  </div>
                </div>

                {/* Privacy Score (Existing) */}
                <PrivacyScoreCard score={childData.privacyScore} />

                {/* Screen Time Today (Existing) */}
                <ScreenTimeWidget
                  used={childData.screenTime.used}
                  limit={childData.screenTime.limit}
                />



                {/* Notifications (Existing) */}
                <div className="card notifications-card">
                  <div className="card-header">
                    <AlertCircle size={24} />
                    <h3>Notifications</h3>
                  </div>
                  <div className="notif-list">
                    <div className="notif-item">
                      <span className="notif-badge">ℹ️</span>
                      <div>
                        <p>New rule added</p>
                        <small>2 hours ago</small>
                      </div>
                    </div>
                    <div className="notif-item">
                      <span className="notif-badge">⏰</span>
                      <div>
                        <p>30 min screen time remaining</p>
                        <small>1 hour ago</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'screentime' && (
            <div className="tab-content">
              <h2>📱 Screen Time Details</h2>
              <ScreenTimeWidget
                used={childData.screenTime.used}
                limit={childData.screenTime.limit}
                detailed={true}
              />

              <div className="card" style={{ marginTop: '30px' }}>
                <h3>Today's Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="app-icon">▶️</span>
                    <div className="activity-details">
                      <p className="app-name">YouTube</p>
                      <small>25 minutes</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="app-icon">🎮</span>
                    <div className="activity-details">
                      <p className="app-name">Minecraft</p>
                      <small>20 minutes</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {activeTab === 'rules' && (
            <div className="tab-content">
              <h2>📋 My Rules & Agreements</h2>
              <div className="rules-grid">
                {rules.map(rule => (
                  <div key={rule.id} className="rule-card">
                    <div className={`rule-status ${rule.status}`}>
                      {rule.status === 'pending' ? 'Pending Agreement' :
                        rule.status === 'agreed' ? 'Agreed ✓' : 'Declined ✗'}
                    </div>
                    <h4>{rule.name}</h4>
                    <p>{rule.description}</p>
                    {rule.status === 'pending' && (
                      <div className="rule-actions">
                        <button
                          className="btn btn-agree"
                          onClick={() => handleAgreeRule(rule.id)}
                        >
                          Agree
                        </button>
                        <button
                          className="btn btn-decline"
                          onClick={() => handleDeclineRule(rule.id)}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="tab-content">
              <h2>📲 App Requests</h2>
              <AppRequestForm childId={user._id || user.id} />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="tab-content">
              <h2>🛡️ Privacy Center</h2>
              <div className="card transparency-card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <Shield size={24} />
                  <h3>Transparency Panel</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  We believe in your privacy. Here is exactly what is shared with your parents and what stays private.
                </p>
                <div className="transparency-list">
                  <div className="transparency-item monitored">
                    <span className="t-icon">👁️</span>
                    <div>
                      <strong>Monitored Data</strong>
                      <p>Used to help you stay safe and manage screen time.</p>
                      <ul style={{ fontSize: '12px', margin: '8px 0 0 16px', color: 'var(--text-secondary)' }}>
                        <li>Active app names and usage time</li>
                        <li>Total device unlock count</li>
                      </ul>
                    </div>
                  </div>
                  <div className="transparency-item private">
                    <span className="t-icon">🔒</span>
                    <div>
                      <strong>Private Data</strong>
                      <p>Your parents CANNOT see this information.</p>
                      <ul style={{ fontSize: '12px', margin: '8px 0 0 16px', color: 'var(--text-secondary)' }}>
                        <li>Content of your messages and chats</li>
                        <li>Your passwords and login details</li>
                        <li>Photos, videos, and camera feed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Optional Features</h3>
                <div className="privacy-settings-list" style={{ marginTop: '20px' }}>
                  <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <strong>Notification Ghosting</strong>
                      <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Hide notification details on the lock screen</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <div>
                      <strong>Usage Insights sharing</strong>
                      <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Show hourly breakdown to parents (Mandatory by Parent)</p>
                    </div>
                    <input type="checkbox" checked readOnly disabled />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChildDashboard;
