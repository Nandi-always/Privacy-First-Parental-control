import React from 'react';
import { MapPin, Compass } from 'lucide-react';
import '../styles/Cards.css';

const LocationMap = ({ childName = 'Alex', accuracy = 15 }) => {
  return (
    <div className="card location-map">
      <div className="card-header">
        <div className="card-title-group">
          <MapPin size={20} className="card-icon" />
          <h3>{childName}'s Location</h3>
        </div>
        <Compass size={18} />
      </div>

      <div className="map-container">
        <div className="map-placeholder">
          <MapPin size={48} className="map-marker" />
          <p>Real-time location tracking</p>
        </div>
      </div>

      <div className="location-details">
        <div className="detail-row">
          <span className="detail-label">Current Location:</span>
          <span className="detail-value">School Campus, City</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Last Update:</span>
          <span className="detail-value">2 minutes ago</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Accuracy:</span>
          <span className="detail-value">±{accuracy} meters</span>
        </div>
      </div>

      <div className="location-status">
        <div className="status-indicator online"></div>
        <span className="status-text">Device Online</span>
      </div>
    </div>
  );
};

export default LocationMap;
