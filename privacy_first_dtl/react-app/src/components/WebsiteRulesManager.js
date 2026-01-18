import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Globe } from 'lucide-react';
import { rulesService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const WebsiteRulesManager = ({ childId }) => {
  const notify = useNotification();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    websiteUrl: '',
    action: 'BLOCK', // BLOCK or LIMIT
    timeLimit: 30,
    allowedStartTime: '09:00',
    allowedEndTime: '21:00'
  });

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await rulesService.getAll(childId);
      const websiteRules = res.data?.filter(r => r.websiteUrl) || [];
      setRules(websiteRules);
    } catch (err) {
      console.error('Failed to fetch website rules', err);
      // Silently fail if backend is not available
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    if (childId) fetchRules();
  }, [childId, fetchRules]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.websiteUrl || !childId) {
      notify.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingRule) {
        await rulesService.update(editingRule._id, { ...formData, child: childId });
        notify.success('Website rule updated!');
      } else {
        await rulesService.create({ ...formData, child: childId, type: 'WEBSITE' });
        notify.success('Website rule created!');
      }
      resetForm();
      fetchRules();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save rule');
    }
  };

  const handleDelete = async (ruleId) => {
    if (window.confirm('Delete this website rule?')) {
      try {
        await rulesService.delete(ruleId);
        notify.success('Rule deleted!');
        fetchRules();
      } catch (err) {
        notify.error('Failed to delete rule');
      }
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData(rule);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      websiteUrl: '',
      action: 'BLOCK',
      timeLimit: 30,
      allowedStartTime: '09:00',
      allowedEndTime: '21:00'
    });
    setShowForm(false);
  };

  return (
    <div className="card website-rules-manager">
      <div className="card-header">
        <h3>🌐 Website Rules</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} /> Add Rule
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rule-form">
          <div className="form-group">
            <label>Website URL *</label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="e.g., youtube.com, facebook.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Action *</label>
            <select name="action" value={formData.action} onChange={handleChange}>
              <option value="BLOCK">Block Completely</option>
              <option value="LIMIT">Limit Time</option>
            </select>
          </div>

          {formData.action === 'LIMIT' && (
            <>
              <div className="form-group">
                <label>Time Limit (minutes)</label>
                <input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  min="5"
                  step="5"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="allowedStartTime"
                    value={formData.allowedStartTime}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    name="allowedEndTime"
                    value={formData.allowedEndTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="loading-text">Loading rules...</p>
      ) : rules.length === 0 ? (
        <p className="empty-state">No website rules set yet. Add one to get started!</p>
      ) : (
        <div className="rules-list">
          {rules.map(rule => (
            <div key={rule._id} className="rule-item">
              <div className="rule-info">
                <div className="rule-header">
                  <Globe size={18} />
                  <h4>{rule.websiteUrl}</h4>
                  <span className={`rule-badge ${rule.action.toLowerCase()}`}>
                    {rule.action === 'BLOCK' ? '🚫 Blocked' : '⏱️ Limited'}
                  </span>
                </div>
              </div>
              <div className="rule-actions">
                <button 
                  className="btn-icon edit"
                  onClick={() => handleEdit(rule)}
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="btn-icon delete"
                  onClick={() => handleDelete(rule._id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebsiteRulesManager;
