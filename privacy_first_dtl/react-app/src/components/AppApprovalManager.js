import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { appApprovalsService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const AppApprovalManager = ({ childId }) => {
  const notify = useNotification();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [responseText, setResponseText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await appApprovalsService.getRequests(filter);
      // Filter by childId if provided
      const filteredRequests = childId
        ? (res.data || []).filter(r => r.child?._id === childId || r.child === childId)
        : (res.data || []);
      setRequests(filteredRequests);
    } catch (err) {
      console.error('Failed to fetch approval requests', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filter, childId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId) => {
    try {
      await appApprovalsService.approve(requestId, responseText || 'Approved by parent');
      notify.success('App request approved!');
      setSelectedRequest(null);
      setResponseText('');
      fetchRequests();
    } catch (err) {
      notify.error('Failed to approve request');
    }
  };

  const handleDeny = async (requestId) => {
    try {
      await appApprovalsService.deny(requestId, responseText || 'Denied by parent');
      notify.success('App request denied');
      setSelectedRequest(null);
      setResponseText('');
      fetchRequests();
    } catch (err) {
      notify.error('Failed to deny request');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      educational: '📚',
      game: '🎮',
      social: '💬',
      productivity: '📊',
      entertainment: '🎬',
      communication: '📞',
      other: '📱'
    };
    return icons[category] || '📱';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', text: '⏳ Pending' },
      approved: { bg: '#d1fae5', color: '#065f46', text: '✅ Approved' },
      denied: { bg: '#fee2e2', color: '#991b1b', text: '❌ Denied' }
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        background: s.bg,
        color: s.color
      }}>
        {s.text}
      </span>
    );
  };

  return (
    <div className="card app-approval-manager">
      <div className="card-header">
        <h3>📲 App Approval Requests</h3>
        <button className="btn btn-secondary" onClick={fetchRequests} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['pending', 'approved', 'denied', 'all'].map(f => (
          <button
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '6px 16px', textTransform: 'capitalize' }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <Clock size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No {filter === 'all' ? '' : filter} app requests</p>
          {filter === 'pending' && (
            <p style={{ fontSize: '14px' }}>When your child requests a new app, it will appear here.</p>
          )}
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(request => (
            <div key={request._id} className="request-item" style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{getCategoryIcon(request.appCategory)}</span>
                    <h4 style={{ margin: 0 }}>{request.appName}</h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    <strong>From:</strong> {request.child?.name || 'Child'}
                  </p>
                  {request.requestReason && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#374151' }}>
                      <strong>Reason:</strong> "{request.requestReason}"
                    </p>
                  )}
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                    Requested: {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                  {request.parentResponse && (
                    <p style={{
                      margin: '8px 0 0 0',
                      padding: '8px 12px',
                      background: request.status === 'approved' ? '#d1fae5' : '#fee2e2',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}>
                      <strong>Your response:</strong> {request.parentResponse}
                    </p>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-success"
                      style={{ padding: '8px 16px' }}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '8px 16px', background: '#dc2626' }}
                      onClick={() => {
                        setSelectedRequest(request);
                        // Show deny modal
                      }}
                    >
                      <X size={16} /> Deny
                    </button>
                  </div>
                )}
              </div>

              {/* Response Modal */}
              {selectedRequest?._id === request._id && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                    Add a message for your child (optional):
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="e.g., You can use this app for 1 hour per day..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      minHeight: '80px',
                      marginBottom: '12px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(request._id)}
                    >
                      ✅ Approve App
                    </button>
                    <button
                      className="btn"
                      style={{ background: '#dc2626', color: 'white' }}
                      onClick={() => handleDeny(request._id)}
                    >
                      ❌ Deny App
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedRequest(null);
                        setResponseText('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppApprovalManager;
