import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Compass } from 'lucide-react';
import { locationService } from '../services/apiService';
import '../styles/Cards.css';

const LocationMap = ({ child }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('N/A');
  const [isOnline, setIsOnline] = useState(false);

  const fetchLocationData = useCallback(async () => {
    if (!child?._id && !child?.id) return;

    try {
      setLoading(true);
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
            setLastUpdate(`${diffMinutes} minutes ago`);
          } else {
            setLastUpdate(`${Math.floor(diffMinutes / 60)} hours ago`);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch location data', err);
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
        <Compass size={18} />
      </div>

      {loading && <p className="loading-text">Loading location...</p>}

      <div className="map-container">
        <div className="map-placeholder">
          <MapPin size={48} className="map-marker" />
          <p>Real-time location tracking</p>
        </div>
      </div>

      <div className="location-details">
        <div className="detail-row">
          <span className="detail-label">Current Location:</span>
          <span className="detail-value">{displayLocation}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Last Update:</span>
          <span className="detail-value">{lastUpdate}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Accuracy:</span>
          <span className="detail-value">±{accuracy} meters</span>
        </div>
      </div>

      <div className="location-status">
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
        <span className="status-text">{isOnline ? 'Device Online' : 'Device Offline'}</span>
      </div>
    </div>
  );
};

export default LocationMap;
