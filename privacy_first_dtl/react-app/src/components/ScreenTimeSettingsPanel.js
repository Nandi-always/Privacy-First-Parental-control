import React, { useState, useEffect, useCallback } from 'react';
import { Save, AlertCircle, Clock, Moon, BookOpen } from 'lucide-react';
import { screenTimeService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import '../styles/ChildSettings.css';

const ScreenTimeSettingsPanel = ({ childId }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dailyLimit: 180, // 3 hours (fallback)
    weekdayLimit: 120, // 2 hours for Mon-Fri
    weekendLimit: 180, // 3 hours for Sat-Sun
    warningThreshold: 10, // 10 minutes left
    enforceBedtime: true,
    bedtimeStart: '22:00',
    bedtimeEnd: '06:00',
    schoolHours: true,
    schoolStart: '08:00',
    schoolEnd: '15:00',
    homeworkHoursEnabled: false,
    homeworkStart: '16:00',
    homeworkEnd: '19:00',
    allowBreak: false,
    breakDuration: 5,
    breakInterval: 30
  });

  const fetchScreenTimeSettings = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      // Fetch existing settings if available
      const res = await screenTimeService.get(childId);
      if (res.data) {
        setFormData(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Failed to fetch screen time settings', err);
      // Silently fail - use default settings
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchScreenTimeSettings();
  }, [childId, fetchScreenTimeSettings]);

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
        <h3><Clock size={20} /> Screen Time Settings</h3>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit} className="settings-form">
          {/* Daily Limit Section */}
          <div className="settings-section">
            <h4>📅 Daily Screen Time Limits</h4>

            <div className="form-group">
              <label>Weekday Limit (Monday - Friday, minutes)</label>
              <input
                type="number"
                name="weekdayLimit"
                value={formData.weekdayLimit}
                onChange={handleChange}
                min="30"
                step="15"
              />
              <small className="current-time">Current: {Math.floor(formData.weekdayLimit / 60)}h {formData.weekdayLimit % 60}m</small>
            </div>

            <div className="form-group">
              <label>Weekend Limit (Saturday - Sunday, minutes)</label>
              <input
                type="number"
                name="weekendLimit"
                value={formData.weekendLimit}
                onChange={handleChange}
                min="30"
                step="15"
              />
              <small className="current-time">Current: {Math.floor(formData.weekendLimit / 60)}h {formData.weekendLimit % 60}m</small>
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
              <small className="current-time">Child will be warned when {formData.warningThreshold} minutes remain</small>
            </div>
          </div>

          {/* Bedtime Restrictions Section */}
          <div className="settings-section">
            <div className="section-header">
              <h4><Moon size={18} /> Bedtime Restrictions</h4>
              <label className="toggle">
                <input
                  type="checkbox"
                  name="enforceBedtime"
                  checked={formData.enforceBedtime}
                  onChange={handleChange}
                />
                <span>{formData.enforceBedtime ? 'ON' : 'OFF'}</span>
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

          {/* Homework Hours Section */}
          <div className="settings-section">
            <div className="section-header">
              <h4><BookOpen size={18} /> Homework Hours</h4>
              <label className="toggle">
                <input
                  type="checkbox"
                  name="homeworkHoursEnabled"
                  checked={formData.homeworkHoursEnabled}
                  onChange={handleChange}
                />
                <span>{formData.homeworkHoursEnabled ? 'ON' : 'OFF'}</span>
              </label>
            </div>

            {formData.homeworkHoursEnabled && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Homework Starts</label>
                    <input
                      type="time"
                      name="homeworkStart"
                      value={formData.homeworkStart}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Homework Ends</label>
                    <input
                      type="time"
                      name="homeworkEnd"
                      value={formData.homeworkEnd}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <small className="info-text">📚 Educational apps will be allowed during homework hours regardless of other restrictions</small>
              </>
            )}
          </div>

          {/* School Hours Section */}
          <div className="settings-section">
            <div className="section-header">
              <h4><BookOpen size={18} /> School Hours Restrictions</h4>
              <label className="toggle">
                <input
                  type="checkbox"
                  name="schoolHours"
                  checked={formData.schoolHours}
                  onChange={handleChange}
                />
                <span>{formData.schoolHours ? 'ON' : 'OFF'}</span>
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

          {/* Break Intervals Section */}
          <div className="settings-section">
            <div className="section-header">
              <h4>⏸️ Enforce Breaks</h4>
              <label className="toggle">
                <input
                  type="checkbox"
                  name="allowBreak"
                  checked={formData.allowBreak}
                  onChange={handleChange}
                />
                <span>{formData.allowBreak ? 'ON' : 'OFF'}</span>
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
            <p>Screen time is tracked and enforced across all devices. Parents will receive notifications when limits are approaching.</p>
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
    </div>
  );
};

export default ScreenTimeSettingsPanel;
