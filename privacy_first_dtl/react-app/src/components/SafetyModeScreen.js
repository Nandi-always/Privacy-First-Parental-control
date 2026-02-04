import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { emergencyService } from '../services/apiService';
import '../styles/SafetyMode.css';

const SafetyModeScreen = ({ alert, childId }) => {
    const [location, setLocation] = useState(null);
    const [lastSync, setLastSync] = useState(new Date());
    const [isReporting, setIsReporting] = useState(false);
    const [isMarkingSafe, setIsMarkingSafe] = useState(false);

    // Track location during safety mode
    useEffect(() => {
        let watchId = null;

        const startTracking = () => {
            if ('geolocation' in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        const { latitude, longitude, accuracy } = position.coords;
                        setLocation({ latitude, longitude, accuracy });

                        // Sync with backend
                        try {
                            setIsReporting(true);
                            await emergencyService.updateLocation(alert._id, {
                                latitude,
                                longitude,
                                accuracy
                            });
                            setLastSync(new Date());
                        } catch (err) {
                            console.error('Failed to sync emergency location', err);
                        } finally {
                            setIsReporting(false);
                        }
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }
        };

        startTracking();

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [alert._id]);

    const handleMarkSafe = async () => {
        try {
            setIsMarkingSafe(true);
            await emergencyService.markSafe(alert._id, {
                markedBy: 'child',
                incidentType: 'resolved_safely',
                incidentNotes: 'Child manually marked themselves as safe from dashboard.'
            });
            // The polling in ChildDashboard will detect the resolution and close this screen
        } catch (err) {
            console.error('Failed to mark as safe', err);
        } finally {
            setIsMarkingSafe(false);
        }
    };

    return (
        <div className="safety-mode-screen">
            <div className="safety-mode-overlay">
                <div className="safety-mode-content">
                    <div className="safety-header">
                        <AlertCircle size={48} className="pulse-icon" />
                        <h1>Safety Mode Enabled</h1>
                        <p>Your parents have been notified and can see your location.</p>
                    </div>

                    <div className="safety-status-grid">
                        <div className="status-card alert-sent">
                            <Shield size={24} />
                            <div>
                                <strong>Protection Mode</strong>
                                <p>Active - Restrictions Bypassed</p>
                            </div>
                        </div>
                        <div className="status-card tracking-active">
                            <MapPin size={24} className={isReporting ? 'spin' : ''} />
                            <div>
                                <strong>Live Tracking</strong>
                                <p>{isReporting ? 'Updating...' : `Last sync: ${lastSync.toLocaleTimeString()}`}</p>
                            </div>
                        </div>
                    </div>

                    <div className="restrictions-notice">
                        <CheckCircle size={20} />
                        <div>
                            <strong>Safety Override Active</strong>
                            <p>All app and website restrictions have been temporarily paused for your safety.</p>
                        </div>
                    </div>

                    <div className="emergency-info">
                        <h3>Stay Safe</h3>
                        <ul>
                            <li>✓ Stay in a safe, well-lit area</li>
                            <li>✓ Keep your phone charged</li>
                            <li>✓ Wait for your parents to contact you</li>
                        </ul>
                    </div>

                    <button
                        className="mark-safe-btn"
                        onClick={handleMarkSafe}
                        disabled={isMarkingSafe}
                    >
                        {isMarkingSafe ? 'Updating Status...' : "I'M SAFE NOW"}
                    </button>

                    <div className="emergency-contact">
                        <p>Need immediate help?</p>
                        <a href="tel:911" className="emergency-number">
                            CALL 911
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyModeScreen;
