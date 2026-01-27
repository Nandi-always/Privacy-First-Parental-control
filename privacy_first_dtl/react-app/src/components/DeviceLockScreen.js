import React from 'react';
import { Lock, Clock, AlertTriangle } from 'lucide-react';
import '../styles/DeviceLockScreen.css';

const DeviceLockScreen = ({ lockReason, warningMessage, bedtimeEnd, remainingTime }) => {
    const getLockIcon = () => {
        switch (lockReason) {
            case 'bedtime':
                return '🌙';
            case 'school_hours':
                return '📚';
            case 'screen_time_exceeded':
                return '⏰';
            case 'parent_paused':
                return '⏸️';
            default:
                return '🔒';
        }
    };

    const getLockTitle = () => {
        switch (lockReason) {
            case 'bedtime':
                return 'Bedtime Mode';
            case 'school_hours':
                return 'School Hours';
            case 'screen_time_exceeded':
                return 'Screen Time Limit Reached';
            case 'parent_paused':
                return 'Device Paused';
            default:
                return 'Device Locked';
        }
    };

    const getLockMessage = () => {
        if (warningMessage) return warningMessage;

        switch (lockReason) {
            case 'bedtime':
                return `Time to rest! Your device will be available again at ${bedtimeEnd || '6:00 AM'}`;
            case 'school_hours':
                return 'Focus on your studies! Your device is restricted during school hours.';
            case 'screen_time_exceeded':
                return 'You\'ve used all your screen time for today. Great job managing your time!';
            case 'parent_paused':
                return 'Your parent has paused internet access. Please check with them.';
            default:
                return 'Your device is currently locked.';
        }
    };

    return (
        <div className="device-lock-screen">
            <div className="lock-overlay">
                <div className="lock-content">
                    <div className="lock-icon">{getLockIcon()}</div>
                    <h1 className="lock-title">{getLockTitle()}</h1>
                    <p className="lock-message">{getLockMessage()}</p>

                    {lockReason === 'bedtime' && bedtimeEnd && (
                        <div className="unlock-time">
                            <Clock size={20} />
                            <span>Available at {bedtimeEnd}</span>
                        </div>
                    )}

                    {lockReason === 'screen_time_exceeded' && (
                        <div className="encouragement">
                            <p>💪 Why not try:</p>
                            <ul>
                                <li>Reading a book</li>
                                <li>Playing outside</li>
                                <li>Spending time with family</li>
                                <li>Working on a hobby</li>
                            </ul>
                        </div>
                    )}

                    <div className="emergency-contact">
                        <AlertTriangle size={16} />
                        <span>In case of emergency, contact your parent</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceLockScreen;
