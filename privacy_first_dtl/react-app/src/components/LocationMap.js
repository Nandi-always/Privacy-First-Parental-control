import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { locationService } from '../services/apiService';
import '../styles/Cards.css';

const LocationMap = ({ child }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('N/A');
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocationData = useCallback(async () => {
    if (!child?._id && !child?.id) {
      setError('No child selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const childId = child._id || child.id;
      
      // Fetch current location
      const res = await locationService.getCurrent(childId);
      if (res && res.data) {
        setLocation(res.data);
        setIsOnline(true);
        
        // Calculate time since last update
        if (res.data.timestamp) {
          const updateTime = new Date(res.data.timestamp);
          const now = new Date();
          const diffMinutes = Math.floor((now - updateTime) / 60000);
          if (diffMinutes < 1) {
            setLastUpdate('just now');
          } else if (diffMinutes < 60) {
            setLastUpdate(`${diffMinutes}m ago`);
          } else {
            const hours = Math.floor(diffMinutes / 60);
            setLastUpdate(`${hours}h ago`);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch location data', err);
      setError('Failed to load location data');
      setIsOnline(false);
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, [child]);

  useEffect(() => {
    fetchLocationData();
    // Refresh location every 30 seconds
    const interval = setInterval(fetchLocationData, 30000);
    return () => clearInterval(interval);
  }, [fetchLocationData]);

  const displayLocation = location?.address || 'Location unavailable';
  const accuracy = location?.accuracy || 15;

  return (
    <div className="card location-map">
      <div className="card-header">
        <div className="card-title-group">
          <MapPin size={20} className="card-icon" />
          <h3>{child?.name || 'Unknown'}'s Location</h3>
        </div>
        <button
          className="btn-icon"
          onClick={fetchLocationData}
          disabled={loading}
          title="Refresh location"
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}

      {loading && <p className="loading-text">⏳ Fetching location...</p>}

      <div className="map-container">
        <div className="map-placeholder">
          <MapPin size={48} className="map-marker" />
          <p>Real-time location tracking</p>
          {!loading && isOnline && (
            <p className="map-subtitle">Active & Tracking</p>
          )}
        </div>
      </div>

      <div className="location-details">
        <div className="detail-row">
          <span className="detail-label">📍 Location:</span>
          <span className="detail-value">{displayLocation}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">🕐 Last Update:</span>
          <span className="detail-value">{lastUpdate}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">📏 Accuracy:</span>
          <span className="detail-value">±{accuracy}m</span>
        </div>
        {location?.latitude && location?.longitude && (
          <div className="detail-row">
            <span className="detail-label">📡 Coordinates:</span>
            <span className="detail-value">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
          </div>
        )}
      </div>

      <div className="location-status">
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
        <span className="status-text">{isOnline ? '✅ Device Online' : '⚪ Device Offline'}</span>
      </div>
    </div>
  );
};

export default LocationMap;
