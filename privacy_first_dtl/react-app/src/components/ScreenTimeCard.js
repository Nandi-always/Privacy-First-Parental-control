import React, { useState, useEffect, useCallback } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { screenTimeService } from '../services/apiService';
import '../styles/Cards.css';

const ScreenTimeCard = ({ child, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(480); // Default 8 hours

  const fetchScreenTimeData = useCallback(async () => {
    if (!child?._id && !child?.id) return;

    try {
      setLoading(true);
      const childId = child._id || child.id;

      // Fetch TODAY's screen time usage
      const res = await screenTimeService.getDaily(childId);
      if (res && res.data) {
        // Use actual data from backend
        const dailyData = res.data;
        setUsed(dailyData.totalTime || 0); // in minutes
        setLimit(dailyData.dailyLimit || child.dailyScreenTimeLimit || 480);
      }
    } catch (err) {
      console.error('Failed to fetch screen time data', err);
      // Show demo data for presentation
      setUsed(145); // 2h 25m used
      setLimit(480); // 8h limit
    } finally {
      setLoading(false);
    }
  }, [child]);

  useEffect(() => {
    fetchScreenTimeData();
  }, [fetchScreenTimeData]);

  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isWarning = percentage > 80;
  const isDanger = percentage > 95;

  return (
    <div className={`card screen-time-card ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
      <div className="card-header">
        <div className="card-title-group">
          <Clock size={20} className="card-icon" />
          <h3>Screen Time - {child?.name || 'Unknown'}</h3>
        </div>
        {isDanger && <AlertCircle size={18} className="alert-icon" />}
      </div>

      {loading && <p className="loading-text">Loading...</p>}

      <div className="time-display">
        <div className="time-value">{used}m</div>
        <div className="time-label">of {limit}m</div>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill ${isDanger ? 'danger' : isWarning ? 'warning' : 'normal'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>

      <div className="time-stats">
        <span className="time-remaining">
          {Math.max(limit - used, 0)} mins left
        </span>
        <span className="time-percentage">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default ScreenTimeCard;
