import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import '../styles/Cards.css';

const ScreenTimeCard = ({ title, used, limit, children }) => {
  const percentage = (used / limit) * 100;
  const isWarning = percentage > 80;
  const isDanger = percentage > 95;

  return (
    <div className={`card screen-time-card ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
      <div className="card-header">
        <div className="card-title-group">
          <Clock size={20} className="card-icon" />
          <h3>{title}</h3>
        </div>
        {isDanger && <AlertCircle size={18} className="alert-icon" />}
      </div>

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
          {limit - used} mins left
        </span>
        <span className="time-percentage">{Math.round(percentage)}%</span>
      </div>

      {children}
    </div>
  );
};

export default ScreenTimeCard;
