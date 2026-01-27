import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Globe, Shield, Clock, AlertTriangle } from 'lucide-react';
import { websiteRulesService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const CATEGORY_OPTIONS = [
  { value: 'social_media', label: '📱 Social Media', icon: '📱' },
  { value: 'adult_content', label: '🔞 Adult Content', icon: '🔞' },
  { value: 'gaming', label: '🎮 Gaming', icon: '🎮' },
  { value: 'shopping', label: '🛒 Shopping', icon: '🛒' },
  { value: 'streaming', label: '📺 Streaming', icon: '📺' },
  { value: 'educational', label: '📚 Educational', icon: '📚' },
  { value: 'news', label: '📰 News', icon: '📰' },
  { value: 'other', label: '🌐 Other', icon: '🌐' }
];

const PRESET_FILTERS = [
  { name: 'Block All Social Media', websites: ['facebook.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'snapchat.com'], category: 'social_media' },
  { name: 'Block Adult Content', websites: ['adult-sites'], category: 'adult_content' },
  { name: 'Block Gaming Sites', websites: ['roblox.com', 'minecraft.net', 'steam.com', 'twitch.tv'], category: 'gaming' },
  { name: 'Block Streaming', websites: ['youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com'], category: 'streaming' }
];

const WebsiteRulesManagerEnhanced = ({ childId }) => {
  const notify = useNotification();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [blockedAttempts, setBlockedAttempts] = useState({ totalAttempts: 0, blockedSites: [] });
  const [formData, setFormData] = useState({
    website: '',
    isBlocked: true,
    category: 'other',
    blockReason: 'Blocked by parent',
    allowedTimeSlots: []
  });

  const fetchRules = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      const res = await websiteRulesService.getAll(childId);
      setRules(res.data || []);
    } catch (err) {
      console.error('Failed to fetch website rules', err);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  const fetchBlockedAttempts = useCallback(async () => {
    if (!childId) return;
    try {
      const res = await websiteRulesService.getBlockedAttempts(childId);
      setBlockedAttempts(res.data || { totalAttempts: 0, blockedSites: [] });
    } catch (err) {
      console.error('Failed to fetch blocked attempts', err);
    }
  }, [childId]);

  useEffect(() => {
    fetchRules();
    fetchBlockedAttempts();
  }, [childId, fetchRules, fetchBlockedAttempts]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.website || !childId) {
      notify.error('Please enter a website URL');
      return;
    }

    try {
      if (editingRule) {
        await websiteRulesService.update(editingRule._id, formData);
        notify.success('Website rule updated!');
      } else {
        await websiteRulesService.create({ ...formData, childId });
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
        await websiteRulesService.delete(ruleId);
        notify.success('Rule deleted!');
        fetchRules();
      } catch (err) {
        notify.error('Failed to delete rule');
      }
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      website: rule.website,
      isBlocked: rule.isBlocked,
      category: rule.category || 'other',
      blockReason: rule.blockReason || 'Blocked by parent',
      allowedTimeSlots: rule.allowedTimeSlots || []
    });
    setShowForm(true);
  };

  const handleApplyPreset = async (preset) => {
    try {
      for (const website of preset.websites) {
        await websiteRulesService.create({
          childId,
          website,
          isBlocked: true,
          category: preset.category,
          blockReason: `Preset: ${preset.name}`
        });
      }
      notify.success(`Applied preset: ${preset.name}`);
      fetchRules();
    } catch (err) {
      notify.error('Failed to apply preset');
    }
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      website: '',
      isBlocked: true,
      category: 'other',
      blockReason: 'Blocked by parent',
      allowedTimeSlots: []
    });
    setShowForm(false);
  };

  const getCategoryIcon = (category) => {
    const cat = CATEGORY_OPTIONS.find(c => c.value === category);
    return cat ? cat.icon : '🌐';
  };

  return (
    <div className="card website-rules-manager">
      <div className="card-header">
        <h3><Globe size={20} /> Website Filters</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add Rule
        </button>
      </div>

      {/* Blocked Attempts Summary */}
      {blockedAttempts.totalAttempts > 0 && (
        <div className="blocked-attempts-banner" style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={24} color="#d97706" />
          <div>
            <strong>{blockedAttempts.totalAttempts} blocked attempts</strong>
            <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
              Child tried to access blocked websites
            </p>
          </div>
        </div>
      )}

      {/* Preset Filters */}
      <div className="preset-filters" style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>Quick Presets:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_FILTERS.map(preset => (
            <button
              key={preset.name}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => handleApplyPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rule-form" style={{
          background: '#f9fafb',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div className="form-group">
            <label>Website URL *</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="e.g., youtube.com, facebook.com"
              required
            />
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Action</label>
              <select
                name="isBlocked"
                value={formData.isBlocked.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, isBlocked: e.target.value === 'true' }))}
              >
                <option value="true">🚫 Block Completely</option>
                <option value="false">⏰ Allow with Time Limits</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Block Reason (shown to child)</label>
            <input
              type="text"
              name="blockReason"
              value={formData.blockReason}
              onChange={handleChange}
              placeholder="Why is this website blocked?"
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-success">
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="loading-text">Loading rules...</p>
      ) : rules.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <Shield size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No website rules set yet.</p>
          <p style={{ fontSize: '14px' }}>Use quick presets above or add custom rules.</p>
        </div>
      ) : (
        <div className="rules-list">
          {rules.map(rule => (
            <div key={rule._id} className="rule-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: rule.isBlocked ? '#fef2f2' : '#f0fdf4',
              borderRadius: '8px',
              marginBottom: '8px',
              border: `1px solid ${rule.isBlocked ? '#fecaca' : '#bbf7d0'}`
            }}>
              <div className="rule-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>{getCategoryIcon(rule.category)}</span>
                  <h4 style={{ margin: 0 }}>{rule.website}</h4>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: rule.isBlocked ? '#dc2626' : '#16a34a',
                    color: 'white'
                  }}>
                    {rule.isBlocked ? '🚫 Blocked' : '✅ Limited'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  {rule.blockReason}
                  {rule.attemptCount > 0 && (
                    <span style={{ marginLeft: '8px', color: '#dc2626' }}>
                      ({rule.attemptCount} attempts)
                    </span>
                  )}
                </p>
              </div>
              <div className="rule-actions" style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={() => handleEdit(rule)} title="Edit">
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon delete" onClick={() => handleDelete(rule._id)} title="Delete">
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

export default WebsiteRulesManagerEnhanced;
