import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Package } from 'lucide-react';
import { downloadAlertService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const AppApprovalManager = ({ childId }) => {
  const notify = useNotification();
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvedApps, setApprovedApps] = useState([]);

  const fetchPendingApps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await downloadAlertService.getByChild(childId);
      const pending = res.data?.filter(app => app.status === 'PENDING') || [];
      const approved = res.data?.filter(app => app.status === 'APPROVED') || [];
      setPendingApps(pending);
      setApprovedApps(approved);
    } catch (err) {
      console.error('Failed to fetch app downloads', err);
      notify.error('Failed to load app downloads');
    } finally {
      setLoading(false);
    }
  }, [childId, notify]);

  useEffect(() => {
    if (childId) {
      fetchPendingApps();
    }
  }, [childId, fetchPendingApps]);

  const handleApprove = async (alertId) => {
    try {
      await downloadAlertService.approve(alertId);
      notify.success('App approved!');
      fetchPendingApps();
    } catch (err) {
      notify.error('Failed to approve app');
    }
  };

  const handleBlock = async (alertId) => {
    try {
      await downloadAlertService.block(alertId);
      notify.success('App blocked!');
      fetchPendingApps();
    } catch (err) {
      notify.error('Failed to block app');
    }
  };

  return (
    <div className="card app-approval-manager">
      <div className="card-header">
        <h3>📦 App Approvals</h3>
        <span className="badge">{pendingApps.length} Pending</span>
      </div>

      {loading ? (
        <p className="loading-text">Loading apps...</p>
      ) : (
        <>
          {/* Pending Apps */}
          {pendingApps.length > 0 && (
            <div className="approval-section">
              <h4>⏳ Pending Approval</h4>
              <div className="apps-list">
                {pendingApps.map(app => (
                  <div key={app._id} className="app-item pending">
                    <div className="app-info">
                      <Package size={24} className="app-icon" />
                      <div className="app-details">
                        <p className="app-name">{app.appName}</p>
                        <p className="app-timestamp">
                          {new Date(app.downloadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="app-actions">
                      <button
                        className="btn-icon approve"
                        onClick={() => handleApprove(app._id)}
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        className="btn-icon block"
                        onClick={() => handleBlock(app._id)}
                        title="Block"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Apps */}
          {approvedApps.length > 0 && (
            <div className="approval-section">
              <h4>✅ Approved Apps</h4>
              <div className="apps-list">
                {approvedApps.map(app => (
                  <div key={app._id} className="app-item approved">
                    <div className="app-info">
                      <Package size={24} className="app-icon" />
                      <div className="app-details">
                        <p className="app-name">{app.appName}</p>
                        <p className="app-status">Approved</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingApps.length === 0 && approvedApps.length === 0 && (
            <p className="empty-state">No app downloads yet</p>
          )}
        </>
      )}
    </div>
  );
};

export default AppApprovalManager;
