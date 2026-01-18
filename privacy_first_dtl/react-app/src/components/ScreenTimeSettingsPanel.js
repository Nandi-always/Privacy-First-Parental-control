import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { screenTimeService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const ScreenTimeSettingsPanel = ({ childId }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dailyLimit: 180, // 3 hours
    warningThreshold: 30, // 30 minutes left
    enforceBedtime: true,
    bedtimeStart: '22:00',
    bedtimeEnd: '06:00',
    schoolHours: true,
    schoolStart: '08:00',
    schoolEnd: '15:00',
    allowBreak: false,
    breakDuration: 5,
    breakInterval: 30
  });

  useEffect(() => {
    fetchScreenTimeSettings();
  }, [childId]);

  const fetchScreenTimeSettings = async () => {
    if (!childId) return;
    try {
      setLoading(true);
      // Fetch existing settings if available
      const res = await screenTimeService.getByChild(childId);
      if (res.data) {
        setFormData(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Failed to fetch screen time settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!childId) {
      notify.error('Please select a child first');
      return;
    }

    try {
      setLoading(true);
      await screenTimeService.update(childId, formData);
      notify.success('Screen time settings saved successfully!');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card screen-time-settings">
      <div className="card-header">
        <h3>⏱️ Screen Time Settings</h3>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Daily Limit */}
        <div className="settings-section">
          <h4>Daily Limit</h4>
          <div className="form-group">
            <label>Daily Screen Time Limit (minutes)</label>
            <input
              type="number"
              name="dailyLimit"
              value={formData.dailyLimit}
              onChange={handleChange}
              min="30"
              step="15"
            />
            <small>Current: {Math.floor(formData.dailyLimit / 60)}h {formData.dailyLimit % 60}m</small>
          </div>

          <div className="form-group">
            <label>Send Warning When (minutes left)</label>
            <input
              type="number"
              name="warningThreshold"
              value={formData.warningThreshold}
              onChange={handleChange}
              min="5"
              step="5"
            />
          </div>
        </div>

        {/* Bedtime Restrictions */}
        <div className="settings-section">
          <div className="section-header">
            <h4>Bedtime Restrictions</h4>
            <label className="toggle">
              <input
                type="checkbox"
                name="enforceBedtime"
                checked={formData.enforceBedtime}
                onChange={handleChange}
              />
              <span>Enable</span>
            </label>
          </div>

          {formData.enforceBedtime && (
            <div className="form-row">
              <div className="form-group">
                <label>Bedtime Starts</label>
                <input
                  type="time"
                  name="bedtimeStart"
                  value={formData.bedtimeStart}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Bedtime Ends</label>
                <input
                  type="time"
                  name="bedtimeEnd"
                  value={formData.bedtimeEnd}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>

        {/* School Hours */}
        <div className="settings-section">
          <div className="section-header">
            <h4>School Hours Restrictions</h4>
            <label className="toggle">
              <input
                type="checkbox"
                name="schoolHours"
                checked={formData.schoolHours}
                onChange={handleChange}
              />
              <span>Enable</span>
            </label>
          </div>

          {formData.schoolHours && (
            <div className="form-row">
              <div className="form-group">
                <label>School Starts</label>
                <input
                  type="time"
                  name="schoolStart"
                  value={formData.schoolStart}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>School Ends</label>
                <input
                  type="time"
                  name="schoolEnd"
                  value={formData.schoolEnd}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>

        {/* Break Intervals */}
        <div className="settings-section">
          <div className="section-header">
            <h4>Enforce Breaks</h4>
            <label className="toggle">
              <input
                type="checkbox"
                name="allowBreak"
                checked={formData.allowBreak}
                onChange={handleChange}
              />
              <span>Enable</span>
            </label>
          </div>

          {formData.allowBreak && (
            <div className="form-row">
              <div className="form-group">
                <label>Break Duration (minutes)</label>
                <input
                  type="number"
                  name="breakDuration"
                  value={formData.breakDuration}
                  onChange={handleChange}
                  min="1"
                  step="1"
                />
              </div>
              <div className="form-group">
                <label>After Every (minutes)</label>
                <input
                  type="number"
                  name="breakInterval"
                  value={formData.breakInterval}
                  onChange={handleChange}
                  min="10"
                  step="5"
                />
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="info-box">
          <AlertCircle size={18} />
          <p>Screen time is tracked and enforced across all devices</p>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScreenTimeSettingsPanel;
