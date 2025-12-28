import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3, MapPin, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ParentHeader from '../components/ParentHeader';
import AddChildModal from '../components/AddChildModal';
import ScreenTimeCard from '../components/ScreenTimeCard';
import LocationMap from '../components/LocationMap';
import ActivityReport from '../components/ActivityReport';
import AlertsPanel from '../components/AlertsPanel';
import { childrenService } from '../services/apiService';
import '../styles/Dashboard.css';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const notify = useNotification();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChild, setSelectedChild] = useState(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await childrenService.getAll();
      const data = res.data || res;
      const childrenList = data.children || data;
      setChildren(childrenList);
      if (childrenList.length) setSelectedChild(childrenList[0]);
    } catch (err) {
      console.error('Failed to fetch children', err);
      notify.error('Failed to load children list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAddChild = () => {
    setShowAddChildModal(true);
  };

  const handleAddChildSuccess = () => {
    fetchChildren();
  };

  return (
    <div className="dashboard parent-dashboard">
      <ParentHeader user={user} onLogout={handleLogout} />
      <AddChildModal 
        isOpen={showAddChildModal} 
        onClose={() => setShowAddChildModal(false)}
        onSuccess={handleAddChildSuccess}
      />
      
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
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Children Quick View */}
              <div className="children-selector">
                {children.length === 0 ? (
                  <div className="no-children">
                    <p>No children added yet</p>
                    <button className="add-child-btn" onClick={handleAddChild}>
                      <Plus size={20} />
                      Add your first child
                    </button>
                  </div>
                ) : (
                  children.map((child) => (
                    <div
                      key={child._id || child.id}
                      className={`child-card ${selectedChild && (selectedChild._id === child._id || selectedChild.id === child.id) ? 'selected' : ''}`}
                      onClick={() => setSelectedChild(child)}
                    >
                      <div className="child-avatar">{(child.name && child.name.charAt(0)) || 'C'}</div>
                      <div className="child-info">
                        <h4>{child.name}</h4>
                        <p>Age {child.age || '—'}</p>
                      </div>
                      <div className={`status-badge ${child.status || 'unknown'}`}>{child.status || 'unknown'}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="tab-content overview-tab">
                  <div className="content-grid">
                    {/* Screen Time Widget */}
                    <ScreenTimeCard 
                      child={selectedChild}
                      onEdit={() => notify.info('Edit screen time functionality coming soon')}
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
                            <p className="alert-time">10 min left • {selectedChild?.name || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="alert-item info">
                          <AlertCircle size={18} />
                          <div>
                            <p className="alert-title">App Installed</p>
                            <p className="alert-time">YouTube • {selectedChild?.name || 'Unknown'}</p>
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
                      <ScreenTimeCard key={child.id || child._id} child={child} />
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
