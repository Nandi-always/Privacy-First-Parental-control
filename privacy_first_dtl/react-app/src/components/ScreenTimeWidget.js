import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import '../styles/Cards.css';

const ScreenTimeWidget = ({ activities = [] }) => {
  const mockActivities = activities.length ? activities : [
    { app: 'YouTube', time: 45, percentage: 30, color: '#FF0000' },
    { app: 'TikTok', time: 30, percentage: 20, color: '#000000' },
    { app: 'Instagram', time: 28, percentage: 19, color: '#E4405F' },
    { app: 'Games', time: 27, percentage: 18, color: '#7C3AED' },
    { app: 'Other', time: 20, percentage: 13, color: '#6B7280' },
  ];

  const totalTime = mockActivities.reduce((sum, a) => sum + a.time, 0);

  return (
    <div className="card screen-time-widget">
      <div className="card-header">
        <div className="card-title-group">
          <Activity size={20} className="card-icon" />
          <h3>Today's Activity</h3>
        </div>
        <TrendingUp size={18} className="trend-icon" />
      </div>

      <div className="total-time">
        <span className="time-label">Total Time Today:</span>
        <span className="time-value">{totalTime} minutes</span>
      </div>

      <div className="activity-list">
        {mockActivities.map((activity, idx) => (
          <div key={idx} className="activity-item">
            <div className="activity-info">
              <div className="activity-name">{activity.app}</div>
              <div className="activity-time">{activity.time} min</div>
            </div>
            <div className="activity-bar">
              <div 
                className="activity-progress"
                style={{ 
                  width: `${activity.percentage}%`,
                  backgroundColor: activity.color
                }}
              ></div>
            </div>
            <div className="activity-percentage">{activity.percentage}%</div>
          </div>
        ))}
      </div>

      <div className="widget-footer">
        <p className="footer-text">Usage breakdown for today</p>
      </div>
    </div>
  );
};

export default ScreenTimeWidget;
