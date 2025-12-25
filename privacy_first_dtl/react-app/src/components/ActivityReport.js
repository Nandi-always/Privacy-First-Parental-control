import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import '../styles/Cards.css';

const ActivityReport = ({ activities = [] }) => {
  const mockActivities = activities.length ? activities : [
    { date: 'Today', sessions: 12, totalTime: 150 },
    { date: 'Yesterday', sessions: 14, totalTime: 165 },
    { date: '3 days ago', sessions: 10, totalTime: 145 },
    { date: '4 days ago', sessions: 13, totalTime: 160 },
    { date: '5 days ago', sessions: 11, totalTime: 155 },
  ];

  const avgTime = Math.round(
    mockActivities.reduce((sum, a) => sum + a.totalTime, 0) / mockActivities.length
  );

  return (
    <div className="card activity-report">
      <div className="card-header">
        <div className="card-title-group">
          <BarChart3 size={20} className="card-icon" />
          <h3>Activity Report</h3>
        </div>
        <TrendingUp size={18} className="trend-icon" />
      </div>

      <div className="report-summary">
        <div className="summary-item">
          <span className="summary-label">Average Daily Time</span>
          <span className="summary-value">{avgTime} min</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Sessions (7 days)</span>
          <span className="summary-value">
            {mockActivities.reduce((sum, a) => sum + a.sessions, 0)}
          </span>
        </div>
      </div>

      <div className="activity-timeline">
        <h4 className="timeline-title">Weekly Activity</h4>
        <div className="timeline-list">
          {mockActivities.map((activity, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-date">{activity.date}</div>
              <div className="timeline-stats">
                <span className="stat">{activity.sessions} sessions</span>
                <span className="stat">{activity.totalTime} mins</span>
              </div>
              <div className="timeline-bar">
                <div 
                  className="timeline-progress"
                  style={{ width: `${(activity.totalTime / 180) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityReport;
