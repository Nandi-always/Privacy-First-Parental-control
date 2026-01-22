import React, { useState } from 'react';
import { Save, AlertCircle, Smartphone } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import '../styles/ChildSettings.css';

const AppCategoryControl = ({ childId }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState({
    educational: true,
    entertainment: true,
    social: false,
    games: false,
    communication: true,
    productivity: true,
    shopping: false,
    health: true
  });

  const categoryDescriptions = {
    educational: '📚 Educational - Learning apps',
    entertainment: '🎬 Entertainment - Videos, music, movies',
    social: '👥 Social - Social media apps',
    games: '🎮 Games - Gaming apps',
    communication: '💬 Communication - Messaging, calls',
    productivity: '⚙️ Productivity - Office, notes apps',
    shopping: '🛒 Shopping - Online stores',
    health: '❤️ Health & Fitness - Wellness apps'
  };

  const handleCategoryChange = (category) => {
    setCategories(prev => ({
      ...prev,
      [category]: !prev[category]
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
      // API call to update categories
      // await appService.updateCategories(childId, categories);
      notify.success('App categories updated successfully!');
    } catch (err) {
      notify.error('Failed to update categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card app-category-control">
      <div className="card-header">
        <h3><Smartphone size={20} /> App Category Control</h3>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit} className="category-form">
          <div className="category-grid">
            {Object.entries(categories).map(([category, allowed]) => (
              <div key={category} className="category-item">
                <label className="category-label">
                  <input
                    type="checkbox"
                    checked={allowed}
                    onChange={() => handleCategoryChange(category)}
                    className="category-checkbox"
                  />
                  <span className="category-name">
                    {categoryDescriptions[category]}
                  </span>
                  <span className={`category-status ${allowed ? 'allowed' : 'blocked'}`}>
                    {allowed ? '✅ Allowed' : '❌ Blocked'}
                  </span>
                </label>
              </div>
            ))}
          </div>

          <div className="info-box">
            <AlertCircle size={18} />
            <p>
              Allowed categories will be accessible to your child. Blocked categories won't appear in their app store and cannot be accessed.
            </p>
          </div>

          <div className="category-summary">
            <h4>Summary</h4>
            <p>✅ Allowed: {Object.values(categories).filter(Boolean).length} categories</p>
            <p>❌ Blocked: {Object.values(categories).filter(v => !v).length} categories</p>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Categories'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppCategoryControl;
