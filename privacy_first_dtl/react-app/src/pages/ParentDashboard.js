import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, BarChart3, MapPin, AlertCircle, Users } from 'lucide-react';
import ParentHeader from '../components/ParentHeader';
import ScreenTimeCard from '../components/ScreenTimeCard';
import LocationMap from '../components/LocationMap';
import ActivityReport from '../components/ActivityReport';
import AlertsPanel from '../components/AlertsPanel';
import '../styles/Dashboard.css';

const ParentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([
    { id: 1, name: 'John', age: 12, screenTime: 45, limit: 60, status: 'active' },
    { id: 2, name: 'Sarah', age: 14, screenTime: 30, limit: 90, status: 'active' }
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChild, setSelectedChild] = useState(children[0]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleAddChild = () => {
    alert('Add child functionality - would open modal');
  };

  return (
    <div className="dashboard parent-dashboard">
      <ParentHeader user={user} onLogout={handleLogout} />
      
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={20} />
              <span>Overview</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'screentime' ? 'active' : ''}`}
              onClick={() => setActiveTab('screentime')}
            >
              <Users size={20} />
              <span>Children</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'locations' ? 'active' : ''}`}
              onClick={() => setActiveTab('locations')}
            >
              <MapPin size={20} />
              <span>Locations</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <AlertCircle size={20} />
              <span>Alerts</span>
            </button>
          </nav>

          <button className="add-child-btn" onClick={handleAddChild}>
            <Plus size={20} />
            <span>Add Child</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {/* Children Quick View */}
          <div className="children-selector">
            {children.map(child => (
              <div 
                key={child.id}
                className={`child-card ${selectedChild.id === child.id ? 'selected' : ''}`}
                onClick={() => setSelectedChild(child)}
              >
                <div className="child-avatar">{child.name.charAt(0)}</div>
                <div className="child-info">
                  <h4>{child.name}</h4>
                  <p>Age {child.age}</p>
                </div>
                <div className={`status-badge ${child.status}`}>{child.status}</div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="tab-content overview-tab">
              <div className="content-grid">
                {/* Screen Time Widget */}
                <ScreenTimeCard 
                  child={selectedChild}
                  onEdit={() => alert('Edit screen time settings')}
                />

                {/* Activity Report */}
                <ActivityReport child={selectedChild} />

                {/* Alerts Summary */}
                <div className="card alerts-summary">
                  <h3>Recent Alerts</h3>
                  <div className="alerts-list">
                    <div className="alert-item warning">
                      <AlertCircle size={18} />
                      <div>
                        <p className="alert-title">Screen Time Approaching</p>
                        <p className="alert-time">10 min left • {selectedChild.name}</p>
                      </div>
                    </div>
                    <div className="alert-item info">
                      <AlertCircle size={18} />
                      <div>
                        <p className="alert-title">App Installed</p>
                        <p className="alert-time">YouTube • {selectedChild.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'screentime' && (
            <div className="tab-content">
              <h2>Screen Time Management</h2>
              <div className="children-grid">
                {children.map(child => (
                  <ScreenTimeCard key={child.id} child={child} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="tab-content">
              <h2>Location Tracking</h2>
              <LocationMap child={selectedChild} />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="tab-content">
              <h2>Alerts & Notifications</h2>
              <AlertsPanel child={selectedChild} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
