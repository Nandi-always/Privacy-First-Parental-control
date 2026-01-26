import React, { useState } from 'react';
import { Send, X, AlertTriangle, ShieldAlert, MessageCircle } from 'lucide-react';
import { notificationsService } from '../services/apiService';
import '../styles/Modal.css';

const SendAlertModal = ({ isOpen, onClose, user, childrenList }) => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('message');
    const [receiverId, setReceiverId] = useState(user?.role === 'child' ? user.parentId : (childrenList?.[0]?._id || ''));
    const [loading, setLoading] = useState(false);

    // Sync receiverId when childrenList loads or changes
    React.useEffect(() => {
        if (user?.role === 'parent' && childrenList?.length > 0 && !receiverId) {
            setReceiverId(childrenList[0]._id || childrenList[0].id);
        }
    }, [childrenList, user, receiverId]);

    // Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setMessage('');
            if (user?.role === 'parent' && childrenList?.length > 0) {
                setReceiverId(childrenList[0]._id || childrenList[0].id);
            }
        }
    }, [isOpen, childrenList, user]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('📤 Sending message:', { receiverId, message, type });

        if (!message || !receiverId) {
            console.error('❌ Missing data:', { message, receiverId });
            alert('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const response = await notificationsService.send({
                receiverId,
                message,
                type
            });
            console.log('✅ Message sent successfully:', response.data);
            alert('Message sent successfully!');
            setMessage('');
            onClose();
        } catch (err) {
            console.error('❌ Failed to send notification:', err);
            console.error('Error details:', err.response?.data || err.message);
            alert(`Failed to send message: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Send Alert / Message</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {user?.role === 'parent' && childrenList?.length > 1 && (
                        <div className="form-group">
                            <label>Select Child</label>
                            <select
                                value={receiverId}
                                onChange={(e) => setReceiverId(e.target.value)}
                                className="form-input"
                            >
                                {childrenList.map(child => (
                                    <option key={child._id} value={child._id}>{child.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Alert Type</label>
                        <div className="type-selector">
                            <button
                                type="button"
                                className={`type-btn ${type === 'message' ? 'active' : ''}`}
                                onClick={() => setType('message')}
                            >
                                <MessageCircle size={18} />
                                <span>Message</span>
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${type === 'alert' ? 'active' : ''}`}
                                onClick={() => setType('alert')}
                            >
                                <AlertTriangle size={18} />
                                <span>Alert</span>
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${type === 'emergency' ? 'active' : ''}`}
                                onClick={() => setType('emergency')}
                            >
                                <ShieldAlert size={18} />
                                <span>Emergency</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Message</label>
                        <textarea
                            className="form-input"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            required
                            rows="4"
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Sending...' : (
                            <>
                                <span>Send Now</span>
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SendAlertModal;
