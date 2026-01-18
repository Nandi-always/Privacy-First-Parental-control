import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Clock, Ban } from 'lucide-react';
import { appRuleService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const AppRulesManager = ({ childId }) => {
  const notify = useNotification();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    appName: '',
    appPackage: '',
    action: 'BLOCK', // BLOCK or LIMIT
    timeLimit: 60,
    allowedStartTime: '09:00',
    allowedEndTime: '21:00',
    allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await appRuleService.getByChild(childId);
      setRules(res.data || []);
    } catch (err) {
      console.error('Failed to fetch app rules', err);
      notify.error('Failed to load app rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (childId) fetchRules();
  }, [childId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      allowedDays: prev.allowedDays.includes(day)
        ? prev.allowedDays.filter(d => d !== day)
        : [...prev.allowedDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appName || !childId) {
      notify.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingRule) {
        await appRuleService.update(editingRule._id, { ...formData, child: childId });
        notify.success('Rule updated successfully!');
      } else {
        await appRuleService.create({ ...formData, child: childId });
        notify.success('Rule created successfully!');
      }
      resetForm();
      fetchRules();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save rule');
    }
  };

  const handleDelete = async (ruleId) => {
    if (window.confirm('Delete this rule?')) {
      try {
        await appRuleService.delete(ruleId);
        notify.success('Rule deleted successfully!');
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
      appName: '',
      appPackage: '',
      action: 'BLOCK',
      timeLimit: 60,
      allowedStartTime: '09:00',
      allowedEndTime: '21:00',
      allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });
    setShowForm(false);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="card app-rules-manager">
      <div className="card-header">
        <h3>📱 App Rules</h3>
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
            <label>App Name *</label>
            <input
              type="text"
              name="appName"
              value={formData.appName}
              onChange={handleChange}
              placeholder="e.g., YouTube, TikTok"
              required
            />
          </div>

          <div className="form-group">
            <label>App Package</label>
            <input
              type="text"
              name="appPackage"
              value={formData.appPackage}
              onChange={handleChange}
              placeholder="e.g., com.google.android.youtube"
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

              <div className="form-group">
                <label>Allowed Days</label>
                <div className="days-selector">
                  {days.map(day => (
                    <label key={day} className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.allowedDays.includes(day)}
                        onChange={() => handleDayChange(day)}
                      />
                      {day.substring(0, 3)}
                    </label>
                  ))}
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
        <p className="empty-state">No app rules set yet. Add one to get started!</p>
      ) : (
        <div className="rules-list">
          {rules.map(rule => (
            <div key={rule._id} className="rule-item">
              <div className="rule-info">
                <div className="rule-header">
                  {rule.action === 'BLOCK' ? <Ban size={18} /> : <Clock size={18} />}
                  <h4>{rule.appName}</h4>
                  <span className={`rule-badge ${rule.action.toLowerCase()}`}>
                    {rule.action === 'BLOCK' ? '🚫 Blocked' : '⏱️ Limited'}
                  </span>
                </div>
                {rule.action === 'LIMIT' && (
                  <p className="rule-details">
                    {rule.timeLimit} mins • {rule.allowedStartTime}-{rule.allowedEndTime}
                  </p>
                )}
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

export default AppRulesManager;
