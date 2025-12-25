import React from 'react';
import { Shield } from 'lucide-react';
import '../styles/Cards.css';

const PrivacyScoreCard = ({ score = 85 }) => {
  const getScoreColor = (s) => {
    if (s >= 80) return 'excellent';
    if (s >= 60) return 'good';
    if (s >= 40) return 'fair';
    return 'poor';
  };

  const getScoreLabel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const color = getScoreColor(score);

  return (
    <div className={`card privacy-score-card ${color}`}>
      <div className="card-header">
        <div className="card-title-group">
          <Shield size={20} className="card-icon" />
          <h3>Privacy Score</h3>
        </div>
      </div>

      <div className="circular-progress">
        <svg className="progress-ring" viewBox="0 0 120 120">
          <circle className="progress-bg" cx="60" cy="60" r="55" />
          <circle 
            className={`progress-ring-circle ${color}`}
            cx="60" 
            cy="60" 
            r="55"
            style={{
              strokeDashoffset: 345 - (score / 100) * 345
            }}
          />
        </svg>
        <div className="progress-text">
          <span className="score-number">{score}</span>
          <span className="score-label">/ 100</span>
        </div>
      </div>

      <p className="score-status">{getScoreLabel(score)}</p>
      <p className="score-description">Your privacy settings are protecting you well</p>
    </div>
  );
};

export default PrivacyScoreCard;
