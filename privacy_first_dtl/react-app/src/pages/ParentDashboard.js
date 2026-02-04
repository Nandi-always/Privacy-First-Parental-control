import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3, AlertCircle, Settings, Lock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ParentHeader from '../components/ParentHeader';
import AddChildModal from '../components/AddChildModal';
import ScreenTimeCard from '../components/ScreenTimeCard';

import ActivityReport from '../components/ActivityReport';
import AlertsPanel from '../components/AlertsPanel';
import AppRulesManager from '../components/AppRulesManager';
import WebsiteRulesManager from '../components/WebsiteRulesManager';
import ScreenTimeSettingsPanel from '../components/ScreenTimeSettingsPanel';
import AppApprovalManager from '../components/AppApprovalManager';
import InternetControlPanel from '../components/InternetControlPanel';
import AppCategoryControl from '../components/AppCategoryControl';
import RiskyActivityPanel from '../components/RiskyActivityPanel';
import ActivityLogsViewer from '../components/ActivityLogsViewer';
import EmergencyTracker from '../components/EmergencyTracker';
import { childrenService, emergencyService } from '../services/apiService';
import '../styles/Dashboard.css';
import '../styles/ChildSettings.css';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const notify = useNotification();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [selectedChild, setSelectedChild] = useState(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState(null);

  // Poll for emergency alerts
  useEffect(() => {
    const checkEmergencies = async () => {
      if (!selectedChild?._id && !selectedChild?.id) return;
      try {
        const childId = selectedChild._id || selectedChild.id;
        const res = await emergencyService.getAlerts(childId);
        // Find unresolved alert
        const emergency = res.data?.find(a => !a.resolved);
        if (emergency) {
          setActiveEmergency(emergency);
        } else if (activeEmergency) {
          // Clear if resolved elsewhere
          setActiveEmergency(null);
        }
      } catch (err) {
        console.error('Failed to check emergencies', err);
      }
    };

    if (selectedChild) {
      checkEmergencies();
      const interval = setInterval(checkEmergencies, 5000); // Check every 5s
      return () => clearInterval(interval);
    }
  }, [selectedChild, activeEmergency]);

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

  const handleDeleteChild = async (e, child) => {
    e.stopPropagation(); // Prevent card selection
    if (window.confirm(`Are you sure you want to delete ${child.name}? This will permanently remove all their data and rules.`)) {
      try {
        const childId = child._id || child.id;
        await childrenService.delete(childId);
        notify.success('Child account deleted successfully');

        // If the deleted child was selected, select the next available one or null
        const remainingChildren = children.filter(c => (c._id || c.id) !== childId);
        if (selectedChild && (selectedChild._id === childId || selectedChild.id === childId)) {
          if (remainingChildren.length > 0) {
            setSelectedChild(remainingChildren[0]);
          } else {
            setSelectedChild(null);
          }
        }

        fetchChildren();
      } catch (err) {
        console.error('Failed to delete child', err);
        notify.error('Failed to delete child account');
      }
    }
  };

  return (
    <div className="dashboard parent-dashboard">
      <ParentHeader user={user} childrenList={children} onLogout={handleLogout} />
      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onSuccess={handleAddChildSuccess}
      />

      {/* Emergency Overlay */}
      {activeEmergency && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, width: '400px', maxWidth: '90vw' }}>
          <EmergencyTracker
            alert={activeEmergency}
            onMarkSafe={() => setActiveEmergency(null)}
          />
        </div>
      )}

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
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              <Lock size={20} />
              <span>App Rules</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <AlertCircle size={20} />
              <span>Alerts</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <BarChart3 size={20} />
              <span>Activity Logs</span>
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
                      <button
                        className="delete-child-btn"
                        onClick={(e) => handleDeleteChild(e, child)}
                        title="Delete Child Account"
                      >
                        <Trash2 size={16} />
                      </button>
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
                    {/* ActivityLogsViewer displays detailed logs, ActivityReport is summary */}
                    <ActivityReport child={selectedChild} />

                    {/* Risky Activity Summary */}
                    <div className="card alerts-summary">
                      <h3>Risky Activity Status</h3>
                      <RiskyActivityPanel childId={selectedChild?._id || selectedChild?.id} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && selectedChild && (
                <div className="tab-content settings-tab">
                  <h2>⚙️ Child Settings - {selectedChild.name}</h2>
                  <div className="settings-grid">
                    <ScreenTimeSettingsPanel childId={selectedChild._id || selectedChild.id} />
                    <AppCategoryControl childId={selectedChild._id || selectedChild.id} />
                    <InternetControlPanel childId={selectedChild._id || selectedChild.id} />
                  </div>

                  <div className="danger-zone-container" style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
                    <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
                      <div className="card-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <AlertCircle size={20} color="var(--danger-color)" />
                        <h3 style={{ color: 'var(--danger-color)' }}>Danger Zone</h3>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Delete Child Account</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Once you delete a child account, there is no going back. Please be certain.
                          </p>
                        </div>
                        <button
                          className="btn"
                          onClick={(e) => handleDeleteChild(e, selectedChild)}
                          style={{ background: 'var(--danger-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600' }}
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rules' && selectedChild && (
                <div className="tab-content rules-tab">
                  <h2>🔒 Control Rules - {selectedChild.name}</h2>
                  <div className="rules-grid">
                    <AppRulesManager childId={selectedChild._id || selectedChild.id} />
                    <WebsiteRulesManager childId={selectedChild._id || selectedChild.id} />
                    <AppApprovalManager childId={selectedChild._id || selectedChild.id} />
                  </div>
                </div>
              )}



              {activeTab === 'alerts' && (
                <div className="tab-content">
                  <h2>Alerts & Notifications</h2>
                  <AlertsPanel child={selectedChild} />
                  <div style={{ marginTop: '24px' }}>
                    <RiskyActivityPanel childId={selectedChild?._id || selectedChild?.id} />
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="tab-content">
                  <h2>Activity Logs</h2>
                  <ActivityLogsViewer childId={selectedChild?._id || selectedChild?.id} />
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
