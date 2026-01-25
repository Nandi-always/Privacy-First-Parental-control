import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, MapPin, BookOpen, AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ChildHeader from '../components/ChildHeader';
import PrivacyScoreCard from '../components/PrivacyScoreCard';
import ScreenTimeWidget from '../components/ScreenTimeWidget';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { locationService, emergencyService } from '../services/apiService';
import MAP_CONFIG from '../config/mapsConfig';
import '../styles/Dashboard.css';
import '../styles/Cards.css';

const ChildDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState('home');
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLocation, setReportLocation] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [sendingSOS, setSendingSOS] = useState(false);

  const { isLoaded } = useJsApiLoader(MAP_CONFIG);
  const isMapKeyPlaceholder = MAP_CONFIG.isPlaceholder;

  useEffect(() => {
    // Initialize child data from user or fetch from API
    if (user) {
      setChildData({
        name: user.name || 'Child',
        age: user.age || 12,
        privacyScore: 78,
        screenTime: { used: 45, limit: 60 },
        agreements: 2,
        location: 'At Home'
      });
    }
    setLoading(false);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSOS = async () => {
    try {
      setSendingSOS(true);
      const childId = user._id || user.id;

      // Get current location if possible, otherwise send empty (backend handles it)
      await emergencyService.sendSOS(childId, {
        latitude: reportLocation?.latitude || 0,
        longitude: reportLocation?.longitude || 0,
        message: 'Child triggered SOS Emergency Alert'
      });

      notify.warning('🆘 SOS Alert sent to parents with your location!');
    } catch (err) {
      console.error('Failed to send SOS', err);
      notify.error('Failed to send SOS alert. Please try calling your parents directly!');
    } finally {
      setSendingSOS(false);
    }
  };

  const handleAgreeRule = () => {
    notify.success('Rule agreement saved!');
  };

  const handleDeclineRule = () => {
    notify.info('Rule decline recorded');
  };

  const handleMapClick = (e) => {
    setReportLocation({
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng()
    });
  };

  const handleReportLocation = async () => {
    if (!reportLocation) {
      notify.error('Please select a location on the map first');
      return;
    }

    try {
      setReporting(true);
      const childId = user._id || user.id;
      await locationService.updateLocation(childId, {
        latitude: reportLocation.latitude,
        longitude: reportLocation.longitude,
        address: 'Manual Check-in',
        accuracy: 5
      });

      notify.success('Location reported successfully!');
      setChildData(prev => ({ ...prev, location: 'Manual Check-in' }));
    } catch (err) {
      console.error('Failed to report location', err);
      notify.error('Failed to report location to parents');
    } finally {
      setReporting(false);
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
              className={`nav-item ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              <MapPin size={20} />
              <span>My Location</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              <BookOpen size={20} />
              <span>My Rules</span>
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
                        <p>App Usage, Screen Time, Location</p>
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
                    <button className="action-btn" onClick={() => notify.info('Request for more time sent!')}>
                      <span>⏱️</span> More Time
                    </button>
                    <button className="action-btn" onClick={() => notify.info('Request to unblock app sent!')}>
                      <span>🔓</span> Unblock App
                    </button>
                    <button className="action-btn" onClick={() => notify.info('Message sent to parents!')}>
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

                {/* Location Status (Existing) */}
                <div className="card location-status">
                  <div className="card-header">
                    <MapPin size={24} />
                    <h3>My Location</h3>
                  </div>
                  <div className="location-info">
                    <div className="location-badge">{childData.location}</div>
                    <p className="location-time">Last updated: Just now</p>
                  </div>
                </div>

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

          {activeTab === 'location' && (
            <div className="tab-content">
              <h2>📍 Location Transparency</h2>
              <div className="card transparency-dashboard">
                <div className="status-banner info">
                  <Shield size={24} />
                  <div>
                    <h4>Privacy-First Geofencing Active</h4>
                    <p>Live tracking is disabled. Parents only see when you enter or leave safe zones.</p>
                  </div>
                </div>

                <div className="active-zones-list">
                  <h3>Monitored Zones</h3>
                  {childData.geofences && childData.geofences.length > 0 ? (
                    childData.geofences.map((zone, idx) => (
                      <div key={idx} className="zone-transparency-item">
                        <div className="zone-info">
                          <MapPin size={18} />
                          <strong>{zone.name}</strong>
                          <span className="zone-radius">({zone.radius}m radius)</span>
                        </div>
                        <div className="zone-time">
                          <Clock size={16} />
                          <span>{zone.startTime || 'Always'} - {zone.endTime || 'Always'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-zones-msg">No active safe zones defined.</p>
                  )}
                </div>

                <div className="manual-report-section" style={{ marginTop: '30px' }}>
                  <h3>Test: Report Specific Location</h3>
                  <p className="instruction-text">Enter coordinates manually to test the Parent's range alert.</p>

                  <div className="manual-coord-entry" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      className="zone-input"
                      style={{ flex: 1 }}
                      onChange={(e) => setReportLocation(prev => ({ ...prev, latitude: parseFloat(e.target.value), longitude: prev?.longitude || 77.5946 }))}
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      className="zone-input"
                      style={{ flex: 1 }}
                      onChange={(e) => setReportLocation(prev => ({ ...prev, longitude: parseFloat(e.target.value), latitude: prev?.latitude || 12.9716 }))}
                    />
                  </div>

                  <p className="instruction-text">Or pick on map (if enabled):</p>
                  <div className="map-container" style={{ height: '200px', marginBottom: '15px', borderRadius: '12px', overflow: 'hidden' }}>
                    {isLoaded && !isMapKeyPlaceholder ? (
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={reportLocation ? { lat: reportLocation.latitude, lng: reportLocation.longitude } : { lat: 12.9716, lng: 77.5946 }}
                        zoom={13}
                        onClick={handleMapClick}
                      >
                        {reportLocation && <Marker position={{ lat: reportLocation.latitude, lng: reportLocation.longitude }} />}
                      </GoogleMap>
                    ) : (
                      <div className="map-placeholder" style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f3f4f6',
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '20px'
                      }}>
                        <div>
                          <MapPin size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                          <p>Interactive map is disabled because no valid API key was found.</p>
                          <p style={{ fontSize: '12px' }}>Please add your Google Maps API key to the .env file.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="btn-primary report-btn" onClick={handleReportLocation} disabled={reporting || !reportLocation}>
                    {reporting ? 'Sending Check-in...' : 'Send Manual Report'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="tab-content">
              <h2>📋 My Rules & Agreements</h2>
              <div className="rules-grid">
                <div className="rule-card">
                  <div className="rule-status pending">Pending Agreement</div>
                  <h4>Social Media Limit</h4>
                  <p>Maximum 1 hour per day for TikTok and Instagram</p>
                  <div className="rule-actions">
                    <button className="btn-agree" onClick={handleAgreeRule}>Agree</button>
                    <button className="btn-decline" onClick={handleDeclineRule}>Decline</button>
                  </div>
                </div>

                <div className="rule-card">
                  <div className="rule-status agreed">Agreed ✓</div>
                  <h4>Bedtime Internet Cutoff</h4>
                  <p>No internet after 10 PM on school nights</p>
                </div>

                <div className="rule-card">
                  <div className="rule-status agreed">Agreed ✓</div>
                  <h4>Gaming Time Limit</h4>
                  <p>Maximum 2 hours on weekends</p>
                </div>
              </div>
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
                        <li>General geographic location</li>
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
