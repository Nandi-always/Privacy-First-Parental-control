import React from 'react';
import { Shield, AlertTriangle, Home } from 'lucide-react';
import '../styles/BlockedWebsite.css';

const BlockedWebsiteScreen = ({ website, reason, category, onRequestAccess, onGoHome }) => {
    const getCategoryMessage = () => {
        const messages = {
            social_media: "Social media sites are restricted to help you focus and stay safe online.",
            adult_content: "This content is not appropriate for your age group.",
            gaming: "Gaming sites are limited to ensure balanced screen time.",
            shopping: "Shopping sites are restricted to prevent unauthorized purchases.",
            streaming: "Streaming is limited during certain hours.",
            other: "This website has been restricted by your parent."
        };
        return messages[category] || messages.other;
    };

    const getSuggestedActivities = () => [
        { icon: '📚', text: 'Read an educational article' },
        { icon: '🎨', text: 'Try a creative activity' },
        { icon: '🏃', text: 'Take a movement break' },
        { icon: '👨‍👩‍👧', text: 'Spend time with family' }
    ];

    return (
        <div className="blocked-website-screen">
            <div className="blocked-content">
                <div className="blocked-icon">
                    <Shield size={64} />
                </div>

                <h1>This Website is Blocked</h1>

                <div className="blocked-website-name">
                    🚫 {website}
                </div>

                <p className="blocked-reason">
                    {reason || getCategoryMessage()}
                </p>

                <div className="blocked-info-card">
                    <AlertTriangle size={20} />
                    <p>
                        Your parent has set up this filter to help keep you safe online.
                        If you think this is a mistake, you can request access.
                    </p>
                </div>

                <div className="blocked-actions">
                    <button className="btn-request-access" onClick={onRequestAccess}>
                        📩 Ask Parent for Access
                    </button>
                    <button className="btn-go-home" onClick={onGoHome}>
                        <Home size={18} /> Go to Dashboard
                    </button>
                </div>

                <div className="suggested-activities">
                    <h3>Instead, try one of these:</h3>
                    <div className="activities-grid">
                        {getSuggestedActivities().map((activity, idx) => (
                            <div key={idx} className="activity-item">
                                <span className="activity-icon">{activity.icon}</span>
                                <span>{activity.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="privacy-note">
                    <Shield size={16} />
                    <span>Your privacy is protected. No personal data is shared.</span>
                </div>
            </div>
        </div>
    );
};

export default BlockedWebsiteScreen;
