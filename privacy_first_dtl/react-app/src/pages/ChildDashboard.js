import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Clock, MapPin, BookOpen, AlertCircle, Home } from 'lucide-react';
import ChildHeader from '../components/ChildHeader';
import PrivacyScoreCard from '../components/PrivacyScoreCard';
import ScreenTimeWidget from '../components/ScreenTimeWidget';
import '../styles/Dashboard.css';

const ChildDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const childData = {
    name: 'Alex',
    age: 12,
    privacyScore: 78,
    screenTime: { used: 45, limit: 60 },
    agreements: 2,
    location: 'At Home'
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleSOS = () => {
    alert('🆘 SOS Alert sent to parents with your location!');
  };

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
          </nav>

          <button className="sos-btn" onClick={handleSOS}>
            <span className="sos-text">🆘 SOS</span>
            <span>Emergency Alert</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {activeTab === 'home' && (
            <div className="tab-content home-tab">
              <div className="welcome-banner">
                <h1>Welcome, {childData.name}! 👋</h1>
                <p>Here's your activity overview for today</p>
              </div>

              <div className="home-grid">
                {/* Privacy Score */}
                <PrivacyScoreCard score={childData.privacyScore} />

                {/* Screen Time Today */}
                <ScreenTimeWidget 
                  used={childData.screenTime.used}
                  limit={childData.screenTime.limit}
                />

                {/* Location Status */}
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

                {/* Agreements */}
                <div className="card agreements-card">
                  <div className="card-header">
                    <Shield size={24} />
                    <h3>My Agreements</h3>
                  </div>
                  <div className="agreement-info">
                    <p className="agreement-count">{childData.agreements}</p>
                    <p className="agreement-label">Active Agreements</p>
                    <button className="view-btn">View Details →</button>
                  </div>
                </div>

                {/* Notifications */}
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
              <h2>📍 My Location</h2>
              <div className="card">
                <div className="map-placeholder">
                  <MapPin size={64} />
                  <p>Map integration coming soon</p>
                  <p style={{ fontSize: '0.9em', color: '#999' }}>Current location: {childData.location}</p>
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
                    <button className="btn-agree">Agree</button>
                    <button className="btn-decline">Decline</button>
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
        </main>
      </div>
    </div>
  );
};

export default ChildDashboard;
