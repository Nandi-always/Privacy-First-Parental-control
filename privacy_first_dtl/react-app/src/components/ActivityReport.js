import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { reportsService } from '../services/apiService';
import '../styles/Cards.css';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ActivityReport = ({ child }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivityReport = useCallback(async () => {
    if (!child?._id && !child?.id) return;
    try {
      setLoading(true);
      const childId = child._id || child.id;
      const res = await reportsService.getActivity(childId);
      setActivities(res.data || []);
    } catch (err) {
      console.error('Failed to fetch activity report', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [child]);

  useEffect(() => {
    fetchActivityReport();
  }, [child?.id, child?._id, fetchActivityReport]);

  const mockActivities = activities.length ? activities : [
    { date: 'Mon', sessions: 12, totalTime: 150 },
    { date: 'Tue', sessions: 14, totalTime: 165 },
    { date: 'Wed', sessions: 10, totalTime: 145 },
    { date: 'Thu', sessions: 13, totalTime: 160 },
    { date: 'Fri', sessions: 11, totalTime: 155 },
    { date: 'Sat', sessions: 8, totalTime: 120 },
    { date: 'Sun', sessions: 9, totalTime: 130 },
  ];

  const avgTime = Math.round(
    mockActivities.reduce((sum, a) => sum + a.totalTime, 0) / mockActivities.length
  );

  const chartData = {
    labels: mockActivities.map(a => a.date),
    datasets: [
      {
        label: 'Screen Time (mins)',
        data: mockActivities.map(a => a.totalTime),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { stepSize: 30 }
      }
    }
  };

  return (
    <div className="card activity-report">
      <div className="card-header">
        <div className="card-title-group">
          <BarChart3 size={20} className="card-icon" />
          <h3>Activity Trends</h3>
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
              <span className="summary-value" style={{ color: '#3b82f6' }}>{avgTime} min</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Sessions (7 days)</span>
              <span className="summary-value" style={{ color: '#10b981' }}>
                {mockActivities.reduce((sum, a) => sum + a.sessions, 0)}
              </span>
            </div>
          </div>

          <div className="activity-timeline" style={{ marginTop: '20px' }}>
            <h4 className="timeline-title" style={{ marginBottom: '16px', fontSize: '14px', color: '#64748b' }}>Weekly Trend</h4>
            <div style={{ height: '220px', width: '100%' }}>
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="timeline-legend" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                <span>Time Spent</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityReport;
