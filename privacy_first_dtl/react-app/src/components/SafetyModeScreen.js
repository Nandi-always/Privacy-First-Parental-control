import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { emergencyService } from '../services/apiService';
import '../styles/SafetyMode.css';

const SafetyModeScreen = ({ alert, childId, onMarkSafe }) => {
    const [isMarkingSafe, setIsMarkingSafe] = useState(false);

    const handleMarkSafe = async () => {
        try {
            setIsMarkingSafe(true);
            await emergencyService.markSafe(alert._id, {
                markedBy: 'child',
                incidentType: 'resolved_safely',
                incidentNotes: 'Child manually marked themselves as safe from dashboard.'
            });
            // ✅ Immediately exit Safety Mode screen
            if (onMarkSafe) {
                onMarkSafe();
            }
            // The polling in ChildDashboard will also detect the resolution as a backup
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
                        <p>Your parents have been notified.</p>
                    </div>

                    <div className="safety-status-grid">
                        <div className="status-card alert-sent">
                            <Shield size={24} />
                            <div>
                                <strong>Protection Mode</strong>
                                <p>Active - Restrictions Bypassed</p>
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
