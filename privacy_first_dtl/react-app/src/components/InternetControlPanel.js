import React, { useState, useEffect } from 'react';
import { Power, AlertCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import '../styles/Cards.css';

const InternetControlPanel = ({ childId }) => {
  const notify = useNotification();
  const [isInternetPaused, setIsInternetPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pausedUntil, setPausedUntil] = useState(null);

  const handleToggleInternet = async () => {
    try {
      setLoading(true);
      
      if (isInternetPaused) {
        // Resume internet
        // await apiCall to resume
        notify.success('Internet resumed!');
        setIsInternetPaused(false);
        setPausedUntil(null);
      } else {
        // Pause internet - show duration selector
        const duration = prompt('Pause internet for how many minutes?', '30');
        if (duration) {
          // await apiCall to pause with duration
          const until = new Date(Date.now() + parseInt(duration) * 60000);
          setPausedUntil(until);
          setIsInternetPaused(true);
          notify.success(`Internet paused for ${duration} minutes!`);
        }
      }
    } catch (err) {
      notify.error('Failed to control internet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card internet-control ${isInternetPaused ? 'paused' : ''}`}>
      <div className="card-header">
        <h3>🌐 Internet Control</h3>
      </div>

      <div className="control-panel">
        <div className="status-display">
          <div className={`status-indicator ${isInternetPaused ? 'paused' : 'active'}`}>
            <Power size={24} />
          </div>
          <div className="status-text">
            <p className="status-title">
              {isInternetPaused ? 'Internet Paused' : 'Internet Active'}
            </p>
            {pausedUntil && (
              <p className="status-info">
                Resumes at {pausedUntil.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <button
          className={`btn ${isInternetPaused ? 'btn-success' : 'btn-danger'}`}
          onClick={handleToggleInternet}
          disabled={loading}
        >
          <Power size={18} />
          {isInternetPaused ? 'Resume Internet' : 'Pause Internet'}
        </button>

        <div className="control-info">
          <AlertCircle size={18} />
          <p>
            {isInternetPaused 
              ? 'Child cannot access internet. This will override all app settings.'
              : 'Child has full internet access. Apps and websites rules still apply.'
            }
          </p>
        </div>

        {/* Quick Pause Options */}
        <div className="quick-options">
          <h4>Quick Pause Duration</h4>
          <div className="button-group">
            <button
              className="btn btn-sm"
              onClick={() => {
                setPausedUntil(new Date(Date.now() + 15 * 60000));
                setIsInternetPaused(true);
                notify.success('Internet paused for 15 minutes!');
              }}
            >
              15 min
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                setPausedUntil(new Date(Date.now() + 30 * 60000));
                setIsInternetPaused(true);
                notify.success('Internet paused for 30 minutes!');
              }}
            >
              30 min
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                setPausedUntil(new Date(Date.now() + 60 * 60000));
                setIsInternetPaused(true);
                notify.success('Internet paused for 1 hour!');
              }}
            >
              1 hour
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                setPausedUntil(new Date(Date.now() + 24 * 60 * 60000));
                setIsInternetPaused(true);
                notify.success('Internet paused for 24 hours!');
              }}
            >
              24 hours
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternetControlPanel;
