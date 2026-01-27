import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { AlertTriangle, Phone, CheckCircle, Navigation, Clock } from 'lucide-react';
import { emergencyService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to auto-center map on new coordinates
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const EmergencyTracker = ({ alert, onMarkSafe, onMarkCalled }) => {
    const notify = useNotification();
    const [currentLocation, setCurrentLocation] = useState({
        lat: alert.latitude,
        lng: alert.longitude
    });
    const [locationHistory, setLocationHistory] = useState(alert.locationUpdates || []);
    const [tracking, setTracking] = useState(alert.isTrackingActive);

    // Simulate real-time location updates (in production, this would be WebSocket)
    useEffect(() => {
        if (!tracking) return;

        const interval = setInterval(async () => {
            // In production, child device would send location updates
            // For demo, we'll just show the current location
            try {
                const res = await emergencyService.getAlerts(alert.child);
                const updatedAlert = res.data.find(a => a._id === alert._id);
                if (updatedAlert) {
                    setCurrentLocation({
                        lat: updatedAlert.latitude,
                        lng: updatedAlert.longitude
                    });
                    setLocationHistory(updatedAlert.locationUpdates || []);
                }
            } catch (err) {
                console.error('Failed to fetch location updates', err);
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, [tracking, alert]);

    const handleMarkCalled = async () => {
        try {
            await emergencyService.markCalled(alert._id);
            notify.success('Call logged');
            if (onMarkCalled) onMarkCalled();
        } catch (err) {
            notify.error('Failed to log call');
        }
    };

    const handleMarkSafe = async () => {
        try {
            await emergencyService.markSafe(alert._id, {
                markedBy: 'parent',
                incidentType: 'resolved_safely',
                incidentNotes: 'Situation resolved'
            });
            notify.success('Marked as safe');
            setTracking(false);
            if (onMarkSafe) onMarkSafe();
        } catch (err) {
            notify.error('Failed to mark as safe');
        }
    };

    const timeSinceAlert = () => {
        const diff = Date.now() - new Date(alert.timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="emergency-tracker" style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            marginBottom: '24px'
        }}>
            {/* Alert Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <AlertTriangle size={40} />
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>🆘 EMERGENCY ALERT ACTIVE</h2>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                        {alert.message} • {timeSinceAlert()}
                    </p>
                </div>
            </div>

            {/* Safety Mode Badge */}
            {alert.safetyModeActive && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <CheckCircle size={20} />
                    <span>Safety Mode Active - All restrictions bypassed for emergency</span>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {!alert.parentCalledAt && (
                    <button
                        onClick={handleMarkCalled}
                        style={{
                            background: 'white',
                            color: '#dc2626',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Phone size={18} /> I Called Child
                    </button>
                )}
                {alert.parentCalledAt && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Phone size={18} />
                        Called at {new Date(alert.parentCalledAt).toLocaleTimeString()}
                    </div>
                )}

                {!alert.resolved && (
                    <button
                        onClick={handleMarkSafe}
                        style={{
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <CheckCircle size={18} /> Mark as Safe
                    </button>
                )}
            </div>

            {/* Real-time Map */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '400px',
                marginBottom: '16px'
            }}>
                <MapContainer
                    center={[currentLocation.lat, currentLocation.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                >
                    <ChangeView center={[currentLocation.lat, currentLocation.lng]} zoom={15} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Current Location */}
                    <Marker position={[currentLocation.lat, currentLocation.lng]}>
                        <Popup>
                            <strong>Current Location</strong><br />
                            Last updated: {new Date().toLocaleTimeString()}
                        </Popup>
                    </Marker>

                    {/* Location History Trail */}
                    {locationHistory.map((loc, idx) => (
                        <Circle
                            key={idx}
                            center={[loc.latitude, loc.longitude]}
                            radius={20}
                            pathOptions={{ color: '#dc2626', fillColor: '#fca5a5', fillOpacity: 0.5 }}
                        />
                    ))}
                </MapContainer>
            </div>

            {/* Tracking Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                {tracking ? (
                    <>
                        <Navigation size={16} className="pulse" />
                        <span>Real-time tracking active • {locationHistory.length} location updates</span>
                    </>
                ) : (
                    <>
                        <Clock size={16} />
                        <span>Tracking stopped • Incident resolved</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmergencyTracker;
