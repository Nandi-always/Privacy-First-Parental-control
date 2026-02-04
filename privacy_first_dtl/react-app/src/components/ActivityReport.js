import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { screenTimeService } from '../services/apiService';
import '../styles/Cards.css';

const ActivityReport = ({ child }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivityReport = useCallback(async () => {
    if (!child?._id && !child?.id) return;
    try {
      setLoading(true);
      const childId = child._id || child.id;

      // Fetch 7-day screen time history
      const res = await screenTimeService.getHistory(childId, 7);

      if (res && res.data && res.data.length > 0) {
        // Format the data for display
        const formattedData = res.data.map(day => {
          const date = new Date(day.date);
          const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));

          let dateLabel;
          if (diffDays === 0) dateLabel = 'Today';
          else if (diffDays === 1) dateLabel = 'Yesterday';
          else dateLabel = `${diffDays} days ago`;

          return {
            date: dateLabel,
            sessions: day.appUsage?.length || 0,
            totalTime: day.totalTime || 0
          };
        });

        setActivities(formattedData);
      } else {
        // Use demo data if no history available
        setActivities(getDemoActivities());
      }
    } catch (err) {
      console.error('Failed to fetch activity report', err);
      setActivities(getDemoActivities());
    } finally {
      setLoading(false);
    }
  }, [child]);

  const getDemoActivities = () => [
    { date: 'Today', sessions: 5, totalTime: 145 },
    { date: 'Yesterday', sessions: 4, totalTime: 168 },
    { date: '2 days ago', sessions: 6, totalTime: 192 },
    { date: '3 days ago', sessions: 3, totalTime: 143 },
    { date: '4 days ago', sessions: 5, totalTime: 156 },
    { date: '5 days ago', sessions: 4, totalTime: 175 },
    { date: '6 days ago', sessions: 5, totalTime: 189 },
  ];

  useEffect(() => {
    fetchActivityReport();
  }, [child?.id, child?._id, fetchActivityReport]);

  const displayActivities = activities.length ? activities : getDemoActivities();

  const avgTime = Math.round(
    displayActivities.reduce((sum, a) => sum + a.totalTime, 0) / displayActivities.length
  );

  return (
    <div className="card activity-report">
      <div className="card-header">
        <div className="card-title-group">
          <BarChart3 size={20} className="card-icon" />
          <h3>Activity Report</h3>
          {child && <span className="child-name">for {child.name}</span>}
        </div>
        <TrendingUp size={18} className="trend-icon" />
      </div>

      {loading ? (
        <p className="loading-text">Loading activity...</p>
      ) : (
        <>
          <div className="report-summary">
            <div className="summary-item">
              <span className="summary-label">Average Daily Time</span>
              <span className="summary-value">{avgTime} min</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Sessions (7 days)</span>
              <span className="summary-value">
                {displayActivities.reduce((sum, a) => sum + a.sessions, 0)}
              </span>
            </div>
          </div>

          <div className="activity-timeline">
            <h4 className="timeline-title">Weekly Activity</h4>
            <div className="timeline-list">
              {displayActivities.map((activity, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-date">{activity.date}</div>
                  <div className="timeline-stats">
                    <span className="stat">{activity.sessions} sessions</span>
                    <span className="stat">{activity.totalTime} mins</span>
                  </div>
                  <div className="timeline-bar">
                    <div
                      className="timeline-progress"
                      style={{ width: `${Math.min((activity.totalTime / 240) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityReport;
